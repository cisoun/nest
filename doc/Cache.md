# Cache

> Module : `nest/cache`

The cache provides a way to store data for a specific amount of time (by default: 1 hour) on memory.

## Usage

```js
const Cache = require('nest/cache');
const cache = new Cache();
cache.set('mykey', 'myValue'); 
```

## Methods

| Method                      | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| `dump()` | Returns all data in cache. |
| `get(key)`                  | Returns the value of a key. If key doesn't exist or is expired, returns `undefined`. |
| `has(key)` | Returns `true` if a key exists, or `false`. |
| `set(key, value, ttl=3600)` | Store a key with a given value. TTL is in seconds, 0 will store the key infinitely. |
| `unset(key)` | Delete a key from cache. |