/**
 * Router module..
 * @module router
 *
 * Usage:
 *
 *  const router = new Router();
 *
 *  // Add middleware that computes request time.
 *  router.use(async (req, res, next) => {
 *    const d = Date.now();
 *    await next();
 *    console.log('Time: ${Date.now() - d} ms');
 *  });
 *
 *  // Add route.
 *  router.register('GET', '/api/status', (req, res) => {
 *    res.text('ok');
 *  });
 *
 * Notes:
 *
 *  - All middlewares must be asynchronous and must declare `await next()` to
 *    guarantee the order of process.
 */

const assert  = require('node:assert');
const { nop } = require('nest/helpers');

class Router {
	fallback    = nop;
	middlewares = [];
	routes      = {};

	async handle(req, res) {
		const stack = [...this.middlewares];
		const route = this.route(req, res);

		stack.push(route);

		let i = 0;

		// IDEA: Pre-build chain and add route to it at each request.
		const next = async () => {
			const callback = stack[i++];
			if (callback) {
				await callback(req, res, next);
			}
		};

		await next();
	}

	/**
	 * Register an endpoint.
	 * @param {string}   method   - Method of the endpoint (by defalut: 'GET').
	 * @param {string}   route    - Path of the endpoint.
	 * @param {function} callback - Endpoint handler.
	 *                              Signature is `(req, res) => {}`.
	 */
	register (method, route, callback) {
		assert(
			callback instanceof Function,
			`callback for "${method} ${route}" must be a function`
		);
		if (!(method in this.routes)) {
			this.routes[method.toUpperCase()] = {};
		}
		// Transform route to regular expression for future lookups.
		let exp = `^${route.replace(/\[(\w+)\]/, (p1, p2) => `(?<${p2}>[^/]+)`)}$`;
		this.routes[method][exp] = callback;
	}

	route (req, res) {
		const { method, path } = req;
		if (method in this.routes) {
			for (const route in this.routes[method]) {
				const match = RegExp(route).exec(path);
				if (match) {
					req.params = match.groups;
					return this.routes[method][route];
				}
			}
		}
		return this.fallback;
	}

	use (middleware) {
		assert(
			middleware.constructor.name === 'AsyncFunction',
			'middleware must be asynchronous'
		);
		if (middleware instanceof Function) {
			this.middlewares.push(middleware);
		}
	}
}

module.exports = Router;
