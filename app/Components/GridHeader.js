import React from 'react';
import PropTypes from 'prop-types';
import Movie from './Movie';

function GridHeader({ movies }) {
	return (
		<React.Fragment>
			<div />
			{movies.map(movie => (
				<Movie movie={movie} key={movie.image} remove={null} />
			))}
		</React.Fragment>
	);
}

GridHeader.propTypes = {
	movies: PropTypes.array.isRequired,
};

export default GridHeader;
