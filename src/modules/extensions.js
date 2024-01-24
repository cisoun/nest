/**
 * Extension module.
 * @module Extensions
 *
 * This module provide base extensions to Nest.
 *
 * Usage:
 *
 *   require('nest/extensions')([
 *     'response.json'
 *   ]);
 *
 * Extensions:
 *
 *   request.json:  Get the JSON data of a request.
 *   response.json: Allow a response to send JSON data.
 */

const HTML        = require('nest/html');
const Request     = require('nest/requests');
const Response    = require('nest/responses');
const Server      = require('nest/server');
const {JSONError} = require('nest/errors');
const {statics}   = require('nest/helpers');

const Extensions = {
	'json':             json,
	'request.json':     request_json,
	'request.validate': request_validate,
	'response.html':    response_html,
	'response.json':    response_json,
	'response.render':  response_render,
	'statics':          statics_handler,
};

function json () {
	request_json();
	response_json();
}

function response_html () {
	Response.prototype.html = function (data, params={}) {
		this.base.setHeader('Content-Type', 'text/html; charset=utf-8');
		this.base.write(HTML.render(data, params));
		return this;
	}
}

function request_json () {
	Object.defineProperty(Request.prototype, 'json', {
	  	get: function () {
			try {
				if (!this._json) {
					this._json = JSON.parse(this.body.trim());
				}
				return this._json;
				} catch (e) {
				if (e instanceof SyntaxError) {
					throw new JSONError(this.body);
				} else {
					throw e;
				}
			}
	 	}
	});
}

function request_validate () {
	Request.prototype.validate = function (rules) {
		return validateObject(this.json, rules);
	}
}

function response_json () {
	Response.prototype.json = function (data) {
		this.base.setHeader('Content-Type', 'application/json');
		this.base.write(JSON.stringify(data));
		return this;
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
	const f = Server.prototype.onroute;
	Server.prototype.onroute = async function (req, res) {
		if (req.method == 'GET' && req.path.startsWith('/statics')) {
			const data = await statics(req.path.slice(1), { encoding: 'utf8' });
			res.base.write(Buffer.from(data));
		} else {
			return f.call(this, req, res);
		}
	}
}

module.exports = (...extensions) => extensions.map(e => Extensions[e]());