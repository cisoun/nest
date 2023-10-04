/**
 * Cryptography module.
 * @module crypt
 */

const {Buffer} = require('buffer');

class CryptError extends Error {}

const decodeBase64    = (data) => Buffer.from(data, 'base64').toString();
const decodeBasicAuth = (token) => {
	const data    = decodeBase64(token);
	const limiter = data.indexOf(':');
	if (limiter == -1) {
		throw new CryptError('token is malformed');
	}
	const user = data.slice(0, limiter);
	const pass = data.slice(limiter + 1);
	return [user, pass];
};
const encodeBase64    = (data) => Buffer.from(data).toString('base64');
const encodeBasicAuth = (user, pass) => encodeBase64([user, pass].join(':'));

module.exports = {
	decodeBase64,
	decodeBasicAuth,
	encodeBase64,
	encodeBasicAuth,
};