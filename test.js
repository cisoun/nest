const Cache      = require('nest/cache');
const CacheSQL   = require('nest/cache-sqlite');
const Request    = require('nest/requests');
const Server     = require('nest/server');
const http       = require('nest/http');
const validation = require('nest/validation');
const nest       = require('nest');
require('nest/extensions')([
	'request.json',
	'request.validate',
	'response.json'
]);

const HOST = 'localhost';
const PORT = 9000;

Request.prototype.validate = function (...args) {
	return validation.validateKeys(this.json, args);
}

Server.prototype.onresponse = function (req, res) {
  const date = new Date().toISOString();
  const {statusCode}        = res;
  const {method, url, body} = req;
  console.log(`[${date}] ${statusCode} ${method} ${url} ${body}`);
}

Server.prototype.onerror = function (req, res, e) {
	res.code(422).json({error: e});
}

const assert = (assertion, message) => {
	console.assert(assertion, message);
	if (!assertion) {
		console.error('Tests failed...');
		process.exit(1);
	}
}

const get = (path, data = null, options = {}) => {
  options.data   = data;
  options.method = options.method || 'GET';
  options.json   = options.json   || false;
  return http.unsafe(`http://${HOST}:${PORT}${path}`, options);
}

const post = (path, data, headers = {}) => {
  return get(path, data, {headers, method: 'POST', json: true});
}

const sleep = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const test_extensions = () => {
	try {
		require('nest/extensions')(['dummy']);
		assert(false, 'extensions: should not exist');
	} catch {}
	try {
		require('nest/extensions')(['response.json']);
	} catch {
		assert(false, 'extensions: should exist');
	}
}

const test_server = async () => {
	const app = nest();
	app.get('/hello', (req, res) => res.code(200).text('hello'));
	app.post('/name', (req, res) => {
		const [name] = req.validate('name');
		return res.text(name);
	});
	app.run(HOST, PORT);

  let response;
  response = await get('/?something');
  assert(response.code == 404, 'server: short query')
  response = await get('/hello', 'test');
  assert(response.code == 200 && response.raw == 'hello', 'server: hello');
  response = await post('/name', 'Joe');
  assert(response.code == 422, 'server: name (text data)')
  response = await post('/name', {name: 'Joe'});
  assert(response.code == 200 && response.raw == 'Joe', 'server: name (json data)');
  app.close();
};

const test_cache = async () => {
	let data;
	const cache = new Cache();
	// Key is not there.
	assert(!cache.has('test'), 'cache: has');
	data = cache.get('test');
	assert(data === undefined, 'cache: get (bad key)');
	assert(!cache.has('test'), 'cache: has');
	// Set a key.
	cache.set('test', 1);
	assert(cache.has('test'), 'cache: set');
	// Check key.
	assert(cache.get('test') == 1, 'cache: get');
	// Remove key.
	cache.unset('test');
	//await sleep(2000);
	assert(!cache.has('test'), 'cache: unset');
};

const test_cache_sqlite = async () => {
	let data;
	// Instance.
	const cache = new CacheSQL('test.db');
	assert(cache instanceof CacheSQL, 'cache-sqlite: instance');
	// Clear.
  data = await cache.clear();
  // Get a non-existing key.
  data = await cache.get('test');
  assert(data == undefined, 'cache-sqlite: get');
  // Set a key.
  data = await cache.set('test', 'hello world', 1);
  // Check key.
  data = await cache.has('test');
  assert(data == '1', 'cache-sqlite: has');
  // Dump.
  data = await cache.dump();
  assert(data.length == 1, 'cache-sqlite: dump');
  // Get a key (during TTL).
  data = await cache.get('test');
  assert(data == 'hello world', 'cache-sqlite: get (during TTL)');
  // Get a key (after TTL).
  await sleep(2000);
  data = await cache.get('test');
  assert(data == undefined, 'cache-sqlite: get (after TTL)');
  cache.close();
}

const test_http = async () => {
	const app = nest();
	app.get('/', (req, res) => res.code(200).json({'name': 'Joe'}));
	app.listen(HOST, PORT);
	const response = await http.unsafe(`http://${HOST}:${PORT}`);
	assert(response.json !== undefined, 'http: no json');
	const data = response.json;
	assert('name' in data && data.name == 'Joe', 'http: data not found');
	app.close();
}

const test_validation = () => {
	const data = {
		name:   'joe',
		age:    '9001',
		gender: 'vodka'
	};
	const rules = {
		name:    'required',
		age:     'required|number|between:0:100',
		phone:   'requiredif:age:is:9001',
		gender:  'in:male:female',
	};
	try {
		const b = new validation.Validator(rules);
		b.validate(data, rules);
	} catch (e) {
		const {errors} = e;
		assert(
			errors.age[0]    == 'must be a number' &&
			errors.age[1]    == 'must be between 0 and 100' &&
			errors.phone[0]  == 'required if age is 9001' &&
			errors.gender[0] == 'not in [male, female]',
		'validation');
	}
};

const main = async () => {
	test_extensions();
	await test_server();
	await test_cache();
	await test_cache_sqlite();
	await test_http();
	test_validation();
	console.log('Tests passed.')
};

main();