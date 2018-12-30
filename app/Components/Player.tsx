import React from 'react';
import { IPlayer } from '../../sharedTypes';

interface Props {
	player: IPlayer;
	winningScore: number;
}

function Player({ player, winningScore }: Props) {
	return (
		<div className="player-cell">
			<span>{player.name}</span>
			<br />
			<span
				className={`player-score ${player.score === winningScore ? 'winning' : ''}`}
				style={{ borderLeft: `5px solid ${player.color}`, paddingLeft: '5px' }}
			>
				{player.score}
			</span>
		</div>
	);
}

export default Player;
