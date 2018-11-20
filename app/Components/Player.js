import React from 'react';
import PropTypes from 'prop-types';
import { customArrayValidator } from '../helpers/validators';

function Player({ player, winningScore }) {
	return (
		<div className="player-cell">
			<span>{player.name}</span>
			<br />
			<span className={`player-score ${player.score === winningScore ? 'winning' : ''}`}>{player.score}</span>
		</div>
	);
}

Player.propTypes = {
	player: PropTypes.shape({
		name: PropTypes.string.isRequired,
		score: PropTypes.number.isRequired,
		guesses: PropTypes.arrayOf(customArrayValidator),
	}).isRequired,
	winningScore: PropTypes.number.isRequired,
};

export default Player;
