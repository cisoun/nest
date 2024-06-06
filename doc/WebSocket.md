# WebSocket

>  Module: `nest/websocket`

Provides a WebSocket server.

## Usage

```js
const {WebSocketServer} = require('nest/websocket');
const server = new WebSocketServer();
server.on('connect', (socket) => {
  // Say hi to client when connected.
  socket.send('Hello you!');
});
server.listen('127.0.0.1', 8080);
server.send('Hello world!'); // Say hello to all clients.
```

## Methods

| Method                          | Description                            |
| ------------------------------- | -------------------------------------- |
| `close()`                       | Close the server.                      |
| `connect(socket)`               | Connection callback.                   |
| `listen(host, port)`            | Starts listening for connections.      |
| `send(data, encoding = 'utf8')` | Sends encoded data to all connections. |

## Notes

- Current state only allows messages broadcast.
- Each WebSocket connection is wrapped in a `WebSocket` class instance that you can import from `nest/websocket`. Please refer to [websocket.js](../src/modules/websocket.js) for more informations.