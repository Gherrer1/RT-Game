import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';

function PlayerNameInput({ player, index, updatePlayerName, removePlayer, removeDisabled }) {
	return (
		<div>
			<input
				value={player.name}
				placeholder={`Player ${index + 1}`}
				onChange={e => updatePlayerName(index, e.target.value)}
			/>
			<Button type="button" bsStyle="danger" bsSize="xsmall" onClick={() => removePlayer(player.id)} disabled={removeDisabled}>x</Button>
		</div>
	);
}

PlayerNameInput.propTypes = {
	player: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	updatePlayerName: PropTypes.func.isRequired,
	removePlayer: PropTypes.func.isRequired,
	removeDisabled: PropTypes.bool.isRequired,
};

export default PlayerNameInput;
