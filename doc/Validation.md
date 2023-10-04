# Validation

## Usage

```js
const validation = require('nest/validation');

const PersonValidator = new Validator({
	name:   'required',
	age:    'required|between:0:100',
	gender: 'in:male:female:other'
});

app.get('/') = (req, res) => {
  const {name, age, gender} = PersonValidator.validate(req.json);
}
```

### Methods

| Property                      | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| `validateKeys(data, params)`  | Check if an object contains the given keys and return them.<br />Example: `const [name, age] = validateKeys(obj, ["name", "age"]);` |
| `validateObject(data, rules)` | ...                                                          |

#### Exceptions

`ValidationError`: the validation has failed. Errors are provided as the `errors` property.