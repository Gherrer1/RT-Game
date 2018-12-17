import React from 'react';
import PropTypes from 'prop-types';

function PlayersList({ players }) {
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

PlayersList.propTypes = {
	players: PropTypes.array.isRequired,
};

export default PlayersList;
