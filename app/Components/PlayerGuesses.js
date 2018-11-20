import React from 'react';
import PropTypes from 'prop-types';
import Player from './Player';
import { customArrayValidator } from '../helpers/validators';

function PlayerGuesses({ player, round, updateGuess, winningScore }) {
	return (
		<React.Fragment>
			<Player player={player} winningScore={winningScore} />
			{player.guesses.map((guess, index) => (
				<div key={index} className={`movie-col-cell ${index === round ? '' : 'dormant'}`}>
					<input
						value={guess}
						onChange={e => updateGuess(player.id, index, e.target.value)}
						disabled={index !== round}
						placeholder="0 - 100"
						className="guess-input"
					/>
				</div>
			))}
		</React.Fragment>
	);
}

PlayerGuesses.propTypes = {
	player: PropTypes.shape({
		guesses: PropTypes.arrayOf(customArrayValidator),
		name: PropTypes.string.isRequired,
		score: PropTypes.number.isRequired,
	}).isRequired,
	round: PropTypes.number.isRequired,
	updateGuess: PropTypes.func.isRequired,
	winningScore: PropTypes.number.isRequired,
};

export default PlayerGuesses;
