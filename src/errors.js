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

class CryptoError extends NestError {}

class HTTPError extends NestError {
	/**
	 * @constructor
	 * @param {integer} [status=400]     - HTTP error code.
	 * @param {string}  [message=null] - Message of the error.
	 */
	constructor (status = 400, message = null, ...args) {
		super(message, ...args);
		this.name   = 'HTTPError';
		this.status = status;
	}

	toJSON () {
		return {
			error: {
				name:    this.name,
				message: this.message
			}
		};
	}
}

class HTTPValidationError extends HTTPError {
	constructor (errors, message = 'validation failed') {
		super(422, message);
		this.name   = 'ValidationError';
		this.detail = errors;
	}

	toJSON () {
		const data = super.toJSON();
		data.error.detail = this.detail;
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
