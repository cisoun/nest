/**
 * A managed error response that can be extended.
 * @class NestError
 */
class NestError extends Error {
  /**
   * @constructor
   * @param {integer} [code=400]     - HTTP error code.
   * @param {string}  [message=null] - Message of the error.
   */
  constructor (code = 400, message = null) {
    super();
    this.name    = this.constructor.name;
    this.code    = code;
    this.message = message;
  }
}

class JSONError extends NestError {
	constructor (data) {
		super('cannot parse JSON data');
		this.data = data;
	}
}

class ValidationError extends NestError {
  constructor (errors) {
    super(422, 'Cannot validate data of request');
    this.errors = errors;
  }
}

module.exports = {
	JSONError,
	NestError
};