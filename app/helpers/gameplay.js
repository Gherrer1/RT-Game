export function allPlayersHaveGuessed(players, round) {
	return players.map(p => p.guesses).every(guessesArr => guessesArr[round] !== '');
}

export function playersWhoHaventGuessedYet(players, round) {
	return players.filter(p => p.guesses[round] === '');
}
