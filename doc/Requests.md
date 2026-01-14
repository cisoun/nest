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
  const { name } = req.json;
  return users.update({ id, name });
})
```

## Properties

| Property  | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `body`    | Raw body of the request.                                     |
| `headers` | Headers of the request.                                      |
| `json`    | JSON body of the request.                                    |
| `method`  | Method of the request.                                       |
| `path`    | Path of the URL.                                             |
| `params`  | Parameters of the path.                                      |
| `query`   | Parameters of the query.                                     |
| `res`     | Associated response.                                         |