# Validation

### Methods

| Property                    | Description                                                  |
| --------------------------- | ------------------------------------------------------------ |
| validateKeys(data, params)  | Check if an object contains the given keys and return them.<br />Example: `const [name, age] = validateKeys(obj, ["name", "age"]);` |
| validateObject(data, rules) | ...                                                          |

#### Exceptions

`ValidationError`: the validation has failed. Errors are provided as the `errors` property.