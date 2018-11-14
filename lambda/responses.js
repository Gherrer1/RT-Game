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
        message: 'No exact match found. Were you looking for one of these?',
        searchedFor: searchedTitle,
        recommendations: recommendations,
    }),
});

const noMoviesFoundMsg = () => enableCors({
    statusCode: 404,
    body: JSON.stringify({
        message: 'No movies found.',
    }),
});

const movieFoundMsg = (movie) => enableCors({
    statusCode: 200,
    body: JSON.stringify({
        message: 'Movie found!',
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
