# Extensions

> [!WARNING]
> This page is highly subject to changes!

Nest provides built-in extensions and a way to create your owns.

## Usage

```js
const app = nest();
app.use(
  'request.get',
  'response.render'
);
```

## Built-in extensions

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `request.get` | Ensure a JSON body is given and get its specific keys.<br/> Example: `const [name, age] = req.get('name', 'age');` |
| `request.id` | Add a UUID4 identifier to each request as `id` attribute.<br />Example: `app.on('response', (req, res) => log.info(req.id));` |
| `request.validate` | Validate the JSON body of a request.<br/>Example: `req.validate({'name': 'required'});` |
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

### request.validate

Activate this extension to validate the JSON body of a request. Uses the [validation](Validation.md) module.

```js
req.validate({
  'name': 'required',
  'age': 'required|number|between:7:77'
});
```

To see which rules are available, please refer to [Validation](Validation.md).

### statics

To serve static files, create a `statics` folder in the root of your project.
This means, every GET request pointing to `/statics/<path>` will return the content of the file of the very same path.

## Custom extensions

The approach is pretty basic: modify the prototypes of Nest's internal objects.

You can also use the `register(name, (instance) => {})` method to add a custom extension into Nest so you can load it through the `use` method of your Nest instance. This is especially useful when an extension has to alterate a specific Nest instance.

### Examples

```js
const nest = require('nest');
const extensions = require('nest/extensions');

// Add a guard to ensure the "Authorization" header is set to each requests.
function guard (instance) {
	const f = instance.route;
	instance.route = async function (req, res) {
		const path = req.path;
		if ('Authorization' in req.headers) {
			return res.text('OK');
		} else {
			return res.code(403).text('No authorization provided');
		}
	}
}

// Add JSON responses.
function response_json () {
  Response.prototype.json = function (data) {
    this.base.setHeader('Content-Type', 'application/json');
    this.base.write(JSON.stringify(data));
    return this;
  }
}

extensions.register('guard', guard);
extensions.register('response.json', response_json);

const app = nest();

app.use(
  'guard',
  'response.json'
);
```
