'use strict';
const { getHtml, getUrl, extractData, findExactMatch, getRecommendedTitles } = require('./helpers');
const { errorParsingJSONMsg, noMovieQueryProvidedMsg, reccomendationsMsg, noMoviesFoundMsg } = require('./responses');


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
    return noMoviesFoundMsg();
  }
  const dataJSON = dataStr.slice(0, -2);

  try {
    const data = JSON.parse(dataJSON);

    const exactMatchExists = findExactMatch(data, movieTitle);    
    if (exactMatchExists) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'exact match found but thats no fun'
        })
      };
    }
    else {
      const recommendations = getRecommendedTitles(data);
      return reccomendationsMsg(movieTitle, recommendations);
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