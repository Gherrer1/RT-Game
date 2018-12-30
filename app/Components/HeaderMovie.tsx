import React from 'react';
import Movie from './Movie';
import { IMovie } from '../../sharedTypes';

interface Props {
	movie: IMovie;
	emphasized: boolean;
}

function HeaderMovie({ movie, emphasized }: Props) {
	return (
		<div className={`movie-col-cell header-movie ${emphasized ? '' : 'dormant'}`}>
			<Movie movie={movie} />
		</div>
	);
}

export default HeaderMovie;
