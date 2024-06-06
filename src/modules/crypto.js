/**
 * Cryptography module.
 * @module crypto
 */

const crypto   = require('crypto');
const {Buffer} = require('buffer');

class CryptoError extends Error {}

const fromBase64    = (data) => Buffer.from(data, 'base64').toString();
const fromBasicAuth = (token) => {
	const data    = toBase64(token);
	const limiter = data.indexOf(':');
	if (limiter == -1) {
		throw new CryptoError('token is malformed');
	}
	const user = data.slice(0, limiter);
	const pass = data.slice(limiter + 1);
	return [user, pass];
};
const toBase64    = (data)       => Buffer.from(data).toString('base64');
const toBasicAuth = (user, pass) => toBase64([user, pass].join(':'));
const toSHA1      = (data)       => crypto.hash('sha1').update(data);

const hash = (data, algorithm, encoding = null) => {
	return crypto.createHash(algorithm).update(data).digest(encoding);
}

module.exports = {
	fromBase64,
	fromBasicAuth,
	toBase64,
	toBasicAuth,
	toSHA1
};