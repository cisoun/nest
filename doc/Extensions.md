# Extensions

Nest provides built-in extensions and a way to create your owns.

## Usage

```js
require('nest/extensions')(
  'request.json',
  'response.json',
)
```

## Built-in extensions

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `json` | Shortcut for `request.json` and `response.json`. |
| `request.json` | Add JSON data parsing to all requests.<br />Example: `app.get('/') = (req, res) => console.log(req.json);` |
| `response.json` | Add JSON response to all responses.<br />Example: `app.get('/') = (req, res) => res.json({message: 'OK'});` |
| `response.html` | Add HTML response to all responses.<br/>Example: `app.get('/') = (req, res) => res.html('<b>Hi!</b>');` |
| `response.render` | Return an HTML page with parameters.<br />Example: `app.get('/about') = (req, res) => res.render('about', {name: 'Georges'}));` |
| `statics` | Allow the server to serve static files. |

### response.render

Let's say you have `/statics/about.html` with the following content:

```html
<html>
  <body>
    Hello I'm {{name}}, thanks for visiting!
  </body>
</html>
```

You can transform and return the page this way:

```js
app.get('/about') = (req, res) => res.render('about', {name: 'Geroges'});
```

The `name` field of the HTML page will be replaced by "Georges".

### statics

To serve static files, create a `statics` folder in the root of your project.
This means, every GET request pointing to `/statics/<path>` will return the content of the file of the very same path.

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
