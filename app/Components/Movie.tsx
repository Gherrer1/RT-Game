import React from 'react';
import Button from 'react-bootstrap/lib/Button';
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

export default Movie;
