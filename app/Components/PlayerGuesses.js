import React from 'react';
import PropTypes from 'prop-types';

function PlayerGuesses({ player }) {
	return (
		<React.Fragment>
			{/* extract this to PlayerInfo component */}
			<div>
				{player.name}
				<br />
				{player.score}
			</div>
			{player.guesses.map((guess, index) => (
				<div key={index}>
					{guess}
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
};

export default PlayerGuesses;
