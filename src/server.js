/**
 * Internal server.
 * @module server
 *
 * Usage:
 *
 *   const nest = require('nest');
 *
 *   // Initialize without routes definition.
 *   const app = nest();
 *
 *   // Initialize with routes definition.
 *   const app = nest({
 *     'GET': {
 *       '/': (req, res) => { res.text('hello'); }
 *     }
 *   });
 *
 *   // Define a route after initialization.
 *   app.post('/users', (req, res) => users.create(req, res));
 *
 *   // Handle NOT FOUND responses.
 *   app.on('lost', (req, res) => { res.code(404).text('not found'); });
 *
 *   // Start listening.
 *   app.run('localhost', 3000);
 *
 * Events:
 *
 *   close    ():                Server is closing.
 *   error    (req, res, error): An error has occured during routing.
 *   listen   (host, port):      Server has started listening.
 *   lost     (req, res):        Client has requested an unknown route.
 *   response (req, res):        Server has sent a response to a client.
 */

const assert        = require('node:assert');
const extensions    = require('nest/extensions');
const http          = require('http');
const log           = require('nest/log');
const Request       = require('nest/requests');
const Response      = require('nest/responses');
const Router        = require('nest/router');
const {
	HTTPError,
	NestError
} = require('nest/errors');


class Server {
	router = null;
	routes = {};

	constructor (routes = {}) {
		this.initializeRouter(routes);
		this.initializeServer();
		this.handleTermination();
	}

	delete (path, callback) { this.router.register('DELETE', path, callback); }
	get    (path, callback) { this.router.register('GET',    path, callback); }
	patch  (path, callback) { this.router.register('PATCH',  path, callback); }
	post   (path, callback) { this.router.register('POST',   path, callback); }
	put    (path, callback) { this.router.register('PUT',    path, callback); }
	head   (path, callback) { this.router.register('HEAD',   path, callback); }

	close () {
		this.onclose();
		this.server.close();
	}

	handle (req, res) {
		const data = [];
		req.on('data', (chunk) => data.push(chunk));
		req.on('end', async () => {
			req.body = data;
			// Circular references.
			req.res = res;
			res.req = req;
			// Request handling.
			try {
				await this.router.handle(req, res)
			} catch (e) {
				this.onerror(e, req, res);
			} finally {
				this.onresponse(req, res);
				res.end();
			}
		});
	}

	handleLost (req, res) {
		this.onlost(req, res);
	}

	handleTermination () {
		// NOTE: we use `once()` in order to call the termination only once.
		//   Running the server through npm might trigger a termination multiple
		//   times so we have to ensure it is done only once.
		process.once('SIGINT',  this.close.bind(this));
		process.once('SIGTERM', this.close.bind(this));
	}

	initializeRouter (routes) {
		assert(routes instanceof Object, 'routes must be an object');
		this.router = new Router();
		this.router.fallback = this.handleLost.bind(this);
		for (const [method, route] of Object.entries(routes)) {
			for (const [path, callback] of Object.entries(route)) {
				this.router.register(method, path, callback);
			}
		}
	}

	initializeServer () {
		this.server = http.createServer({
			IncomingMessage: Request,
			ServerResponse: Response
		}, this.handle.bind(this));
	}

	on (event, callback) {
		this[`on${event}`] = callback;
		return this;
	}

	onclose () {
		log.info('Closing...');
	}

	onerror (e, req, res) {
		if (e instanceof HTTPError) {
			res.code(e.status).json(e);
		} else {
			res.code(e.status ?? 500).text(e.message);
		}
		if (!(e instanceof NestError)) {
			log.error(e.stack); // Unmanaged, should be logged.
		}
	}

	onlisten (host, port) {
		log.info(`Server running at http://${host}:${port}`);
	}

	onlost (req, res) {
		res.code(404).text('not found');
	}

	onresponse (req, res) {
		log.info(`${req.ip} ${res.status} ${req.method} ${req.url}`);
	}

	run (port, host = 'localhost') {
		this.server.listen(port, host, () => this.onlisten(host, port));
	}

	use (...e) {
		e.forEach((fn) => {
			if (fn.length == 1) {
				extensions.use(this, fn);
			} else if (fn.length == 3) {
				this.router.use(fn);
			}
		});
	}
}

module.exports = Server;
