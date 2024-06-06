/**
 * Validation module.
 * @module validation
 */

const {ValidationError} = require('nest/errors');

const ARG_SEPARATOR  = ':';
const RULE_SEPARATOR = '|';

/**
 * Build an object validator.
 *
 * Can be useful if in the case of an API endpoint that has to often validate
 * complex data. Build the validator at start, make the endpoint use it at each
 * call. Gain performance.
 *
 * @example
 * const MyValidator = new Validator({name: 'required'});
 * MyValidatior.validate({name: 'Joe'});
 *
 * @param {Object} rules - Set of rules.
 * @returns {function)   Instance of validator.
 */
function Validator (rules) {
	this.decoder  = decode(rules);
	this.rules    = rules;
	this.validate = (data) => validate(this, data);
}

/**
 * Build-in validation rules.
 *
 * Extend this object to add more rules.
 * A rule (function) must at least provide:
 *  - data:    object to validate.
 *  - key:     key of the value to validate.
 *  - value:   value to validate.
 *  - ...args: rules arguments.
 */
const Rules = {
	between: (data, key, value, min, max) => {
		if (value < min || value > max) {
			return `must be between ${min} and ${max}`;
		}
	},

	default: (data, key, value, type = String) => {
		if (data[key] == null) {
			data[key] = type(value);
		}
	},

	defaultBool: (d, k, v) => Rules.default(d, k, v, Boolean),
	defaultInt:  (d, k, v) => Rules.default(d, k, v, Number),

	in: (data, key, value, ...array) => {
		if (!array.includes(value)) {
			return 'not in [' + array.join(', ') + ']';
		}
	},

	number: (data, key, value) => {
		if (typeof value !== 'number' || Number.isNaN(value)) {
			return `must be a number`;
		}
	},

	required: (data, key, value) => {
		if (value === undefined) {
			return `required`;
		}
	},

	requiredif: (data, key, value, ref = '', condition = '', refValue = '') => {
		switch (condition) {
			case 'is':
				return ref in data &&
					data[ref].toString() == refValue &&
					!(key in data) ?
					`required if ${ref} is ${refValue}` : undefined;
		}
		return `wrong condition: "${ref} ${condition} ${refValue}`;
	}
};

/**
 * Decode the rules and create an array of validation operations.
 *
 * @param   {Object} rules - Rules to build.
 * @returns {Array}          Array of operations for each rule.
 */
const decode = (rules) => {
	/* Tricky operation.
	 * For
	 *   {'name': 'callback1:arg1:arg2|callback2:arg1:arg2'}
	 * Should return something like this:
	 *   [ ['name', [callback1, arg1, arg2], [callback2, arg1, arg2] ] ]
	 */
	return Object.entries(rules)
		.map(([k, v])    => [k, ...v.split(RULE_SEPARATOR)
		.map((r)         => r.split(ARG_SEPARATOR))
		.map(([a, ...b]) => [Rules[a], ...b])]);
};

/**
 * Validate data according to a validator.
 *
 * @param   {Validator} validator - Validator to use.
 * @param   {Object}    data      - Data to validate.
 * @returns {Object}                Validated data.
 * @throws  {ValidationError}       Validation errors.
 */
function validate (validator, data) {
	const errors = {};
		for (const [key, ...callbacks] of validator.decoder) {
			const messages = [];
			for (const [callback, ...args] of callbacks) {
				const error = callback(data, key, data[key], ...args);
				if (error) {
					messages.push(error);
				}
			}
			if (messages.length) {
				errors[key] = messages;
			}
		}
		if (Object.keys(errors).length) {
			throw new ValidationError(errors);
		}
		return data;
}

/**
 * Validate existence of keys in an object and return their value.
 *
 * @example
 * const [name] = validateKeys(data, 'name');
 *
 * @param   {Object} data     - Data of the request.
 * @param   {Array}  keys     - List of parameters to validate.
 * @throws  {ValidationError} Thrown if some parameters are missing.
 * @returns {Array}           Array containing needed parameters.
 */
function validateKeys (data, keys) {
	// NOTE: Could be done by using validateObject but this way is faster.
	if (!(data instanceof Object)) {
		const errors = Object.fromEntries(keys.map(i => [i, ['required']]));
		throw new ValidationError(errors);
	}
	const e = [];
	for (const key of keys) {
		if (!data.hasOwnProperty(key) ||
			data[key] == undefined ||
			data[key] == null) {
			e.push(key);
		}
	}
	if (e.length) {
		const errors = Object.fromEntries(e.map(i => [i, ['required']]));
		throw new ValidationError(errors);
	}
	return keys.map(e => data[e]); // Return needed data.
}

/**
 * Validate an object according to given rules.
 *
 * @example
 * validateObject(data, {
 *   name:   'required',
 *   age:    'required|number|between:0:100',
 *   phone:  'requiredif:age:is:16',
 *   gender: 'in:male:female',
 * });
 *
 * // If "age" was a string, the Error would return:
 *
 * {"errors": {"age": ["age must be a number"]}}
 *
 * @param  {Object} obj      - Object to validate.
 * @param  {Object} rules    - Set of rules.
 * @thrown {ValidationError} Thrown if the validation has failed.
 * @return {Object}          Object provided.
 */
function validateObject (data, rules) {
	return (new Validator(rules)).validate(data);
}

module.exports = {
	validate,
	validateKeys,
	validateObject,
	Rules,
	Validator,
	ValidationError
};