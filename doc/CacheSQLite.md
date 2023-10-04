# SQLite cache

> Module: `nest/cache-sqlite`
> Requires: `node-sqlite3`

The SQLite cache is based upon `node-sqlite3`. It allows, like [`nest/cache`](Cache.md) to store data for a given amount of time in a SQLite database. The database can be stored in a file or in memory.

## Usage

```json
const Cache = require('nest/cache-sqlite');
const cache = new Cache(':memory:');             // In memory.
const cache = new Cache('/path/to/database.db'); // In file.
cache.set('mykey', 'myValue'); 
```

## Methods

| Method                      | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `clear()`| (async) Clear the cache. |
| `dump()` | (asnyc) Returns all data in cache. |
| `get(key)`            | (asnyc) Returns the value of a key. If key doesn't exist or is expired, returns `undefined`. |
| `has(key)` | (asnyc) Returns `true` if a key exists, or `false`. |
| `set(key, value, ttl=3600)` | (asnyc) Store a key with a given value. TTL is in seconds, 0 will store the key for infinity. |
| `unset(key)` | (asnyc) Delete a key from cache. |