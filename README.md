

![	](doc/nest.svg)


A lightweight web server built on top of Node with zero dependencies and extensibility in mind.

## Usage

```js
require('nest/extensions')(
  'response.json'
);
const nest = require('nest');
const app = nest();
app.on('error', (req, res, e) => console.error(`Error: ${e}`));
app.get('/api/hello', (req, res) => res.code(200).json({message: 'Hello!'}));
app.run('localhost', 3000);
```

## Built-in features

 - Data caching ([nest/cache](doc/Cache.md))
 - Cryptography utilities ([nest/crypt](doc/Crypt.md))
 - Extensions ([nest/extensions](doc/Extensions.md))
 - HTML templating engine ([nest/html](doc/HTML.md))
 - HTTP client ([nest/http](doc/HTTP.md))
 - Data validation ([nest/validation](doc/Validation.md))

### Optional

> These modules require external dependencies that must be installed manually in order to use them.
> Please read their documentation to know which module is required.

- SQLite based data caching ([nest/cache-sqlite](doc/CacheSQLite.md))
