import React from 'react';
import PropTypes from 'prop-types';

function PlayersList({ players }) {
	return (
		<div className="players-list">
			{players.map(p => (
				<div key={p.id}>
					{p.name} | {p.color}
				</div>
			))}
		</div>
	);
}

PlayersList.propTypes = {
	players: PropTypes.array.isRequired,
};

export default PlayersList;
