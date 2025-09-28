/**
 * Errors module.
 * @module errors
 */

/**
 * A managed error response that can be extended.
 * @class NestError
 */
class NestError extends Error {
	constructor (...args) {
		super(...args);
		this.name = this.constructor.name;
	}
}

class HTTPError extends NestError {
	/**
	 * @constructor
	 * @param {integer} [code=400]     - HTTP error code.
	 * @param {string}  [message=null] - Message of the error.
	 */
	constructor (code = 400, ...args) {
		super(...args);
		this.name    = this.constructor.name;
		this.code    = code;
	}
}

class JSONError extends HTTPError {
	constructor (data) {
		super(422, 'cannot parse JSON data');
		this.data = data;
	}
}

class ValidationError extends HTTPError {
	constructor (errors) {
		super(422, 'cannot validate request');
		this.errors = errors;
	}
}

module.exports = {
	JSONError,
	HTTPError,
	NestError,
	ValidationError
};