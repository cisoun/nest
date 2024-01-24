/**
 * HTTP client module.
 * @module http
 *
 * Note: since Node.js v21, you can use the Fetch API instead.
 *
 * Usage:
 *
 *   http.get(url, options):            Shortcut for GET requests.
 *   http.post(url, options):           Shortcut for POST requests.
 *   http.request(url, options):        Generic request.
 *
 * Options:
 *
 *   Same parameter as http.request's options but with additional attributes.
 *
 *   options.data (str):                Data to send.
 *   options.json (bool, default=true): Send data as JSON.
 */

const http  = require('http');
const https = require('https');
const url   = require('url');

class Response {
	constructor (code, headers, data) {
		this.code    = code;
		this.headers = headers;
		this.raw     = data;
	}
	get json () { return JSON.parse(this.raw); }
}

const basicAuth = (user, pass) => user + ':' + pass;

/**
 * Do a GET request.
 *
 * @param   {string} url     - URL of the request.
 * @param   {object} options - List of options from Node's http.request.
 * @returns {object}           Response as object.
 * @throws  {*}                See `request`.
 */
const get = async (url, options = {}) => {
	options.method = 'GET';
	return await request(url, options);
};

const handleData = (options) => options.data || '';

const handleResponse = (response, data) => {
	return new Response(response.statusCode, response.headers, data.join(''));
}

/**
 * Do a POST request.
 *
 * @param   {string} url     - URL of the request.
 * @param   {object} options - List of options from Node's http.request.
 * @returns {object}           Response as object.
 * @throws  {*}                See `request`.
 */
const post = async (url, options = {}) => {
	options.method = 'POST';
	return await request(url, options);
}

/**
 * Do a HTTP(S) request.
 *
 * Options: https://nodejs.org/api/http.html#http_http_request_options_callback
 *
 * @param   {string}  url          - URL of the request.
 * @param   {object}  options      - List of options from Node's http.request.
 * @param   {*}       options.data - Data to send.
 * @param   {boolean} options.json - Send data as JSON.
 * @param   {object}  handler      - Node HTTP backend (http/https).
 * @returns {object}                 Response as object.
 * @throws  {UnreachableHostError}   Host is unreachable.
 */
const request = (url, options = {}, handler = https) => {
	transformRequest(options);
	return new Promise((resolve, reject) => {
		handler.request(url, options, res => {
			const data = [];
			res.setEncoding('utf8');
			res.on('data', d => data.push(d));
			res.on('end', () => resolve(handleResponse(res, data)));
		})
		.on('error', error => reject(error))
		.end(handleData(options));
	}).catch(e => {
		switch (e.code) {
			case 'ENOTFOUND': throw new Error('cannot reach host (' + url + ')');
			default:          throw e;
		}
	});
};

const transformRequest = (options = {}) => {
	options.headers                   = options.headers || {};
	options.headers['Content-Length'] = 0;
	if (options.data !== undefined) {
		if (typeof options.data === 'object') {
			options.data   = JSON.stringify(options.data);
			options.json ??= true; // Make it true by default.
			if (options.json) {
				options.headers['Content-Type'] = 'application/json';
			}
		}
		options.headers['Content-Length'] = options.data.length;
	}
}

const unsafe = (url, options) => request(url, options, http);

module.exports = {
	basicAuth,
	get,
	post,
	request,
	unsafe
};