/**
 * Internal server.
 * @module server
 *
 * Overridables:
 *   fallback()   - Called when no route has been found.
 *   onclose()    - Called when server has shut down.
 *   onerror()    - Called whenever an error happens during request handling.
 *   onresponse() - Called when a response has been handled and closed.
 */

const http     = require('http');
const Request  = require('nest/requests');
const Response = require('nest/responses');

class Server {
  constructor (routes = {GET: {}, POST: {}}) {
    this.setRoutes(routes);
    this.server = http.createServer(this.handler.bind(this));
  }

  close () {
    this.server.close();
    this.onclose();
  }

  fallback (req, res) { return res.code(404).text('Not found'); }

  get (path, callback) {
    return this.routes['GET'][path] = callback;
  }

  post (path, callback) {
    return this.routes['POST'][path] = callback;
  }

  async handler (request, response) {
    const {url, method} = request;
    const [path, query] = url.split('?', 2);

    // Capture and parse data.
    const buffers = [];
    for await (const chunk of request) {
      buffers.push(chunk);
    }

    const body = Buffer.concat(buffers).toString('utf8');

    // Wrap Node objects to encapsulate our data.
    const req = new Request(request, url, path, body, query);
    const res = new Response(response);

    // Routing.
    try {
      if (method in this.routes && path in this.routes[method]) {
        await this.routes[method][path](req, res);
      } else {
        await this.fallback(req, res);
      }
    } catch (e) {
      this.onerror(req, res, e);
    }
    res.end();

    this.onresponse(req, res);
  }

  run (host, port) {
    const now     = new Date().toISOString();
    const message = `[${now}] Server running at http://${host}:${port}`;
    this.server.listen(port, host, () => console.log(message));
  }

  setRoutes (routes) {
    if (!(routes instanceof Object)) {
      throw new Error('routes must be an object');
    }
    this.routes = routes;
  }

  onclose    ()            { console.log('Closing...'); }
  onerror    (req, res, e) { console.error(e); }
  onresponse (req, res)    { console.log(`${req.method} ${req.url}`); }
}

module.exports = Server;