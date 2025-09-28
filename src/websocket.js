/**
 * WebSocket module.
 * @module websocket
 *
 * What this module do:
 *  - Broadcast data to clients.
 *
 * What this modules does not (TBD):
 *  - Handle clients data.
 *  - Ping/pong.
 *  - Proper errors handling.
 *  - Allowing the server to stay half open (allowHalfOpen).
 */

const crypto       = require('crypto');
const EventEmitter = require('node:events');
const net          = require('net');
const { Buffer }   = require('buffer');
const { nop }      = require('nest/helpers');

const CARRIAGE_RETURN   = '\r\n';
const HEADER_CONNECTION = 'Connection';
const HEADER_KEY        = 'Sec-WebSocket-Key';
const HEADER_UPGRADE    = 'upgrade';
const MAGIC             = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/**
 * WebSocket connection handler (handshake, processing, ...).
 * @class WebSocketClient
 *
 * Used by `WebSocket`.
 */
class WebSocketClient extends EventEmitter {
	constructor (socket) {
		super();
		this.socket = socket;
		this.handle = this.handleHandshake;

		socket.on('data',    this.ondata.bind(this));
		socket.on('end',     this.close.bind(this));
		socket.on('error',   this.onerror.bind(this));
		socket.on('timeout', this.close.bind(this));
	}

	close () {
		this.socket.destroy();
		// Since it is impossible to write anymore, just replace the `send`
		// function by an empty one in order to avoid errors.
		this.send = nop;
	}

	handleHandshake (headers, data) {
		if (
			headers.hasOwnProperty(HEADER_CONNECTION) &&
			headers.hasOwnProperty(HEADER_KEY) &&
			headers[HEADER_CONNECTION].toLowerCase().includes(HEADER_UPGRADE)
		) {
			const key   = headers[HEADER_KEY];
			const token = crypto.hash(key + MAGIC, 'sha1', 'base64');

			const response =
				'HTTP/1.1 101 Switching Protocols\r\n' +
				'Upgrade: websocket\r\n' +
				'Connection: Upgrade\r\n' +
				`Sec-WebSocket-Accept: ${token}\r\n\r\n`;

			this.socket.write(response);

			this.onhandshake();
		} else {
			this.onerror('expected handshake, closing...');
		}
	}

	handleMessage (socket, headers, data) {
		// Nothing to do yet.
	}

	ondata (data) {
		const text = Buffer.from(data).toString();
		const headers = {};
		text.split(CARRIAGE_RETURN).forEach(e => {
			const text = e.split(':', 2);
			if (text.length == 2) {
				headers[text[0]] = text[1].trim();
			}
		});
		this.handle(headers, text);
	}

	onerror (error) {
		console.error(error);
		this.close();
	}

	onhandshake () {
		// Handshake done, switch to normal messages handler.
		this.handle = this.handleMessage;
	}

	send (data, encoding = 'utf8') {
		let header;
		const payload = Buffer.from(data, encoding);
		const len     = payload.length;

		if (len <= 0xff) {
			header = Buffer.alloc(2);
			header[1] = len;
		} else if (len <= 0xffff) {
			header = Buffer.alloc(4);
			header[1] = 126;
			header[2] = (len >> 8) & 0xff;
			header[3] = len & 0xff;
		} else { /* 0xffff < len <= 2^63 */
			header = Buffer.alloc(10);
			header[1] = 127;
			header[2] = (len >> 56) & 0xff;
			header[3] = (len >> 48) & 0xff;
			header[4] = (len >> 40) & 0xff;
			header[5] = (len >> 32) & 0xff;
			header[6] = (len >> 24) & 0xff;
			header[7] = (len >> 16) & 0xff;
			header[8] = (len >> 8) & 0xff;
			header[9] = len & 0xff;
		}
		header[0] = 0x81;

		const frame = Buffer.concat(
			[header, payload],
			header.length + len
		);

		try {
			this.socket.write(frame, 'binary');
		} catch (e) {
			console.error(e);
		}
	}
}

/**
 * Simple WebSocket server.
 * @class WebSocket
 *
 * Events:
 *
 *   close   ():               Server has been closed.
 *   connect (socket):         A client has connected.
 *   listen  (host, port):     Server has started listening.
 *   sent    (data, encoding): A message has been sent.
 */
class WebSocket extends EventEmitter {
	constructor () {
		super();
		this.clients = [];
		this.server  = net.createServer(this.connect.bind(this));
	}

	close () {
		this.clients.forEach(c => c.close());
		this.server.close();
		this.emit('closed');
	}

	connect (socket) {
		const client = new WebSocketClient(socket);
		this.clients.push(client);
		this.emit('connected', socket);
	}

	listen (host, port) {
		this.server.listen(port, host);
		this.emit('listening', host, port);
	}

	send (data, encoding='utf8') {
		this.clients.forEach(c => c.send(data, encoding));
		this.emit('sent', data, encoding);
	}
}

module.exports = {
	WebSocket,
	WebSocketClient
};
