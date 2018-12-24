import React from 'react';
import PropTypes from 'prop-types';
import Movie from './Movie';

function HeaderMovie({ movie, emphasized }) {
	return (
		<div className={`movie-col-cell header-movie ${emphasized ? '' : 'dormant'}`}>
			<Movie movie={movie} />
		</div>
	);
}

HeaderMovie.propTypes = {
	movie: PropTypes.object.isRequired,
	emphasized: PropTypes.bool.isRequired,
};

export default HeaderMovie;
