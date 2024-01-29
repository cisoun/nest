# HTML

> Module: `nest/html`

HTML templating engine.

## Features

- Pass data to HTML

## Usage

```js
const html = require('nest/html');

// Will return: <p>My name is Joe.</p>
html.render('<p>My name is {{name}}.</p>', {name: 'Joe'});
```

## Methods

| Methods                   | Description           |
| ------------------------- | --------------------- |
| `render(html, params={})` | Render and HTML code. |
