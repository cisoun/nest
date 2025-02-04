/**
 * Requests module.
 * @module requests
 */

const {JSONError} = require('nest/errors');

class Request {
  constructor (request, body) {
    this.base  = request;
    this.body  = Buffer.concat(body);
    this.url   = request.url;
  }

  get headers () { return this.base.headers; }
  get ip      () { return this.base.socket.remoteAddress; }

  get json () {
  	try {
  		return JSON.parse(this.body);
  	} catch (e) {
  		throw new JSONError(this.body);
  	}
  }

  get method  () { return this.base.method; }
  get path    () { return this.url.split('?')[0]; }
  get query   () { return this.url.split('?')[1]; }
  get text    () { return this.body.toString('utf8'); }
}

module.exports = Request;
