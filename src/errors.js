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

class AssertError extends NestError {}

class CryptoError extends Error {}

class HTTPError extends NestError {
	/**
	 * @constructor
	 * @param {integer} [code=400]     - HTTP error code.
	 * @param {string}  [message=null] - Message of the error.
	 */
	constructor (code = 400, message=null, ...args) {
		super(message, ...args);
		this.code = code;
	}

	toJSON () {
		return {
			code:    this.code,
			message: this.message,
			name:    this.name,
		};
	}
}

class HTTPValidationError extends HTTPError {
	constructor (errors, message = 'validation failed') {
		super(422, message);
		this.errors = errors;
	}

	toJSON () {
		const data  = super.toJSON();
		data.errors = this.errors;
		return data;
	}
}

class ValidationError extends NestError {
	constructor (errors) {
		super();
		this.errors = errors;
	}
}

module.exports = {
	AssertError,
	CryptoError,
	HTTPError,
	HTTPValidationError,
	NestError,
	ValidationError
};
