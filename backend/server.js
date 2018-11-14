const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');

const getUrl = (movieTitle) => `https://www.rottentomatoes.com/search/?search=${movieTitle}`;

const getHtml = async (url) => await rp(url);

function extractData (html) {
    return html.replace(/(\{"actorCount".*\}\);)|[^]/g, '$1');
}

(async function () {
    const url = getUrl('wolverine');
    const html = await getHtml(url);
    fs.writeFileSync('results.txt', html, 'utf-8');
    const data = extractData(html);
    const convertedToJSON = data.slice(0, -2);

    try {
        const obj = JSON.parse(convertedToJSON);
        console.dir(obj);
    } catch(e) {
        console.log(e.message);
    }

    process.exit(0);
})();