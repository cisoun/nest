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

const assert   = require('node:assert');
const http     = require('http');
const Request  = require('nest/requests');
const Response = require('nest/responses');

class Server {
	routes = {};

	constructor (routes = {}) {
		this.initializeRoutes(routes);
		this.initializeServer();
		this.handleTermination();
	}

	delete (path, callback) { this.register('DELETE', path, callback); }
	get    (path, callback) { this.register('GET',    path, callback); }
	patch  (path, callback) { this.register('PATCH',  path, callback); }
	post   (path, callback) { this.register('POST',   path, callback); }
	put    (path, callback) { this.register('PUT',    path, callback); }

	close () {
		this.onclose();
		this.server.close();
	}

	handle (request, response) {
		const data = [];
		request.on('data', chunk => {
			data.push(chunk);
		});
		request.on('end', () => {
			const req = new Request(request, data);
			const res = new Response(response);
			this.route(req, res)
				.catch(e => {
					this.onerror(e, req, res);
				})
				.finally(() => {
					this.onresponse(req, res);
					res.end();
				});
		});
	}

	handleTermination () {
		// NOTE: we use `once()` in order to call the termination only once.
		//   Running the server through npm might trigger a termination multiple
		//   times so we have to ensure it is done only once.
		process.once('SIGINT',  this.close.bind(this));
		process.once('SIGTERM', this.close.bind(this));
	}

	initializeRoutes (routes) {
		assert(routes instanceof Object, 'routes must be an object');
		for (const [method, mroutes] of Object.entries(routes)) {
			for (const [path, callback] of Object.entries(mroutes)) {
				this.register(method, path, callback);
			}
		}
	}

	initializeServer () {
		this.server = http.createServer(this.handle.bind(this));
	}

	on (event, callback) {
		this[`on${event}`] = callback;
		return this;
	}

	onclose () {
		console.log('Closing...');
	}

	onerror (e, req, res) {
		res.code(e.code ?? 500).json({
			name:    e.constructor.name,
			message: e.message,
			...e
		});
	}

	onlisten (host, port) {
		console.log(`Server running at http://${host}:${port}`);
	}

	onlost (req, res) {
		res.code(404).text('not found');
	}

	onresponse (req, res) {
		const date = new Date().toISOString();
		console.log(`[${date}] ${req.ip} ${res.status} ${req.method} ${req.url}`);
	}

	/**
	 * Register an endpoint.
	 * @param {string}   method   - Method of the endpoint (by defalut: 'GET').
	 * @param {string}   path     - Path of the endpoint.
	 * @param {function} callback - Endpoint handler.
	 *                              Signature is `(req, res) => {}`.
	 */
	register (method, path, callback) {
		assert(callback instanceof Function, `callback for "${path}" not a function`);
		if (!(method in this.routes)) {
			this.routes[method] = {};
		}
		path = path.replace('*', '.*');
		this.routes[method][path] = callback;
	}

	async route (req, res) {
		const {method, path} = req;
		if (method in this.routes) {
			const routes = this.routes[method];
			for (const route in routes) {
				if (path.match(`^${route}$`)) {
					return routes[route](req, res);
				}
			}
		}
		return this.onlost(req, res);
	}

	run (host, port) {
		this.server.listen(port, host, () => this.onlisten(host, port));
	}
}

module.exports = Server;
