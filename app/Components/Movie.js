import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import PropTypes from 'prop-types';

function Movie({ movie, remove }) {
    return (
        <div>
            <ul className="movie-info">
                <li><img src={movie.image} /></li>
                <li>{movie.name}</li>
                <li>({movie.year})</li>
                <li>
                    <Button bsSize="xsmall" onClick={() => remove(movie)}>Remove</Button>
                </li>
            </ul>
        </div>
    );
}

Movie.propTypes = {
    movie: PropTypes.object.isRequired,
    remove: PropTypes.func.isRequired,
};

export default Movie;
