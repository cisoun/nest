/**
 * Responses module.
 * @module responses
 */

class Response {
  constructor (response) {
    this.base = response;
  }

  code (code) {
    this.base.statusCode = code;
    return this;
  }

  end () {
    this.base.end();
  }

  text (text) {
    this.base.setHeader('Content-Type', 'text/plain');
    this.base.write(text);
    return this;
  }

	get status () { return this.base.statusCode; }
}

module.exports = Response;