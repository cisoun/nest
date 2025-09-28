# Assert

>  Module: `nest/assert`

Provides assertion utilities that can be toggled on or off.

> [!WARNING]
> To activate assertions, set the `ASSERT` environement variable to 1.
> We recommend to not activate them in production.

## Usage

```js
const assert = require('nest/assert');

// Will be executed only if the "ASSERT" environment variable is set to 1.
assert(age >= 18, 'must be at least 18 years old');
```

## Methods

| Method                             | Description                 |
| ---------------------------------- | --------------------------- |
| `assert(condition [, message])`    | Assert a condition.         |
| `assertIsArray(data [, message])`  | Assert a data is an array.  |
| `assertIsObject(data [, message])` | Assert a data is an object. |