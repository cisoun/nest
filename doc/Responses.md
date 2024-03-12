# Responses

>  Module: `nest/responses`

## Usage

```js
app.get('/', (req, res) => {
  // Use `res` here.
});
```

## Properties

| Property | Description                   |
| -------- | ----------------------------- |
| `status` | Returns the HTTP status code. |

## Methods

| Method       | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `code(code)` | Defines a HTTP status code. **If called, must be put at first!** |
| `end()`      | Sends the response. It is usually not necessary to call it.  |
| `json(data)` | Sends a JSON data. Available through the `response.json` [extension](Extensions.md). |
| `text(text)` | Defines a text to send.                                      |
