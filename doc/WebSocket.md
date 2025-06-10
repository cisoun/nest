# WebSocket

>  Module: `nest/websocket`

Provides a WebSocket server.

## Server

> Class: `WebSocket`

### Notes

- Current state only allows messages broadcast.
- Each WebSocket connection is wrapped in a `WebSocketClient` class instance that you can import from `nest/websocket`. Please refer to [websocket.js](../src/modules/websocket.js) for more informations.

### Usage

```js
const {WebSocket} = require('nest/websocket');
const server = new WebSocket();
server.on('connected', (client) => {
	// Say hi to client when connected.
	client.send('Hello you!');
});
server.listen('127.0.0.1', 8080);
server.send('Hello world!'); // Say hello to all clients.
```

### Methods

| Method                          | Description                            |
| ------------------------------- | -------------------------------------- |
| `close()`                       | Close the server.                      |
| `connect(socket)`               | Connection callback.                   |
| `listen(host, port)`            | Starts listening for connections.      |
| `send(data, encoding = 'utf8')` | Sends encoded data to all connections. |

### Events

| Event                   | Description                 |
| ----------------------- | --------------------------- |
| `closed()`              | Server has shut down.       |
| `connected(client)`     | A new client has connected. |
| `listening(host, port)` | Server is listening.        |
| `sent(data)`            | Data have been sent.        |

## Client

> Class: `WebSocketClient`

### Method

| Method                          | Description              |
| ------------------------------- | ------------------------ |
| `close()`                       | Close the connection.    |
| `send(data, encoding = 'utf8')` | Send data to the client. |

### Events

| Event         | Description                                           |
| ------------- | ----------------------------------------------------- |
| `handshake()` | Handshake with the server has been made successfully. |

