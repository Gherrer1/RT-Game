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

module.exports = {
    noMovieQueryProvidedMsg,
    noMoviesFoundMsg,
    reccomendationsMsg,
    errorParsingJSONMsg,
};
