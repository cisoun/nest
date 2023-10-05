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

const Request     = require('nest/requests');
const Response    = require('nest/responses');
const {JSONError} = require('nest/errors');

const Extensions = {
	'request.json':     request_json,
	'request.validate': request_validate,
	'response.json':    response_json
};

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

module.exports = (...extensions) => {
	extensions.map(e => Extensions[e]());
};