# Router

> Module: `nest/router`

Simple router implementation. Supports asynchronous middlewares.

> [!WARNING]
> Middlewares must be asynchronous to guarantee order of process.
> See example below for expected implementation.

## Usage

```js
const router = new Router();
 
// Add middleware that computes request time.
router.use(async (req, res, next) => {
	const d = Date.now();
	await next();
	console.log('Time: ${Date.now() - d} ms');
});

// Add fallback route (HTTP 404).
router.fallback = (req, res) => {
	res.code(404).text('not found');
};
 
// Add route.
router.register('GET', '/api/status', (req, res) => {
	res.text('ok');
});
```

## Properties

| Property   | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `fallback` | Fallback handler to set when route has not been found (HTTP 404). |

## Methods

| Method                            | Description                                                  |
| --------------------------------- | ------------------------------------------------------------ |
| `register(method, path, handler)` | Register a route for a specific method and path.             |
| `use(middleware)`                 | Use a middleware. Must be `async (req, res, next) => { await next(); }` |

