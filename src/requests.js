/**
 * Requests module.
 * @module requests
 */

class Request {
  constructor (request, url, path, body, query) {
    this.base  = request;
    this.body  = body;
    this.path  = path;
    this.query = query;
    this.url   = url;
  }

  get headers () { return this.base.headers; }
  get ip      () { return this.base.socket.remoteAddress; }
  get method  () { return this.base.method; }
}

module.exports = Request;