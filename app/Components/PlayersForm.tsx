import React from 'react';
import { Button } from 'react-bootstrap/lib';
import PropTypes from 'prop-types';
import PlayerNameInput from './PlayerNameInput';
import { Player } from '../../sharedTypes';

interface Props {
	players: Player[];
	updatePlayerName(i: number, s: string): void;
	removePlayer(i: string): void;
	addPlayer(): void;
}

function PlayersForm({ players, updatePlayerName, addPlayer, removePlayer }: Props) {
	return (
		<React.Fragment>
			<form>
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
