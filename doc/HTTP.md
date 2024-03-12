# HTTP

> Module: `nest/http`

> **Note: since Node.js v21, you can use the Fetch API instead.**

HTTP client module. Similar to Axios.

Requests are by default sent over HTTPS. For HTTP, use the `unsafe` call.

## Usage

```js
const http = require('nest/http');
await http.get('https://example.com/json');
await http.post('https//...', {
  headers: {authorization: 'Basic hello:world'},
  data:    {hello: 'World'}
});
await http.request({
  method: 'POST',
  host:   'example.com',
  path:   '/api',
  data:   {name: 'Joe'}
}).then(response => {
  console.log(response.status, response.json);
});
```

## Methods

| Methods              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `get(url, options)`  | Performs a GET request. Returns a `Response`.                  |
| `post(url, options)` | Performs a POST request. Returns a `Response`.                 |
| `request(options)`   | Performs a generic request like `fetch`. Returns a `Response`. |
| `unsafe(options)`    | Performs a generic request over HTTP. Returns a `Response`.    |

## Options

Options are basically the same as Node's http module which you can see [here](https://nodejs.org/api/http.html#httprequestoptions-callback).

Base parameters:

| Property  | Description                                        |
| --------- | -------------------------------------------------- |
| `headers` | Object containing all headers.                     |
| `host`    | Domain or IP address of the host.                  |
| `method`  | Method to use for the request (by default: `GET`). |
| `path`    | Path of the request.                               |

Additionnal parameters provided by Nest:

| Property | Description                                                         |
| -------- | ------------------------------------------------------------------- |
| `data`   | Data to send (any format).                                          |
| `json`   | Flag to specify if the `data` is JSON-encoded (by default: `true`). |

## Response

| Property  | Description                             |
| --------- | --------------------------------------- |
| `status`  | HTTP status code.                       |
| `headers` | Headers sent by the server.             |
| `json`    | JSON response (if correctly formatted). |
| `raw`     | Body of the response.                   |
