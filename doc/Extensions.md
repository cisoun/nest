# Extensions

Nest provides built-in extensions and a way to create your owns.

## Built-in extensions

Usage:

```js
require('nest/extensions')([
  'response.json',
  // Another extension (see below)
])
```

Available extensions:

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `response.json` | Add JSON response to all responses.<br />Example: `app.get('/') = (req, res) => res.json;` |

## Custom extensions

The approach is pretty basic: modify the prototypes of Nest's internal objects.

### Example: add JSON response

```js
Response.prototype.json = function (data) {
	this.base.setHeader('Content-Type', 'application/json');
	this.base.write(JSON.stringify(data));
	return this;
}
```
