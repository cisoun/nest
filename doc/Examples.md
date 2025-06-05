# Examples

```js
const nest = require('nest');
const log  = require('nest/log');
require('nest/extensions')(
	'responses.html'
);

// Middleware example.
const middleware = (next) => (req, res) => {
 	if (!req.headers.authorization) {
		res.code(401).json({error: 'authorization header missing'});
	} else
    return next(req, res);
	}
};

const api = (req, res) => res.code(200).json({hello: 'world'});

const app = nest({
  'GET': {
    '/':    (req, res) => res.html('<h1>Hello world!</h1>'),
    '/api': middleware(api)
  }
});

// Print "Bye!" when the server is shutting down.
app.on('close',    (host, port) => console.log('Bye!'));
// Print a message when the server has started.
app.on('listen',   (host, port) => console.log(`Started on ${host}:${port}...`));
// Return "not found" whenever the client is requesting an invalid route.
app.on('lost',     (req, res)   => res.code(404).text('not found'));
// Log each request.
app.on('response', (req, res)   => log.info(`${req.ip} ${res.status} ${req.method} ${req.path}`);
       
app.run('localhost', 9000);
```

