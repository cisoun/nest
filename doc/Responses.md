# Responses

>  Module: `nest/responses`

## Usage

```js
app.get('/', (req, res) => {
	res.code(200).text('Here some text.');
});
```

## Properties

| Property | Description                   |
| -------- | ----------------------------- |
| `status` | Returns the HTTP status code. |

## Methods

All methods can be chained.

> **Warning**: if `code()` is used (as you should), use it first!

| Method       | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `code(code)` | Defines a HTTP status code.                                  |
| `end()`      | Sends the response. Usually not necessary to call as the server already handles it. |
| `file(path)` | Sends a file to the client. Available through the `response.file` [extension](Extensions.md). |
| `json(data)` | Sends a JSON data.                                           |
| `text(text)` | Defines a text to send.                                      |
