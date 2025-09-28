/**
 * SQLite3 based cache.
 * @module Cache SQLite
 *
 * Usage:
 *
 *   Import:    const Cache = require('nest/cache-sqlite');
 *
 *   In file:   const cache = new Cache('file.db');
 *   In memory: const cache = new Cache(':memory:');
 *
 *   Get key:   await cache.get('mykey');
 *   Set key:   await cache.set('mykey', 'value');
 *   Check key: await cache.has('mykey');
 */

const { now }          = require('nest/helpers');
const { DatabaseSync } = require('node:sqlite');

const CLEAR_SQL  = 'DELETE FROM cache;';
const CREATE_SQL = `\
PRAGMA auto_vacuum = FULL;
CREATE TABLE IF NOT EXISTS cache (
	key TEXT PRIMARY KEY NOT NULL UNIQUE,
	value TEXT,
	expiration INTEGER
);`;
const DUMP_SQL   = 'SELECT * FROM cache;';
const GET_SQL    = 'SELECT key, value, expiration FROM cache WHERE key = ?;';
const HAS_SQL    = 'SELECT 1 FROM cache WHERE key = ?;';
const SET_SQL    = 'INSERT OR REPLACE INTO cache(key, value, expiration) VALUES(?, ?, ?);'
const UNSET_SQL  = 'DELETE FROM cache WHERE key = ?;';

// Default time to live.
const DEFAULT_TTL = 3600;

class Cache {
	constructor (path) {
		this.db = new DatabaseSync(path);
		this.db.exec(CREATE_SQL);
	}

	clear () {
		return this.db.exec(CLEAR_SQL);
	}

	close () {
		return new Promise((resolve, reject) => {
			try {
				this.db.close();
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	dump () {
		return new Promise((resolve, reject) => {
			try {
				resolve(this.db.prepare(DUMP_SQL).all());
			} catch (e) {
				reject(e);
			}
		});
	}

	get (key) {
		return new Promise((resolve, reject) => {
			try {
				const row = this.db.prepare(GET_SQL).get(key);
				if (row && row.expiration > now()) {
					resolve(row.value);
				}
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	has (key) {
		return new Promise((resolve, reject) => {
			try {
				resolve(this.db.prepare(HAS_SQL).get(key) !== undefined);
			} catch (e) {
				reject(e);
			}
		});
	}

	run (sql, ...args) {
		return new Promise((resolve, reject) => {
			try {
				resolve(this.db.prepare(sql).run(...args).changes > 0);
			} catch (e) {
				reject(e);
			}
		});
	}

	set (k, v, t = DEFAULT_TTL) {
		return this.run(SET_SQL, k, v, now() + t);
	}

	unset (key) {
		return this.run(UNSET_SQL, key);
	}
}

module.exports = Cache;
