# Requests

> Module: `nest/requests`
> Inherits: `http.IncomingMessage`

## Usage

```js
app.get('/', (req, res) => {
	const { name } = req.json;
});

app.post('/user/[id]?lang=fr', (req, res) => {
  const { id } = req.params;
  const { lang } = req.query;
  if (req.hasBody) {
	  const { name } = req.json;
  	const { id, lang, name } = req.data;
	  return res.json(users.update({ id, name }));
  } else {
    return res.code(400).json({ error: 'missing body' });
  }
})

// Forward requests to /forward to https://example.com/api/test.
app.post('/forward', async (req, res) => {
  req.forward({
    host: 'example.com',
    path: '/api/test'
  });
});
```

## Properties

| Property  | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `body`    | Raw body of the request.                                     |
| `data`    | Query & path parameters combined with JSON body if provided. |
| `hasBody` | Return `true` if request contains a body, or `false`.        |
| `headers` | Headers of the request.                                      |
| `json`    | JSON body of the request.                                    |
| `method`  | Method of the request.                                       |
| `path`    | Path of the URL.                                             |
| `params`  | Parameters of the path.                                      |
| `query`   | Parameters of the query.                                     |
| `res`     | Associated response.                                         |

## Methods

| Method                     | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `async forward(modifiers)` | Forward the request (same host/path/headers by default) directly to another API. It uses the [`request`](HTTP.md) method from `nest/http`. Use the `modifiers` parameter to apply modifications to the request such has `host` or `path`. |

