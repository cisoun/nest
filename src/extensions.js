/**
 * Extensions module.
 * @module extensions
 *
 * This module provide base extensions to Nest.
 *
 * Usage:
 *
 *   const { requestGet, statics } = require('nest/extensions');
 *   const app = nest();
 *   app.use(
 *     requestGet,
 *     statics
 *   );
 *
 * Extensions:
 *
 *   apifs:           Build an API from the "api" folder.
 *
 *                    Paths are translated as below:
 *                      api/users/index.js -> /api/users
 *                      api/users/[id].js  -> /api/users/<id>
 *
 *                    JS files must export functions named after a standard
 *                    HTTP method (in upper case) in order to register them as
 *                    route.
 *
 *                    E.g.: exports.GET = (req, res) => res.text('hello');
 *
 *                    WARNING: the build process is asynchronous!
 *
 *   requestGet:      Ensure a JSON body is given and get its specific keys.
 *                    E.g.: [name, age] = req.get('name', 'age');
 *
 *   requestId:       Add a UUID4 identifier to each request as `id` attribute.
 *                    E.g.: log.info(req.id);
 *
 *   requestValidate: Validate the content of a request.
 *                    Expects an object or or a Validator instance.
 *                    E.g.: req.validate({'name': 'required'});
 *                    E.g.: req.validate(UserValidator);
 *
 *   responseFile:    Allow a response to send a file from a specific path.
 *                    E.g.: res.file('statics/images/logo.png');
 *
 *   responseHtml:    Allow a response to send HTML code.
 *                    E.g.: res.html('<div>Hello</div>');
 *
 *   responseRender:  Allow a response to render and serve an HTML static file.
 *                    Will load: responseHtml
 *                    E.g.: res.render('index', {version: '1.0'});
 *
 *   statics:         Allow the server to serve static files through GET
 *                    requests with URLs starting by `/statics`.
 *                    Will load: responseFile
 */

const Request    = require('nest/requests');
const Response   = require('nest/responses');
const helpers    = require('nest/helpers');
const html       = require('nest/html');
const { assert } = require('nest/assert');
const { uuid4 }  = require('nest/crypto');
const {
	HTTPError,
	HTTPValidationError,
	ValidationError
} = require('nest/errors');
const {
	fileExtension,
	fileRead,
} = require('nest/helpers');
const {
	validateKeys,
	validateObject,
	Validator
}  = require('nest/validation');

const MIMETypes = {
	'jpg':  'image/jpeg',
	'jpeg': 'image/jpeg',
	'svg':  'image/svg+xml'
};

function use (instance, ...extensions) {
	assert(extensions instanceof Array, 'no extensions given');
	extensions.forEach((e) => {
		assert(e instanceof Function, 'extension must be a function');
		if (e.length == 1) {
			e(instance);
		} else if (e.length == 3) {
			const old = instance.route;
			instance.route = (req, res) => e(req, res, old);
		}
	});
}

const apifs = (instance) => {
	const { join } = require('path');
	const fs       = require('fs');

	const cwd       = process.cwd();
	const cwdLength = cwd.length;
	const methods   = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
	const options   = { recursive: true, withFileTypes: true };

	/*
	 * Here, we go recursively in /api to find each .js file, create a route
	 * after their respective path and import their exports if they are named
	 * after an HTTP method.
	 *
	 * Special case: index.js are not appended at the end of the path.
	 *
	 * WARNING: this part is asynchronous!
	 */

	fs.readdir(join(cwd, 'api'), options, (err, files) => {
		files.forEach(file => {
			const name = file.name;
			if (file.isFile() && name.endsWith('.js')) {
				const callbacks = require(join(file.parentPath, name));

				let route = file.parentPath.slice(cwdLength);
				if (name !== 'index.js') {
					route = route + '/' + name.slice(0, name.lastIndexOf('.'));
				}

				methods.map((method) => {
					const callback = callbacks[method];
					if (callback) {
						instance.register(method, route, callback);
					}
				});
			}
		});
	});
};

const requestGet = (instance) => {
	Request.prototype.get = function (...args) {
		if (this.body.length < 1) {
			throw new HTTPError(400, 'expected JSON payload');
		}
		try {
			return validateKeys(this.json, args);
		} catch (e) {
			if (e instanceof ValidationError) {
				throw new HTTPValidationError(e.errors)
			}
			throw e;
		}
	}
};

const requestId = (instance) => {
	const requestId = async (req, res, next) => {
		req['id'] = uuid4();
		await next();
	};
	instance.use(requestId);
};

const requestValidate = () => {
	Request.prototype.validate = function (rules) {
		try {
			if (rules instanceof Validator) {
				return rules.validate(this.json);
			} else {
				return validateObject(this.json, rules);
			}
		} catch (e) {
			if (e instanceof ValidationError) {
				throw new HTTPValidationError(e.errors);
			} else {
				throw e;
			}
		}
	}
};

const responseFile = (instance) => {
	Response.prototype.file = async function (path) {
		return await fileRead(path)
			.then(data => {
				const buffer    = Buffer.from(data);
				const extension = fileExtension(path).slice(1);
				// Force content type for files known to not be recognized
				// by the browser by default.
				if (extension in MIMETypes) {
					this.setHeader('Content-Type', MIMETypes[extension]);
				}
				this.setHeader('Content-Length', buffer.length);
				this.write(buffer);
				return this;
			})
			.catch(e => {
				throw new HTTPError(404, 'cannot fetch file', {cause: path});
			});
	}
};

const responseHtml = (instance) => {
	Response.prototype.html = function (data, params = {}) {
		this.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.write(html.render(data, params));
		return this;
	}
};

const responseRender = (instance) => {
	use(instance, responseHtml);
	Response.prototype.render = async function (file, params={}) {
		const data = await helpers.statics(file + '.html');
		return this.html(data.toString(), params);
	}
};

const statics = (instance) => {
	use(instance, responseFile);
	const staticsHandler = async (req, res, next) => {
		const path = req.path;
		if (req.method == 'GET' && path.startsWith('/statics')) {
			return res.file(path.slice(1));
		}
		await next();
	}
	instance.use(staticsHandler);
};

module.exports = {
	apifs,
	requestGet,
	requestId,
	requestValidate,
	responseFile,
	responseHtml,
	responseRender,
	statics,
	use
};
