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

const { now } = require('nest/helpers');

// Default time to live.
const DEFAULT_TTL = 3600;

class Cache {
	#cache;

	constructor () {
		this.#cache = new Map();
	}

	#build (v, t) {
		return {value: v, expiration: t ? now() + t : 0};
	}

	dump () {
		return Object.fromEntries(this.#cache);
	}

	get (key) {
		const data = this.#cache.get(key);
		if (data) {
			if (data.expiration && data.expiration < now()) {
				this.unset(key);
			} else {
				return data.value;
			}
		}
	}

	has (key) {
		return this.get(key) !== undefined;
	}

	set (key, value, ttl = DEFAULT_TTL) {
		this.#cache.set(key, this.#build(value, ttl));
	}

	unset (key) {
		this.#cache.delete(key);
	}
}

module.exports = Cache;