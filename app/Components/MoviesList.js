import React from 'react';
import Movie from './Movie';

export default function MoviesList(props) {
    return (
        <div className="movies-list">
            {props.movies.map(movie => (
                <Movie movie={movie} />
            ))}
        </div>
    )
}