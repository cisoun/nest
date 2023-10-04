# Extensions

Nest provides built-in extensions and a way to create your owns.

## Built-in extensions

Usage:

```js
require('nest/extensions')([
  'request.json',
  'response.json',
])
```

Available extensions:

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `request.json` | Add JSON data parsing to all requests.<br />Example: `app.get('/') = (req, res) => console.log(req.json);` |
| `response.json` | Add JSON response to all responses.<br />Example: `app.get('/') = (req, res) => res.json({message: 'OK'});` |

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
