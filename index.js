const Server = require('nest/server');

module.exports = (routes) => new Server(routes);