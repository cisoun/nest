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

const assert       = require('node:assert');
const http         = require('http');
const Request      = require('nest/requests');
const Response     = require('nest/responses');
const {NestError}  = require('nest/errors');

class Server {
	constructor (routes = {}) {
		assert(routes instanceof Object, 'routes must be an object');
		this.routes = routes;
		this.server = http.createServer(this.handle.bind(this));
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
			const body = Buffer.concat(data);
			const req  = new Request(request, body);
			const res  = new Response(response);
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

	register (method, path, callback) {
		if (!(method in this.routes)) {
			this.routes[method] = {};
		}
		this.routes[method][path] = callback;
	}

	async route (req, res) {
		const {method, path} = req;
		if (method in this.routes && path in this.routes[method]) {
			return this.routes[method][path](req, res);
		} else {
			return this.onlost(req, res);
		}
	}

	run (host, port) {
		this.server.listen(port, host, () => this.onlisten(host, port));
	}
}

module.exports = Server;
