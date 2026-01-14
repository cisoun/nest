/**
 * Requests module.
 * @module requests
 */

const http = require('node:http');
const { HTTPError } = require('nest/errors');

class Request extends http.IncomingMessage {
	body = null;
	params = {};
	req = null;

	get ip () {
		return this.socket.remoteAddress;
	}

	get json () {
		try {
			return JSON.parse(this.body);
		} catch {
			throw new HTTPError(400, 'invalid JSON payload');
		}
	}

	get path () {
		return this.url.split('?')[0];
	}

	get query () {
		return Object.fromEntries(new URLSearchParams(this.url.split('?')[1]));
	}

	get text () {
		return this.body.toString('utf8');
	}
}

module.exports = Request;