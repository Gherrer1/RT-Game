const errorParsingJSONMsg = (e, { faultyJSON }) => ({
    statusCode: 500,
    body: JSON.stringify({
        message: e.message,
        faultyJSON,
    }),
});

const noMovieQueryProvidedMsg = () => ({
    statusCode: 400,
    body: JSON.stringify({
        message: 'Provide a movie to search for.',
        resource: event.resource,
        path: event.path,
        queryStringParamters: event.queryStringParameters,
    }),
});

const reccomendationsMsg = (searchedTitle, recommendations) => ({
    statusCode: 200,
    body: JSON.stringify({
        message: 'No exact match found. Were you looking for one of these?',
        searchedFor: searchedTitle,
        recommendations: recommendations,
    }),
});

const noMoviesFoundMsg = () => ({
    statusCode: 404,
    body: JSON.stringify({
        message: 'No movies found.',
    }),
});

const movieFoundMsg = (movie) => ({
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
