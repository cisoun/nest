# Extensions

> [!WARNING]
> This page is highly subject to changes!

Nest provides built-in extensions and a way to create your owns.

## Usage

```js
const {
  requestGet,
  responseRender
} = require('nest/extensions');

const app = nest();

app.use(
  requestGet,
  responseRender
);
```

## Built-in extensions

| Extension       | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `apifs` | Build an API from the `api` folder of the app. |
| `requestGet` | Ensure a JSON body is given and get its specific keys.<br/> Example: `const [name, age] = req.get('name', 'age');` |
| `requestId` | Add a UUID4 identifier to each request as `id` attribute.<br />Example: `app.on('response', (req, res) => log.info(req.id));` |
| `requestValidate` | Validate the JSON body of a request.<br/>Example: `req.validate({'name': 'required'});` |
| `responseFile` | Allows to serve a file.<br />Example: `app.get('/avatar') = (req, res) => res.file('something.jpg');` |
| `responseHtml` | Allows to serve an HTML response.<br/>Example: `app.get('/') = (req, res) => res.html('<b>Hi!</b>');` |
| `responseRender` | Allows to serve an HTML page from the `statics` folder with parameters.<br />Example: `app.get('/about') = (req, res) => res.render('about', {name: 'Georges'}));` |
| `statics` | Allow the server to serve static files from the `statics` folder. |

### apifs

This extensions will translate the `api` folder into an API.

> [!WARNING]
> The build process is asynchronous!

For instance, paths will be translated as below:
- `api/users/index.js` –> `/api/users`
- `api/users/[id].js`  –> `/api/users/<id>`

Example:

```js
// File: api/users/[id].js

// Endpoint: GET /api/users/<id>
exports.GET = (req, res) => {
  const { id } = req.params;
  return users.getById(id);
}

// Endpoint: PATCH /api/users/<id>
exports.PATCH = (req, res) => {
  const { id } = req.params;
  const user = users.getById(id);
  return user.update({ req.json });
}
```

### responseRender

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

An extension can be implemented by calling `app.use((instance) => { ... })` where `instance` is the server instance.

### Examples

```js
const nest = require('nest');
const extensions = require('nest/extensions');

// Add JSON responses.
function responseJSON (instance) {
  Response.prototype.json = function (data) {
    this.setHeader('Content-Type', 'application/json');
    this.write(JSON.stringify(data));
    return this;
  }
}

const app = nest();

app.use(
  responseJSON
);
```
