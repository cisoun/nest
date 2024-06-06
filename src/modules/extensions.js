/**
 * Extension module.
 * @module extensions
 *
 * This module provide base extensions to Nest.
 *
 * Usage:
 *
 *   require('nest/extensions')(
 *     'response.json',
 *     'statics'
 *   );
 *
 * Extensions:
 *
 *   json:            Add JSON support for requests and responses.
 *                    Will load: request.json, response.json
 *
 *   request.json:    Get the JSON data of a request.
 *                    On JSON decoding error, throws: JSONError (HTTP 422).
 *                    E.g.: const data = req.json;
 *
 *   response.html:   Allow a resopnse to send HTML code.
 *                    E.g.: res.html('<div>Hello</div>');
 *
 *   response.json:   Allow a response to send JSON data.
 *                    E.g.: res.json({hello: 'world'});
 *
 *   response.render: Allow a response to render and serve an HTML static file.
 *                    Will load: response.html
 *                    E.g.: res.render('index', {version: '1.0'});
 *
 *   statics:         Allow the server to serve static files through GET
 *                    requests with URLs starting by `/statics`.
 */

const HTML        = require('nest/html');
const Request     = require('nest/requests');
const Response    = require('nest/responses');
const Server      = require('nest/server');
const validation  = require('nest/validation');
const {statics}   = require('nest/helpers');
const {NestError} = require('nest/errors');

const Extensions = {
	'request.validate': request_validate,
	'response.html':    response_html,
	'response.render':  response_render,
	'statics':          statics_handler,
};

function response_html () {
	Response.prototype.html = function (data, params={}) {
		this.base.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.base.write(HTML.render(data, params));
		return this;
	}
}

function request_validate () {
	Request.prototype.validate = function (rules) {
		return validation.validateObject(this.json, rules);
	}
}

function response_render (file, params={}) {
	response_html();
	Response.prototype.render = async function (file, params={}) {
		const data = await statics(`statics/${file}.html`);
		return this.html(data, params);
	}
}

function statics_handler () {
	const f = Server.prototype.route;
	Server.prototype.route = async function (req, res) {
		const path = req.path;
		if (req.method == 'GET' && path.startsWith('/statics')) {
			const data = await statics(path.slice(1)).catch(e => {
				throw new NestError(404, 'cannot fetch file');
			});
			res.base.write(Buffer.from(data));
		} else {
			return f.call(this, req, res);
		}
	}
}

module.exports = (...extensions) => extensions.map(e => Extensions[e]());