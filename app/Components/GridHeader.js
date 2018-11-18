import React from 'react';
import PropTypes from 'prop-types';
import HeaderMovie from './HeaderMovie';

function GridHeader({ movies, round }) {
	return (
		<React.Fragment>
			<div />
			{movies.map((movie, index) => (
				<HeaderMovie movie={movie} key={movie.image} emphasized={round === index} />
			))}
		</React.Fragment>
	);
}

GridHeader.propTypes = {
	movies: PropTypes.array.isRequired,
	round: PropTypes.number.isRequired,
};

export default GridHeader;
