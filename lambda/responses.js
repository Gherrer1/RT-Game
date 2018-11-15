const { MOVIE_FOUND, COULD_NOT_FIND_MOVIE_NAMED, RECOMMENDATIONS } = require('./messages');

const enableCors = (responseObj) => ({
    ...responseObj,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
});

const errorParsingJSONMsg = (e, { faultyJSON }) => enableCors({
    statusCode: 500,
    body: JSON.stringify({
        message: e.message,
        faultyJSON,
    }),
});

const noMovieQueryProvidedMsg = () => enableCors({
    statusCode: 400,
    body: JSON.stringify({
        message: 'Provide a movie to search for.',
        resource: event.resource,
        path: event.path,
        queryStringParamters: event.queryStringParameters,
    }),
});

const reccomendationsMsg = (searchedTitle, recommendations) => enableCors({
    statusCode: 200,
    body: JSON.stringify({
        message: RECOMMENDATIONS,
        searchedFor: searchedTitle,
        recommendations: recommendations,
    }),
});

const noMoviesFoundMsg = (movieSearchedFor) => enableCors({
    statusCode: 404,
    body: JSON.stringify({
        message: `${COULD_NOT_FIND_MOVIE_NAMED} ${movieSearchedFor}`,
        searchedFor: movieSearchedFor,
    }),
});

const movieFoundMsg = (movie) => enableCors({
    statusCode: 200,
    body: JSON.stringify({
        message: MOVIE_FOUND,
        movie,
    })
});

module.exports = {
    noMovieQueryProvidedMsg,
    noMoviesFoundMsg,
    reccomendationsMsg,
    errorParsingJSONMsg,
    movieFoundMsg
};
