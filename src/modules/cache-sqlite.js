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

const {now}      = require('nest/helpers');
const sqlite3    = require('sqlite3').verbose();

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
		this.db = new sqlite3.Database(path, (err) => {
			if (err) {
				throw new Error(err.message);
			}
		});
		this.db.exec(CREATE_SQL);
	}

	clear () {
		return this.run(CLEAR_SQL);
	}

	close () {
		this.db.close();
	}

	dump () {
		return new Promise((resolve, reject) => {
			this.db.all(DUMP_SQL, (err, rows) => {
				resolve(rows);
			});
		});
	}

	get (key) {
		return new Promise((resolve, reject) => {
			this.db.get(GET_SQL, key, (_, row) => {
				if (row) {
					if (row.expiration > now()) {
						resolve(row.value);
					}
					this.unset(key);
				}
				resolve();
			});
		});
	}

	has (key) {
		return new Promise((resolve, reject) => {
			this.db.get(HAS_SQL, key, (err, row) => {
				resolve(row !== undefined);
			});
		});
	}

	run (...args) {
		return new Promise((resolve, reject) => {
			this.db.run(...args, (err, row) => {
				if (err) {
					reject(err);
				} else {
					resolve(row);
				}
			});
		});
	}

	set (k, v, t = DEFAULT_TTL) {
		return this.run(SET_SQL, [k, v, now() + t]);
	}

	unset (key) {
		return this.run(UNSET_SQL, [key]);
	}
}

module.exports = Cache;