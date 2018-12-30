import React from 'react';
import { Button } from 'react-bootstrap/lib';
import { IPlayer } from '../../sharedTypes';

interface Props {
	index: number;
	player: IPlayer;
	updatePlayerName(i: number, n: string): void;
	removePlayer(i: string): void;
	removeDisabled: boolean;
}

function PlayerNameInput({ player, index, updatePlayerName, removePlayer, removeDisabled }: Props) {
	return (
		<div className="player-input">
			<input
				value={player.name}
				placeholder={`Player ${index + 1}`}
				onChange={e => updatePlayerName(index, e.target.value)}
			/>
			<Button type="button" bsStyle="danger" bsSize="xsmall" onClick={() => removePlayer(player.id)} disabled={removeDisabled}>x</Button>
		</div>
	);
}

export default PlayerNameInput;
