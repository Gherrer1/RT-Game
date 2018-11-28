const redis = require('redis');
const { promisify } = require('util');

module.exports = function createCache(redisHost, redisPassword) {
	const client = redis.createClient({
		port: 12066,
		host: redisHost,
		password: redisPassword,
	});

	const getAsync = promisify(client.get).bind(client);
	const setAsync = promisify(client.set).bind(client);

	return {
		get: getAsync,
		set: setAsync,
		quit: () => client.quit(),
	};
};
