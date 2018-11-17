import React from 'react';
import PropTypes from 'prop-types';

function GridHeader({ movies }) {
	return (
		<React.Fragment>
			<div />
			{movies.map(movie => (
				<div key={movie.image}>
					{movie.name}
				</div>
			))}
		</React.Fragment>
	);
}

GridHeader.propTypes = {
	movies: PropTypes.array.isRequired,
};

export default GridHeader;
