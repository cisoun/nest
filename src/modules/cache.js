/**
 * Memory based cache.
 * @module cache
 *
 * Usage:
 *
 *   Import:           const Cache = require('nest/cache');
 *
 *   Initilization:    const cache = new Cache();
 *
 *   Get key:          cache.get('mykey');
 *   Set key:          cache.set('mykey', 'value');
 *   Set key with TTL: cache.set('mykey', 'value', 3600);
 *   Unset key:        cache.unset('mykey');
 *   Check key:        cache.has('mykey');
 *
 *   Dump cache:       const data = cache.dump();
 */

const {now}      = require('nest/helpers');

// Default time to live.
const DEFAULT_TTL = 3600;

class Cache {
	#cache;

	constructor () {
		this.#cache = {};
	}

	#build (v, t) {
		return {value: v, expiration: t ? now() + t : 0};
	}

	#flushKey (key) {
		const data = this.#cache[key];
		if (data && data.expiration && data.expiration < now()) {
			this.unset(key);
		}
	}

	dump () {
		return this.#cache;
	}

	get (key) {
		if (this.has(key)) {
			return this.#cache[key].value;
		}
	}

	has (key) {
		this.#flushKey(key);
		return key in this.#cache;
	}

	set (key, value, ttl = DEFAULT_TTL) {
		this.#cache[key] = this.#build(value, ttl);
	}

	unset (key) {
		delete this.#cache[key];
	}
}

module.exports = Cache;