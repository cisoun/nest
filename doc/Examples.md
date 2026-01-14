# Examples

```js
const nest = require('nest');
const log  = require('nest/log');
const {
  responseHtml
} = require('nest/extensions');

const app = nest({
	'GET': {
		'/':    (req, res) => res.html('<h1>Hello world!</h1>'),
		'/api': (req, res) => res.json({ hello: 'world' });
	}
});

// Use "res.html" extension.
app.use(responseHtml);

// Middleware example.
app.use(async (req, res, next) => {
	if (req.path.startsWith('/api' && req.headers.authorization) {
		await next();
	} else {
    res.code(401).json({error: 'authorization header missing'});
	}
};

// Print "Bye!" when the server is shutting down.
app.on('close',(host, port) => {
  log.info('Bye!');
});

// Handle errors.
app.on('error', (e, req, res) => {
  res.code(e.status ?? 500).text(e.message);
});

// Print a message when the server has started.
app.on('listen', (host, port) => {
  log.info(`Started on ${host}:${port}...`);
});

// Return "not found" whenever the client is requesting an invalid route.
app.on('lost', (req, res) => {
  res.code(404).text('not found');
});

// Log each request.
app.on('response', (req, res) => {
  log.info(`${req.ip} ${res.status} ${req.method} ${req.path}`);
});

app.run('localhost', 9000);
```
