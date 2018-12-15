module.exports = function Player(id, name, color) {
	this.id = id;
	this.name = name;
	this.score = 0;
	this.color = color;
	this.guesses = [];
};
