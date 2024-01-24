const {readFile} = require('fs/promises');
const {join}     = require('path');

/**
 * Return current timestamp in seconds.
 */
const now = () => Math.floor(Date.now() / 1000);

/**
 * Return the content of a static file.
 * @param {String} path - Path of the static file.
 */
const statics = async (path) => await readFile(path, {encoding: 'utf-8'});

module.exports = {
	now,
	statics
}