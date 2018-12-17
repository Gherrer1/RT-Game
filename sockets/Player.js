/* eslint-disable import/no-unresolved */
const randomColor = require('randomcolor');

module.exports = function Player(id, name) {
	this.id = id;
	this.name = name;
	this.score = 0;
	this.color = randomColor();
	this.guesses = [];
};
