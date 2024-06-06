const assert      = require('node:assert');
const Cache       = require('nest/cache');
const CacheSQL    = require('nest/cache-sqlite');
const http        = require('nest/http');
const log         = require('nest/log');
const nest        = require('nest');
const Request     = require('nest/requests');
const Server      = require('nest/server');
const validation  = require('nest/validation');
const {NestError} = require('nest/errors');

require('nest/extensions')(
	'request.validate'
);

const HOST = 'localhost';
const PORT = 9000;

Request.prototype.validate = function (...args) {
	return validation.validateKeys(this.json, args);
}

const app = nest({
	'GET': {
		'/hello': (req, res) => res.code(200).text('hello'),
		'/name':  (req, res) => res.json({name: 'Joe'})
	},
	'POST': {
		'/name': (req, res) => {
			const [name] = req.validate('name');
			return res.json({name});
		}
	}
});
assert(app instanceof Server, 'server: instance');
app.on('response', (req, res) => {
  const {status}          = res;
  let {method, url, body} = req;
  method = method.padEnd(4, ' ');
  log.info(`${status} ${method} ${url} ${body}`);
});
app.run(HOST, PORT);

const get = (path, data = null, options = {}) => {
	options.host     = HOST;
	options.path     = path;
	options.port     = PORT;
  options.data     = data;
  options.json   ||= false;
  options.method ||= 'GET';
  return http.unsafe(options);
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
	assert.throws(() => {
		require('nest/extensions')('dummy');
	})
}

const test_server = async () => {
	const name = 'Jöë'; // Use something weird to check unicode.
  let response;
  response = await get('/?something');
  assert(response.status == 404, 'server: not found')
  response = await get('/hello', 'test');
  assert(response.status == 200 && response.text == 'hello', 'server: hello');
  response = await post('/name', name);
  assert(response.status == 422, 'server: name (text data)');
  response = await post('/name', {name});
  assert(response.status == 200 && response.json.name == name, 'server: name (json data)');
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
	const opts = {host: HOST, port: PORT};
	let response = await http.unsafe(opts);
	assert.throws(() => response.json, 'http: no json');
	response = await http.unsafe({path: '/name', ...opts});
	assert(response.json instanceof Object, 'http: expected json');
	assert('name' in response.json && response.json.name == 'Joe', 'http: data not found');
}

const test_validation = () => {
	const data = {
		name:   'joe',
		age:    '9001',
		gender: 'vodka'
	};
	const rules = {
		name:   'required',
		age:    'required|number|between:0:100',
		phone:  'requiredif:age:is:9001',
		gender: 'in:male:female',
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
			'validation'
		);
	}
};

const main = async () => {
	//test_extensions();
	await test_server();
	await test_cache();
	await test_cache_sqlite();
	await test_http();
	test_validation();
	console.log('Tests passed.')
	app.close();
};

main();