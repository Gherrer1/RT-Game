import React from 'react';
import PropTypes from 'prop-types';

function AnnounceWinner({ winners }) {
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

AnnounceWinner.propTypes = {
	winners: PropTypes.array.isRequired,
};

export default AnnounceWinner;
