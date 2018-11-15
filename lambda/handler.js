'use strict';
const { getHtml, getUrl, extractData, findExactMatches } = require('./helpers');
const {
  errorParsingJSONMsg,
  noMovieQueryProvidedMsg,
  reccomendationsMsg,
  noMoviesFoundMsg,
  movieFoundMsg,
  multipleMoviesFoundMsg } = require('./responses');


module.exports.getMovieData = async (event, context) => {
  const { queryStringParameters: query } = event;
  const movieTitle = (query && query.movieTitle) || null;
  if(!movieTitle) {
    return noMovieQueryProvidedMsg();
  }

  const url = getUrl(movieTitle);
  const html = await getHtml(url);
  const dataStr = extractData(html);
  if (dataStr === '') {
    return noMoviesFoundMsg(movieTitle);
  }
  const dataJSON = dataStr.slice(0, -2);

  try {
    const data = JSON.parse(dataJSON);

    const exactMatchesFound = findExactMatches(data, movieTitle);
    if (exactMatchesFound.length === 1) {
      return movieFoundMsg(exactMatchesFound[0]);
    }
    else if (exactMatchesFound.length > 1) {
      return multipleMoviesFoundMsg(movieTitle, exactMatchesFound);
    }
    else {
      return reccomendationsMsg(movieTitle, data.movies);
    }
  } catch(e) {
    return errorParsingJSONMsg(e, { faultyJSON: dataStr });
  }
}

// useful resources
// Useful commands
// https://serverless.com/framework/docs/providers/aws/guide/quick-start/
// Async with lambda
// http://www.goingserverless.com/blog/how-async-lambda-handlers-work-in-node-8-10
// Testing function locally
// ../node_modules/.bin/serverless invoke local --function hello --path data.json
// Logs
// https://serverless.com/framework/docs/providers/aws/cli-reference/logs/