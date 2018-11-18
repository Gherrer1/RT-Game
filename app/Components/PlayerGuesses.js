import React from 'react';
import PropTypes from 'prop-types';

function PlayerGuesses({ player, round, updateGuess }) {
	return (
		<React.Fragment>
			{/* extract this to PlayerInfo component */}
			<div>
				{player.name}
				<br />
				{player.score}
			</div>
			{player.guesses.map((guess, index) => (
				<div key={index} className={`movie-guess-cell ${index === round ? '' : 'dormant'}`}>
					<input
						value={guess}
						onChange={e => updateGuess(player.id, index, e.target.value)}
						disabled={index !== round}
					/>
				</div>
			))}
		</React.Fragment>
	);
}

PlayerGuesses.propTypes = {
	player: PropTypes.shape({
		guesses: PropTypes.arrayOf(PropTypes.number),
		name: PropTypes.string.isRequired,
		score: PropTypes.number.isRequired,
	}).isRequired,
	round: PropTypes.number.isRequired,
	updateGuess: PropTypes.func.isRequired,
};

export default PlayerGuesses;
