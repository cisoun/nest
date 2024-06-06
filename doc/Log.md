# Log

>  Module: `nest/log`

Provides a logging mechanism based on the `console` object.
Each message is prefixed with the current UTC time and level.

## Usage

```js
const log = require('nest/log');
log.info('Hello world!'); // [2024-06-04T07:04:31.445Z] INFO: Hello world!
```

## Methods

| Method          | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `debug(...args)` | Outputs a message to the console at the "debug" log level. Similar to `console.debug`. |
| `error(...args)` | Outputs an error message to the console. Similar to `console.error`. |
| `info(...args)` | Outputs an informational message to the console. Similar to `console.info`. |
| `log(..args)` | Outputs a message to the console. Similar to `console.log`. |
| `print(tag, callback, ...args)` | Formats the output. Override this to change the logging format. |
| `warn(...args)` | Outputs a warning message to the console. Similar to `console.warn`. |
