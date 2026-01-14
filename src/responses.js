/**
 * Responses module.
 * @module responses
 */

const http = require('node:http');

class Response extends http.ServerResponse {
	body = null;
	res  = null;

	code (code) {
		this.statusCode = code;
		return this;
	}

	end () {
		super.end(this.body);
	}

	json (data) {
		this.setHeader('Content-Type', 'application/json');
		this.body = JSON.stringify(data);
		return this;
	}

	text (text) {
		this.setHeader('Content-Type', 'text/plain');
		this.body = text;
		return this;
	}

	get status  () {
		return this.statusCode;
	}
}

module.exports = Response;
