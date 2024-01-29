# HTTP

> Module: `nest/http`

> **Note: since Node.js v21, you can use the Fetch API instead.**

HTTP client module. Similar to Axios.

Requests are by default sent over HTTPS. For HTTP, use the `unsafe` call.

## Usage

```js
const http = require('nest/http');
const response = await http.get('https://example.com/json');
const response = await http.post('https//...', {
  headers: {authorization: 'Basic hello:world'},
  data:    {hello: 'World'}
});
console.log(response.code, response.json);
```

## Methods

| Methods                 | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `get(url, options)`     | Performs a GET request. Returns a `Response`.               |
| `post(url, options)`    | Performs a POST request. Returns a `Response`.              |
| `request(url, options)` | Performs a generic request. Returns a `Response`.           |
| `unsafe(url, options)`  | Performs a generic request over HTTP. Returns a `Response`. |

## Response

| Property  | Description                 |
| --------- | --------------------------- |
| `code`    | HTTP status code.           |
| `headers` | Headers sent by the server. |
| `json` | JSON response (if correctly formatted). |
| `raw`     | Body of the response.       |

## Options

Options are basically the same as Node's http module which you can see [here](https://nodejs.org/api/http.html#httprequestoptions-callback).

Base parameters:

| Property  | Description                                        |
| --------- | -------------------------------------------------- |
| `headers` | Object containing all headers.                     |
| `method`  | Method to use for the request (by default: `GET`). |

Additionnal parameters provided by Nest:

| Property | Description                                                  |
| -------- | ------------------------------------------------------------ |
| `data`   | Data to send (any format).                                   |
| `json`   | Flag to specify if the `data` is JSON-encoded (by default: `true`). |

