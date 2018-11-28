const rp = require('request-promise');

const getUrl = movieTitle => `https://www.rottentomatoes.com/search/?search=${movieTitle}`;

const getHtml = async (url) => await rp(url);

const extractData = html => html.replace(/(\{"actorCount".*\}\);)|[^]/g, '$1');

const findExactMatches = (data, movieTitle) => data.movies.filter(movie => movie.name.toLowerCase().trim() === movieTitle.toLowerCase().trim());

module.exports = {
	getUrl,
	getHtml,
	extractData,
	findExactMatches,
};
