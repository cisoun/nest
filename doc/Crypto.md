# Crypto

> Module: `nest/crypto`

Provide cryptography utility functions.

## Usage

```js
const crypto = require('nest/crypto');
const token = crypto.toBasicAuth('Joe', 'Password123');
```

## Methods

| Method                    | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `fromBase64(data)`        | Decode a base64 string.                                      |
| `fromBasicAuth(token)`    | Decode a basic authentication token into an array containing the user and the password. |
| `toBase64(data)`          | Encode a string in Base64.                                   |
| `toBasicAuth(user, pass)` | Encode a user and a password into a basic authentication token. |
| `toSHA1(data)`            | Hash a data into SHA1.                                       |

