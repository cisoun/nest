/**
 * Cryptography module.
 * @module crypto
 */

const crypto          = require('crypto');
const { CryptoError } = require('nest/errors');
const { Buffer }      = require('buffer');

const fromBase64 = (data) => Buffer.from(data, 'base64').toString();

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

const hash = (data, algorithm, encoding = 'utf8') => {
	return crypto.createHash(algorithm).update(data).digest(encoding);
}

const toBase64    = (data)       => Buffer.from(data).toString('base64');
const toBasicAuth = (user, pass) => toBase64([user, pass].join(':'));
const toSHA1      = (data)       => hash(data, 'sha1');

const uuid4 = () => {
	return crypto.randomUUID();
}

module.exports = {
	fromBase64,
	fromBasicAuth,
	hash,
	toBase64,
	toBasicAuth,
	toSHA1
	uuid4
};
