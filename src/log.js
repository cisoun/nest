/**
 * Logging module.
 * @module log
 */

const { inspect } = require('node:util');

const object = (o, callback = log) => {
	callback(inspect(o, {depth: null, colors: true, compact: false}));
}

const format = (tag, callback, ...args) => {
	const date = new Date().toISOString();
	callback(`[${date}] ${tag}:`, ...args);
}

const debug = (...args) => format('DEBUG', console.debug, ...args);
const error = (...args) => format('ERROR', console.error, ...args);
const info  = (...args) => format('INFO',  console.info,  ...args);
const log   = (...args) => format('LOG',   console.log,   ...args);
const warn  = (...args) => format('WARN',  console.warn,  ...args);

module.exports = {
	debug,
	error,
	format,
	info,
	log,
	object,
	warn,
};
