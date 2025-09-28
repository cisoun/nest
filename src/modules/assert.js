/**
 * Assertions module.
 * @module assert
 *
 * Assertions only work if the ASSERT environment variable is set to '1'.
 */

const { AssertError } = require('nest/errors');
const { nop }         = require('nest/helpers');

const ASSERT = process.env.ASSERT == '1';

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
	assertIsArray: ASSERT ? assertIsArray : nop,
	assertIsObject: ASSERT ? assertIsObject : nop
};