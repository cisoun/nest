# Requests

> Module: `nest/requests`

## Usage

```js
app.get('/', (req, res) => {
  const {name} = req.json;
});
```

## Properties

| Property | Description              |
| -------- | ------------------------ |
| `body`          | Raw body of the request.                                     |
| `headers`       | Headers of the request.                                      |
| `json` | JSON body of the request. Available through the `request.json` [extension](Extensions.md). |
| `method`        | Method of the request.                                       |
| `path`          | Path of the URL.                                             |
| `query`         | Query parameters of the URL.                                 |

