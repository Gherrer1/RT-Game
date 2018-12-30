import React from 'react';
import { Button } from 'react-bootstrap/lib';
import PlayerNameInput from './PlayerNameInput';
import { IPlayer } from '../../sharedTypes';

interface Props {
	players: IPlayer[];
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

export default PlayersForm;
