/**
 * Validation module.
 * @module validation
 */

const {
	assertIsArray,
	assertIsObject
} = require('nest/assert');
const {
	ValidationError
} = require('nest/errors');

const ARG_SEPARATOR  = ':';
const RULE_SEPARATOR = '|';
const TYPE_NUMBER    = 'number';

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
 * @returns {function)     Instance of validator.
 */
function Validator (rules) {
	assertIsObject(rules, `rules must be an object, got ${typeof(rules)}`);
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
		if (typeof(value) == TYPE_NUMBER) {
			min = Number(min) || min;
			max = Number(max) || max;
		}
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
		data[key] = Number(value) || value;
		if (typeof(data[key]) !== TYPE_NUMBER) {
			return 'must be a number';
		}
	},

	regex: (data, key, value, pattern) => {
		if (!value.match(pattern)) {
			return `must match pattern: ${pattern}`;
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
				if (!(
					ref in data &&
					data[ref].toString() == refValue &&
					key in data
				)) return `required if ${ref} is ${refValue}`;
			default:
				if (!(key in data)) return `required if ${ref} is set`;
		}
	}
};

/**
 * Decode the rules and create an array of validation operations.
 *
 * @param   {Object} rules - Rules to build.
 * @returns {Array}          Array of operations for each rule.
 */
const decode = (rules) => {
	/*
	 * Tricky operation.
	 * For:
	 *   {'name': 'callback1:arg1:arg2|callback2:arg1:arg2'}
	 * we should return something like this:
	 *   [ ['name', [callback1, arg1, arg2], [callback2, arg1, arg2] ] ]
	 */
	assertIsObject(rules, 'rules must be an object');
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
 * @throw   {AssertError}           Assertion errors..
 * @throws  {ValidationError}       Validation errors.
 */
function validate (validator, data) {
	assertIsObject(data, 'data must be an object');
	const errors = {};
	for (const [key, ...callbacks] of validator.decoder) {
		const messages = [];
		for (const [callback, ...args] of callbacks) {
			const error = callback(data, key, data[key], ...args);
			if (error) {
				messages.push({
					rule:    callback.name,
					args:    args,
					value:   data[key],
					message: error
				});
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
 * @throws  {AssertError}       Assertion errors..
 * @throws  {ValidationError}   Thrown if some parameters are missing.
 * @returns {Array}             Array containing needed parameters.
 */
function validateKeys (data, keys) {
	assertIsObject(data, 'data must be an object');
	assertIsArray(keys);
	let e = [];
	for (const key of keys) {
		if (!data.hasOwnProperty(key) ||
			data[key] == undefined ||
			data[key] == null) {
			e.push(key);
		}
	}
	if (e.length > 0) {
		const errors = Object.fromEntries(e.map(i => [i, ['required']]));
		throw new ValidationError(errors);
	}
	return keys.map(k => data[k]); // Return needed data.
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
 * @thrown {ValidationError}   Thrown if the validation has failed.
 * @return {Object}            Object provided.
 */
function validateObject (data, rules) {
	return (new Validator(rules)).validate(data);
}

module.exports = {
	validate,
	validateKeys,
	validateObject,
	Rules,
	Validator
};