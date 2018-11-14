const getApiUrl = (movieTitle) => `https://hvfxlcsl7l.execute-api.us-east-1.amazonaws.com/dev/search?movieTitle=${movieTitle}`;

export default async function getMovieData(movieTitle) {
    const url = getApiUrl(movieTitle);

    const response = await fetch(url);
    const json = await response.json();

    return json;
}