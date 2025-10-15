const assert     = require('node:assert');
const Cache      = require('nest/cache');
const CacheSQL   = require('nest/cache-sqlite');
const extensions = require('nest/extensions');
const http       = require('nest/http');
const log        = require('nest/log');
const nest       = require('nest');
const Request    = require('nest/requests');
const Server     = require('nest/server');
const validation = require('nest/validation');
const {
	NestError
} = require('nest/errors');

const HOST = 'localhost';
const PORT = 9000;

const app = nest({
	'GET': {
		'/hello': (req, res) => res.code(200).text('hello'),
		'/name':  (req, res) => res.json({name: 'Joe'}),
		'/fail':  (req, res) => { throw new Error('fail'); },
		'/id':    (req, res) => res.json({id: req.id})
	},
	'POST': {
		'/name': (req, res) => {
			const [name] = req.get('name');
			return res.json({name});
		}
	}
});

app.use(
	'request.get',
	'request.id',
	'request.validate',
	'response.file',
	'response.html',
	'response.render',
	'statics'
);

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

const test_extensions = async () => {
	// Register an extension.
	extensions.register('test', (instance) => {
		instance.test = () => {
			return 'hello';
		};
	});
	assert.doesNotThrow(
		() => app.use('test'),
		NestError,
		'extensions: valid extensions'
	);

	// Check extension.
	assert(app.test() == 'hello', 'extensions: check extension');

	// Try to load invalid extension.
	assert.throws(
		() => app.use('dummy'),
		NestError,
		'extensions: invalid extension'
  );

	let data, response;

  // Test - request.id
	{
	  response = await get('/id');
	  data = response.json;

	  assert(
	  	'id' in data,
	  	'extensions: request.id (existence check)'
	  );

	  const firstId = data.id;
	  assert(
	  	firstId !== undefined&& firstId.length == 36,
	  	'extensions: request.id (attribute check)'
	  );

	  response = await get('/id');
	  data = response.json;
	  const secondId = data.id;
	  assert(
	  	secondId !== undefined
	  	&& secondId.length == 36
	  	&& firstId.localeCompare(secondId) !== 0,
	  	'extensions: request.id (uniqueness check)'
	  );
	}
}

const test_server = async () => {
	const name = 'Jöë'; // Use something weird to check unicode.
  let response;

  // Check unknown route.
  response = await get('/?something');
  assert(response.status == 404, 'server: not found')

  // Check valid route + text response.
  response = await get('/hello', 'test');
  assert(response.status == 200 && response.text == 'hello', 'server: hello');

  // Check valid route + invalid JSON payload.
  response = await post('/name', name);
  assert(response.status == 422, 'server: name (text data)');

  // Check valid route + valid JSON payload.
  response = await post('/name', {name});
  assert(response.status == 200 && response.json.name == name, 'server: name (json data)');

  // Check for route with unmanaged error.
	response = await get('/fail');
	assert(response.status == 500, 'server: fail');
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
	assert(cache.has('test') === true, 'cache: set');

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
	let response;

	// Check for invalid JSON.
	response = await http.unsafe(opts);
	assert.throws(
		() => response.json,
		'http: invalid JSON'
	);

	// Check for valid JSON.
	response = await http.unsafe({path: '/name', ...opts});
	assert(response.json instanceof Object, 'http: expected json');
	assert(
		'name' in response.json && response.json.name == 'Joe',
		'http: valid JSON'
	);
}

const test_validation = () => {
	const data = {
		between_str:         'd',
		between_int:         '22',
		in:                  'd',
		number_good:         '1',
		number_bad:          'a',
		number_nan:          'NaN',
		regex_good:          'CH',
		regex_bad:           'CHE',
		requiredif_is_good:  true,
		requiredif_set_good: true,
	};
	const rules = {
		between_str:         'between:a:c',
		between_int:         'between:0:10',
		in:                  'in:a:b:c',
		number_good:         'number',
		number_bad:          'number',
		number_nan:          'number',
		regex_good:          'regex:^[A-Z]{2}$',
		regex_bad:           'regex:^[A-Z]{2}$',
		required:            'required',
		requiredif_set_good: 'requiredif:in',
		requiredif_set_bad:  'requiredif:hello',
		requiredif_is_good:  'requiredif:in:is:d',
		requiredif_is_bad:   'requiredif:in:is:2',
	};

	try {
		const b = new validation.Validator(rules);
		assert(b instanceof validation.Validator, 'validation: Validator');
		b.validate(data, rules);
		assert(true, 'validation: should not pass');
	} catch (e) {
		assert(e.errors !== undefined, 'validation: errors should be present');

		const { errors } = e;

		assert(
			errors.between_str[0].message == 'must be between a and c',
			'validation: between_str'
		);
		assert(
			errors.between_int[0].message == 'must be between 0 and 10',
			'validation: between_int'
		);
		assert(
			errors.in[0].message == 'not in [a, b, c]',
			'validation: in'
		);
		assert(
			errors.number_bad[0].message == 'must be a number',
			'validation: number_bad'
		);
		assert(
			errors.number_nan[0].message == 'must be a number',
			'validation: number_nan'
		);
		assert(
			!('regex_good' in errors),
			'validation: regex_good'
		);
		assert(
			errors.regex_bad[0].message == 'must match pattern: ^[A-Z]{2}$',
			'validation: regex_bad'
		);
		assert(
			errors.required[0].message == 'required',
			'validation: required'
		);
		assert(
			!('requiredif_set_good' in errors),
			'validation: requiredif_is_good'
		);
		assert(
			errors.requiredif_set_bad[0].message == 'required if hello is set',
			'validation: requiredif_set_bad'
		);
		assert(
			!('requiredif_is_good' in errors),
			'validation: requiredif_is_good'
		);
		assert(
			errors.requiredif_is_bad[0].message == 'required if in is 2',
			'validation: requiredif_is_good'
		);
	}

	assert.throws(
		() => validation.validateKeys(null, ['name']),
		{
			name: 'AssertError',
			message: 'data must be an object'
		},
		'validation: validateKeys (null)'
	);

	assert.throws(
		() => validation.validateKeys('test', ['name']),
		{
			name: 'AssertError',
			message: 'data must be an object'
		},
		'validation: validateKeys (null)'
	);
};

const main = async () => {
	await test_extensions();
	await test_server();
	await test_cache();
	await test_cache_sqlite();
	await test_http();
	test_validation();
	console.log('Tests passed.')
	app.close();
};

main();