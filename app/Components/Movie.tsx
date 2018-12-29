import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import PropTypes from 'prop-types';
import { IMovie } from '../../sharedTypes';

interface Props {
	movie: IMovie;
	remove: ((movie: IMovie) => void) | null;
}

function Movie({ movie, remove = null }: Props) {
	return (
		<div>
			<ul className="movie-info">
				<li><img src={movie.image} alt={`poster for ${movie.name}`} /></li>
				<li><strong>{movie.name}</strong></li>
				<li className="movie-year">({movie.year})</li>
				{remove && (
					<li>
						<Button bsSize="xsmall" onClick={() => remove(movie)}>Remove</Button>
					</li>)}
			</ul>
		</div>
	);
}

Movie.propTypes = {
	movie: PropTypes.object.isRequired,
	remove: PropTypes.func,
};
Movie.defaultProps = {
	remove: null,
};

export default Movie;
