import React from 'react';
import HeaderMovie from './HeaderMovie';
import { IMovie } from '../../sharedTypes';

interface Props {
	movies: IMovie[];
	round: number;
}

function GridHeader({ movies, round }: Props) {
	return (
		<React.Fragment>
			<div />
			{movies.map((movie, index) => (
				<HeaderMovie movie={movie} key={movie.image} emphasized={round === index} />
			))}
		</React.Fragment>
	);
}

export default GridHeader;
