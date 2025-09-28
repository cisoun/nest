<p align="center">
 <img src="doc/nest.svg" width="500"/>
</p>

![GitHub package.json version](https://img.shields.io/github/package-json/v/cisoun/nest)
![GitHub License](https://img.shields.io/github/license/cisoun/nest)

A lightweight web server built on top of Node.js with zero dependencies and extensibility in mind.

## Usage

```js
import nest from 'nest';
const app = nest();
app.get('/api/hello', (req, res) => {
  res.code(200).json({message: 'Hello!'});
});
app.run('localhost', 3000);
```

## Built-in features

 - Assertions ([nest/assert](doc/Assert.md))
 - Data caching ([nest/cache](doc/Cache.md))
 - SQLite based data caching ([nest/cache-sqlite](doc/CacheSQLite.md))
 - Cryptography utilities ([nest/crypto](doc/Crypto.md))
 - Extensions ([nest/extensions](doc/Extensions.md))
 - HTML templating engine ([nest/html](doc/HTML.md))
 - HTTP client ([nest/http](doc/HTTP.md))
 - Logging ([nest/log](doc/Log.md))
 - Data validation ([nest/validation](doc/Validation.md))
 - WebSocket server ([nest/websocket](doc/WebSocket.md))

## Requirements

- **Node.js** >=22.5.0

## Installation

```sh
npm i https://github.com/cisoun/nest
```

## License

Nest is distributed under GNU General Public License version 3. See [LICENSE](LICENSE).
