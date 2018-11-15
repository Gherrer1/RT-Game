import React from 'react';
import Movie from './Movie';

export default function MoviesList({ removeMovie, movies }) {
    return (
        <div className="movies-list">
            {movies.map(movie => (
                <Movie movie={movie} remove={removeMovie} />
            ))}
        </div>
    )
}