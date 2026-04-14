/**
 * Requests module.
 * @module requests
 */

const http = require('node:http');
const { HTTPError } = require('nest/errors');

class Request extends http.IncomingMessage {
	body   = '';
	params = {};
	req    = null;

	get hasJSON () {
		const contentType = this.headers['content-type'];
		return contentType &&
		       contentType.toLowerCase().startsWith('application/json') &&
		       this.body.length > 0;
	}

	get data () {
		return {
			...this.query,
			...this.params,
			...(this.hasJSON ? this.json : {})
		};
	}

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