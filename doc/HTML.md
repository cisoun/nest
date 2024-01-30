# HTML

> Module: `nest/html`

HTML templating engine.

## Features

- Pass data to HTML.

## Usage

```js
const html = require('nest/html');

// Will return: <p>My name is Joe.</p>
html.render('<p>My name is {{name}}.</p>', {name: 'Joe'});

// You can add a default value if the given variable isn't defined.
// Will return: <p>I am happy.</p>
html.render('<p>I am {{mood | happy}}.</p>'});
```

## Methods

| Methods                   | Description          |
| ------------------------- | -------------------- |
| `render(html, params={})` | Render an HTML code. |
