/**
 * Logging module.
 * @module log
 */

const { inspect } = require('node:util');

/**
 * Colors activation flag based on environment variables.
 * Assume it's opt-in.
 *
 * @see https://nodejs.org/api/cli.html#no_colorany
 * @see https://nodejs.org/api/cli.html#force_color1-2-3
 * @see https://nodejs.org/api/cli.html#node_disable_colors1
 */
const USE_COLORS = (
		['true', '1', '2', '3'].includes(process.env.FORCE_COLOR) ||
		['false', '0'].includes(process.env.NODE_DISABLE_COLORS) ||
		['false', '0'].includes(process.env.NO_COLOR)
	);

const object = (o, callback = log) => {
	callback(inspect(o, { depth: null, colors: false || USE_COLORS, compact: false }));
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
