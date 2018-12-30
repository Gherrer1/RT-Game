import React from 'react';
import { IPlayerDuringGame } from '../../sharedTypes';

interface Props {
	winners: IPlayerDuringGame[];
}

function AnnounceWinner({ winners }: Props) {
	const winnersNames = winners.map(player => player.name);
	return (
		<div className="winners">
			<h3>
				{winners.length > 1 ? 'Winners:' : 'Winner:'}
			</h3>
			<h2 className="winner-names">{winnersNames.join(', ')}</h2>
		</div>
	);
}

export default AnnounceWinner;
