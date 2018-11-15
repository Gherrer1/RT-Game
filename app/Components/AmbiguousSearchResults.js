import React from 'react';
import PropTypes from 'prop-types';
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

AmbiguousSearchResults.propTypes = {
    message: PropTypes.string.isRequired,
    searchedFor: PropTypes.string.isRequired,
    recommendations: PropTypes.array.isRequired,
    handleClickMovie: PropTypes.func.isRequired,
};

export default AmbiguousSearchResults;
