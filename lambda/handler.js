const { getHtml, getUrl, extractData, findExactMatches } = require('./helpers');
const {
	errorParsingJSONMsg,
	noMovieQueryProvidedMsg,
	reccomendationsMsg,
	noMoviesFoundMsg,
	movieFoundMsg,
	movieFoundInCacheMsg,
	multipleMoviesFoundMsg } = require('./responses');
const createCache = require('./cache');


module.exports.getMovieData = async (event, context) => {
	const { queryStringParameters: query } = event;
	const movieTitle = (query && query.movieTitle) || null;
	if (!movieTitle) {
		return noMovieQueryProvidedMsg();
	}

	const redisHost = process.env.REDIS_HOST;
	const redisPassword = process.env.REDIS_PASSWORD;
	const cache = createCache(redisHost, redisPassword);
	try {
		const result = await cache.get(movieTitle);
		if (result) {
			cache.quit();
			return movieFoundInCacheMsg(JSON.parse(result));
		}
	} catch (e) {
		console.log(`Error querying cache for ${movieTitle}: ${e.message}`);
	}

	const url = getUrl(movieTitle);
	const html = await getHtml(url);
	const dataStr = extractData(html);
	if (dataStr === '') {
		cache.quit();
		return noMoviesFoundMsg(movieTitle);
	}
	const dataJSON = dataStr.slice(0, -2);

	try {
		const data = JSON.parse(dataJSON);

		const exactMatchesFound = findExactMatches(data, movieTitle);
		if (exactMatchesFound.length === 1) {
			// cache it
			cache.set(movieTitle, JSON.stringify(exactMatchesFound[0]));
			cache.quit();
			return movieFoundMsg(exactMatchesFound[0]);
		}
		cache.quit(); // TODO: remove this if we cache not just exact match found movies
		if (exactMatchesFound.length > 1) {
			return multipleMoviesFoundMsg(movieTitle, exactMatchesFound);
		}

		return reccomendationsMsg(movieTitle, data.movies);
	} catch (e) {
		return errorParsingJSONMsg(e, { faultyJSON: dataStr });
	}
};

// useful resources
// Useful commands
// https://serverless.com/framework/docs/providers/aws/guide/quick-start/
// Async with lambda
// http://www.goingserverless.com/blog/how-async-lambda-handlers-work-in-node-8-10
// Testing function locally
// ../node_modules/.bin/serverless invoke local --function hello --path data.json
// Logs
// https://serverless.com/framework/docs/providers/aws/cli-reference/logs/
// invoking function more useful resources
// https://serverless.com/framework/docs/providers/aws/cli-reference/invoke/