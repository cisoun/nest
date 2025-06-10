# SQLite cache

> Module: `nest/cache-sqlite`  

Like [`nest/cache`](Cache.md), use this module to store data for a given amount of time in a SQLite database. The database can be stored in a file or in memory.

## Usage

```js
const Cache = require('nest/cache-sqlite');
const cache = new Cache(':memory:');             // In memory.
const cache = new Cache('/path/to/database.db'); // In file.
cache.set('mykey', 'myValue'); 
```

## Methods

| Method                      | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `clear()`| (async) Clear the cache. |
| `dump()` | (async) Returns all data in cache. |
| `get(key)` | (async) Returns the value of a key. If key doesn't exist or is expired, returns `undefined`. |
| `has(key)` | (async) Returns `true` if a key exists, or `false`. |
| `set(key, value, ttl=3600)` | (async) Store a key with a given value. TTL is in seconds, 0 will store the key indefinitely. |
| `unset(key)` | (async) Delete a key from cache. |