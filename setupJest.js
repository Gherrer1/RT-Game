/* eslint-disable */
require('dotenv').config({ path: './.env.development' });
global.fetch = require('jest-fetch-mock');
window.alert = (msg) => { console.log(msg); };
window.prompt = (msg) => msg;