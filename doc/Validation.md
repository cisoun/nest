# Validation

## Usage

```js
const validation = require('nest/validation');

const PersonValidator = new Validator({
	name:       'required',
	age:        'required|number|between:0:100',
	gender:     'in:male:female:other',
	salutation: 'requiredif:gender:is:other'
});

app.get('/', (req, res) => {
	const { name, age, gender } = PersonValidator.validate(req.json);
});
```

### Methods

| Property                      | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| `validateKeys(data, params)`  | Check if an object contains the given keys and return them.<br />Example: `const [name, age] = validateKeys(obj, ["name", "age"]);` |
| `validateObject(data, rules)` | ...                                                          |

#### Exceptions

`ValidationError`: the validation has failed. Errors are provided as the `errors` property.

## Rules

| Rule                                     | Description                                                  |
| ---------------------------------------- | ------------------------------------------------------------ |
| `between:<str|int>:<str|int>`            | Must be greater or equal to A and lesser or equal to B. If value is a number, A and B will be considered as numbers as well. |
| `defaultBool:<bool>`                     | Set default boolean value.                                   |
| `defaultInt:<int>`                       | Set default integer value.                                   |
| `in:A:B:C`                               | Must be either A, B, or C.                                   |
| `number`                                 | Must be a number and will be converted as a number.          |
| `required`                               | Argument is required.                                        |
| `requiredif:<key>[:<condition>:<value>]` | Argument is required if argument `<key>` is given. Or if it fulfills `<condition>` with `<value>`.<br /><br />Conditions are:<br />- `is`: `<key>` must be `<value>`. |

