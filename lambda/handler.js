'use strict';
const rp = require('request-promise');

const NO_MOVIES_FOUND = 'No movies found.';

const getUrl = (movieTitle) => `https://www.rottentomatoes.com/search/?search=${movieTitle}`;
const getHtml = async (url) => await rp(url);

function extractData (html) {
  return html.replace(/(\{"actorCount".*\}\);)|[^]/g, '$1');
}

function errorParsingJSONMsg(e, { faultyJSON }) {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: e.message,
      faultyJSON,
    }),
  };
}

function noMovieQueryProvidedMsg() {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Provide a movie to search for.',
      resource: event.resource,
      path: event.path,
      queryStringParamters: event.queryStringParameters
    })
  };
}

function reccomendationsMsg(searchedTitle, recommendations) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      searchedFor: searchedTitle,
      recommendations: recommendations,
    }),
  };
}

function noMoviesFoundMsg() {
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'No movies found.',
    }),
  };
}

function findExactMatch(data, movieTitle) {
  return data.movies.find(movie => movie.name.toLowerCase().trim() === movieTitle.toLowerCase().trim());
}

function getRecommendedTitles(data) {
  return data.movies.map(movie => movie.name);
}

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

// unused - just here for reference
module.exports.hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

// useful resources
// Useful commands
// https://serverless.com/framework/docs/providers/aws/guide/quick-start/
// Async with lambda
// http://www.goingserverless.com/blog/how-async-lambda-handlers-work-in-node-8-10