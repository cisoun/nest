

![	](doc/nest.svg)


A lightweight web server built on top of Node.js with zero dependencies and extensibility in mind.

## Usage

```js
const nest = require('nest');
const app = nest();
app.get('/api/hello', (req, res) => res.code(200).json({message: 'Hello!'}));
app.run('localhost', 3000);
```

## Built-in features

 - Data caching ([nest/cache](doc/Cache.md))
 - Cryptography utilities ([nest/crypto](doc/Crypto.md))
 - Extensions ([nest/extensions](doc/Extensions.md))
 - HTML templating engine ([nest/html](doc/HTML.md))
 - HTTP client ([nest/http](doc/HTTP.md))
 - Logging ([nest/log](doc/Log.md))
 - Data validation ([nest/validation](doc/Validation.md))
 - WebSocket server ([nest/websocket](doc/WebSocket.md))

### Optional

> These modules require external dependencies that must be installed manually in order to use them.
> Please read their documentation to know which module is required.

- SQLite based data caching ([nest/cache-sqlite](doc/CacheSQLite.md))

## License

Nest is distributed under GNU General Public License version 3. See [LICENSE](LICENSE).
