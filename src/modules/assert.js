/**
 * Assertions module.
 * @module assert
 */

const { AssertError } = require('nest/errors');
const { nop }         = require('nest/helpers');

const DEBUG = process.env.DEBUG == '1';

const assert = (condition, m = null) => {
	if (!condition) {
		throw new AssertError(m ?? `condition has failed`);
	}
};

const assertIsArray = (o, m = null) => {
	if (!Array.isArray(o)) {
		throw new AssertError(m ?? `expected array, got ${typeof(o)}`);
	}
}

const assertIsObject = (o, m = null) => {
	if (!(o instanceof Object)) {
		throw new AssertError(m ?? `expected object, got ${typeof(o)}`);
	}
}

module.exports = {
	AssertError,
	assertIsArray: DEBUG ? assertIsArray : nop,
	assertIsObject: DEBUG ? assertIsObject : nop
};