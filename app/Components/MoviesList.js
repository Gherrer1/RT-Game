import React from 'react';

export default function MoviesList(props) {
    return (
        <div className="movies-list">
            {props.movies.map(movie => (
                <div key={movie.image}>
                    <img src={movie.image} />
                    <p>{movie.name}</p>
                </div>
            ))}
        </div>
    )
}