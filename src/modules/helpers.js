const {readFile} = require('fs/promises');
const {
	extname,
	join
} = require('path');

const fileExtension = extname;
const fileRead = readFile;

/**
 * Return current timestamp in seconds.
 */
const now = () => Math.floor(Date.now() / 1000);

/**
 * Return the content of a static file.
 * @param {String} path - Path of the static file.
 */
const statics = async (path) => await readFile(`statics/${path}`);

module.exports = {
	fileExtension,
	fileRead,
	now,
	statics
}