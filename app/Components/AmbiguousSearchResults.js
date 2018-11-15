import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';

function AmbiguousSearchResults({ message, searchedFor, recommendations, handleClickMovie }) {
    return (
        <Alert bsStyle="warning">
            <h4>{message}</h4>
            <p>Searched for <strong>{searchedFor}</strong></p>
            <ul>
                {recommendations.map(movie => (
                    <li key={movie.image}>
                        <a
                            className="recommended-title"
                            onClick={() => handleClickMovie(movie)}
                        >
                            {movie.name}
                        </a> ({movie.year})
                    </li>
                ))}
            </ul>
        </Alert>
    );
}

export default AmbiguousSearchResults;
