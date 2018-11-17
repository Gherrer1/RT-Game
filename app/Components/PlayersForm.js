import React from 'react';
import { Button } from 'react-bootstrap/lib';
import PropTypes from 'prop-types';
import PlayerNameInput from './PlayerNameInput';

function PlayersForm({ players, updatePlayerName, addPlayer, removePlayer }) {
	return (
		<React.Fragment>
			<form onSubmit={e => e.preventDefault()}>
				{players.map((player, index) => (
					<PlayerNameInput
						player={player}
						index={index}
						updatePlayerName={updatePlayerName}
						removePlayer={removePlayer}
						removeDisabled={players.length < 2}
						key={player.id}
					/>
				))}
				<Button type="button" onClick={addPlayer} disabled={players.length >= 5}>Add Player</Button>
			</form>
		</React.Fragment>
	);
}

PlayersForm.propTypes = {
	players: PropTypes.array.isRequired,
	updatePlayerName: PropTypes.func.isRequired,
	addPlayer: PropTypes.func.isRequired,
	removePlayer: PropTypes.func.isRequired,
};

export default PlayersForm;
