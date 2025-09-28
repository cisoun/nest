const {readFile} = require('fs/promises');
const {
	extname,
	join
} = require('path');

const fileExtension = extname;
const fileRead = readFile;

/**
 * Empty function.
 */
const nop = () => {};

/**
 * Return current timestamp in seconds.
 */
const now = () => Math.floor(Date.now() / 1000);

/**
 * Return the content of a static file.
 * @param {String} path - Path of the static file.
 */
const statics = (path) => readFile(`statics/${path}`, {encoding: 'utf8'});

module.exports = {
	fileExtension,
	fileRead,
	nop,
	now,
	statics
};