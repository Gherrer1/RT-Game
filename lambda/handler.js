'use strict';

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

module.exports.getMovieData = async (event, context) => {
  // take the query param: movie title
  const { queryStringParamters: query } = event;
  const movieTitle = (query && query.movieTitle) || null;
  if(!movieTitle) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'couldnt find yoru shit',
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go serverless',
    }),
  };
}

// useful resources
// Useful commands
// https://serverless.com/framework/docs/providers/aws/guide/quick-start/
// Async with lambda
// http://www.goingserverless.com/blog/how-async-lambda-handlers-work-in-node-8-10