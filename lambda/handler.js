'use strict';
const rp = require('request-promise');

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

function successfulScrapeMsg(data) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data,
    }),
  };
}

module.exports.getMovieData = async (event, context) => {
  const { queryStringParameters: query } = event;
  const movieTitle = (query && query.movieTitle) || null;
  if(!movieTitle) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'couldnt find yoru shit',
        resource: event.resource,
        path: event.path,
        queryStringParamters: event.queryStringParameters
      })
    };
  }

  const url = getUrl('disney');
  const html = await getHtml(url);
  const dataStr = extractData(html);
  const dataJSON = dataStr.slice(0, -2);

  try {
    const obj = JSON.parse(dataJSON);
    return successfulScrapeMsg(obj);
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