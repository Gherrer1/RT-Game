export function allPlayersHaveGuessed(players, round) {
	return players.map(p => p.guesses).every(guessesArr => guessesArr[round] !== '');
}

export function playersWhoHaventGuessedYet(players, round) {
	return players.filter(p => p.guesses[round] === '');
}

export function getWinningScore(players) {
	let min = players[0].score;
	players.forEach((p) => {
		if (p.score < min) {
			min = p.score;
		}
	});
	return min;
}
