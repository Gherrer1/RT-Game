import React from 'react';
import { IPlayer } from '../../sharedTypes';

interface Props {
	players: IPlayer[]
}

function PlayersList({ players }: Props) {
	return (
		<div className="players-list">
			{players.map(p => (
				<div key={p.id} style={{ borderLeft: `5px solid ${p.color}`, paddingLeft: '5px' }}>
					{p.name}
				</div>
			))}
		</div>
	);
}

export default PlayersList;
