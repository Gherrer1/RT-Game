import React from 'react';

function Movie({ movie }) {
    return (
        <div>
            <ul className="movie-info">
                <li><img src={movie.image} /></li>
                <li>{movie.name}</li>
                <li>({movie.year})</li>
            </ul>
        </div>
    );
}

export default Movie;
