import React from 'react';
import PropTypes from 'prop-types';
import Movie from './Movie';

export default function MoviesList({ removeMovie, movies }) {
    return (
        <div className="movies-list">
            {movies.map(movie => (
                <Movie movie={movie} remove={removeMovie} key={movie.image} />
            ))}
        </div>
    )
}
MoviesList.propTypes = {
    removeMovie: PropTypes.func.isRequired,
    movies: PropTypes.array.isRequired,
};