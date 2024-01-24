/**
 * Internal server.
 * @module server
 *
 * Overridables:
 *
 *   fallback(req, res)
 *     Called when no route has been found.
 *
 *   onclose()
 *     Called when server has shut down.
 *
 *   onerror(req, res, e)
 *     Called whenever an error happens during request handling.
 *
 *   onresponse(req, res)
 *     Called when a response has been handled and closed.
 *
 *   onroute(req, res)
 *     Called when the server is routing to the callback.
 */

const http     = require('http');
const Request  = require('nest/requests');
const Response = require('nest/responses');

class Server {
	constructor (routes = {GET: {}, POST: {}}) {
		this.setRoutes(routes);
		this.server = http.createServer(this.handler.bind(this));
	}

	close () {
		this.onclose();
		this.server.close();
	}

	fallback (_, res) { return res.code(404).text('Not found'); }

	get  (path, callback) { return this.routes['GET'][path] = callback; }
	post (path, callback) { return this.routes['POST'][path] = callback; }
	put  (path, callback) { return this.routes['PUT'][path] = callback; }

	async handler (request, response) {
		const {url, method} = request;
		const [path, query] = url.split('?', 2);
		// Capture and parse data.
		const buffers = [];
		for await (const chunk of request) {
			buffers.push(chunk);
		}
		const body = Buffer.concat(buffers).toString('utf8');
		// Wrap Node objects to encapsulate our data.
		const req = new Request(request, url, path, body, query);
		const res = new Response(response);
		// Routing.
		try {
			await this.onroute(req, res);
		} catch (e) {
			this.onerror(req, res, e);
		}
		res.end();
		this.onresponse(req, res);
	}

	on (event, callback) {
		this[`on${event}`] = callback;
		return this;
	}

	onclose    ()            { console.log('Closing...'); }
	onerror    (req, res, e) { console.error(e); }
	onresponse (req, res)    { console.log(`${req.method} ${req.url}`); }

	onroute (req, res) {
		const {method, path} = req;
		if (method in this.routes && path in this.routes[method]) {
			return this.routes[method][path](req, res);
		} else {
			return this.fallback(req, res);
		}
	}

	run (host, port) {
		const now     = new Date().toISOString();
		const message = `[${now}] Server running at http://${host}:${port}`;
		this.server.listen(port, host, () => console.log(message));
	}

	setRoutes (routes) {
		if (!(routes instanceof Object)) {
			throw new Error('routes must be an object');
		}
		this.routes = routes;
	}
}

module.exports = Server;
