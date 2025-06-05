# Extensions

> **WARNING**: this page is highly subject to changes!

Nest provides built-in extensions and a way to create your owns.

## Usage

```js
require('nest/extensions')(
  'response.render'
)
```

## Built-in extensions

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `response.file` | Allows to serve a file.<br />Example: `app.get('/avatar') = (req, res) => res.file('something.jpg');` |
| `response.html` | Allows to serve an HTML response.<br/>Example: `app.get('/') = (req, res) => res.html('<b>Hi!</b>');` |
| `response.render` | Allows to serve an HTML page from the `statics` folder with parameters.<br />Example: `app.get('/about') = (req, res) => res.render('about', {name: 'Georges'}));` |
| `statics` | Allow the server to serve static files from the `statics` folder. |

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
app.get('/about') = (req, res) => res.render('about', {name: 'John'});
```

The `name` field of the HTML page will be replaced by "John".

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
