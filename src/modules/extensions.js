/**
 * Extension module.
 * @module extensions
 *
 * This module provide base extensions to Nest.
 *
 * Usage:
 *
 *   import { use } from 'nest/extensions';
 *   const { use } = require('nest/extensions');
 *
 *   use(
 *     'request.get',
 *     'statics'
 *   );
 *
 * Extensions:
 *
 *   request.get:     Ensure a JSON body is given and get its specific keys.
 *                    E.g.: [name, age] = req.get('name', 'age');
 *
 *   response.file:   Allow a response to send a file from a specific path.
 *                    E.g.: res.file('statics/images/logo.png');
 *
 *   response.html:   Allow a response to send HTML code.
 *                    E.g.: res.html('<div>Hello</div>');
 *
 *   response.render: Allow a response to render and serve an HTML static file.
 *                    Will load: response.html
 *                    E.g.: res.render('index', {version: '1.0'});
 *
 *   statics:         Allow the server to serve static files through GET
 *                    requests with URLs starting by `/statics`.
 */

const HTML     = require('nest/html');
const log      = require('nest/log');
const Request  = require('nest/requests');
const Response = require('nest/responses');
const Server   = require('nest/server');
const {
	HTTPError,
	HTTPValidationError,
	NestError,
	ValidationError
} = require('nest/errors');
const {
	fileExtension,
	fileRead,
	statics
} = require('nest/helpers');
const {
	validateKeys,
	validateObject
}  = require('nest/validation');


const Extensions = {
	'request.get':      request_get,
	'request.validate': request_validate,
	'response.file':    response_file,
	'response.html':    response_html,
	'response.render':  response_render,
	'statics':          statics_handler,
};

const MIMETypes = {
	'jpg':  'image/jpeg',
	'jpeg': 'image/jpeg',
	'svg':  'image/svg+xml'
};

function request_get () {
	Request.prototype.get = function (...args) {
		try {
			return validateKeys(this.json, args);
		} catch (e) {
			if (e instanceof ValidationError) {
				throw new HTTPValidationError(e.errors, 'missing parameters')
			}
			throw e;
		}
	}
}

function request_validate () {
	Request.prototype.validate = function (rules) {
		try {
			return validateObject(this.json, rules);
		} catch (e) {
			if (e instanceof ValidationError) {
				throw new HTTPValidationError(e.errors);
			} else {
				throw e;
			}
		}
	}
}

function response_file () {
	Response.prototype.file = async function (path) {
		return await fileRead(path)
			.then(data => {
				const buffer    = Buffer.from(data);
				const extension = fileExtension(path).slice(1);
				// Force content type for files known to not be recognized
				// by the browser by default.
				if (extension in MIMETypes) {
					this.base.setHeader('Content-Type', MIMETypes[extension]);
				}
				this.base.setHeader('Content-Length', buffer.length);
				this.base.write(buffer);
				return this;
			})
			.catch(e => {
				throw new HTTPError(404, 'cannot fetch file', {cause: path});
			});
	}
}

function response_html () {
	Response.prototype.html = function (data, params={}) {
		this.base.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.base.write(HTML.render(data, params));
		return this;
	}
}

function response_render (file, params={}) {
	response_html();
	Response.prototype.render = async function (file, params={}) {
		const data = await statics(file + '.html');
		return this.html(data.toString(), params);
	}
}

function statics_handler () {
	response_file();
	const f = Server.prototype.route;
	Server.prototype.route = async function (req, res) {
		const path = req.path;
		if (req.method == 'GET' && path.startsWith('/statics')) {
			return res.file(path.slice(1));
		} else {
			return f.call(this, req, res);
		}
	}
}

function register (name, callback) {
	if (!(name in Extensions)) {
		Extensions[name] = callback;
	} else {
		throw new NestError(`extension "${name}" is already registered`);
	}
}

function use (instance, ...extensions) {
	extensions.map(e => {
		const extension = Extensions[e];
		if (extension) {
			extension(instance);
		} else {
			throw new NestError(`extension "${e}" is not available`);
		}
	});
}

module.exports = {
	register,
	use
};