/**
 * Responses module.
 * @module responses
 */

class Response {
	constructor (response) {
		this.base = response;
	}

	end () {
		this.base.end();
	}

	code (code) {
		this.base.statusCode = code;
		return this;
	}

	text (text) {
		this.base.setHeader('Content-Type', 'text/plain');
		this.base.write(text);
		return this;
	}

	get status () { return this.base.statusCode; }
}

module.exports = Response;