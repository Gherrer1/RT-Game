import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap/lib';
import HowToPlay from './HowToPlay';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList'
import AmbiguousSearchResults from './AmbiguousSearchResults';
import PlayersForm from './PlayersForm';

function GameSetup({ movies, players, errorMessage, warningMessage, searchedFor, recommendations, 
    removeMovie, updatePlayerName, addPlayer, searchForMovie, addMovieToGame, startGame }) {
    return (
        <div>
            <h1>Rotten Tomatoes Game</h1>
            <HowToPlay />
            {movies.length < 5 && (
                <MovieSearchForm handleSubmit={searchForMovie} />)
            }
            {errorMessage && (
                <Alert bsStyle="danger">
                    {COULD_NOT_FIND_MOVIE_NAMED} <strong>{searchedFor}</strong>
                </Alert>
            )}
            {warningMessage && (
                <AmbiguousSearchResults
                    message={warningMessage}
                    searchedFor={searchedFor}
                    recommendations={recommendations}
                    handleClickMovie={addMovieToGame}
                />
            )}
            <MoviesList movies={movies} removeMovie={removeMovie} />
            <PlayersForm players={players} updatePlayerName={updatePlayerName} addPlayer={addPlayer} />
            {movies.length > 0 && (
                <Button onClick={startGame} bsStyle="primary">Start Game!</Button>
            )}
        </div>    
    );
}

GameSetup.propTypes = {
    movies: PropTypes.array.isRequired,
    addPlayer: PropTypes.func.isRequired,
    updatePlayerName: PropTypes.func.isRequired,
    addMovieToGame: PropTypes.func.isRequired,
    searchForMovie: PropTypes.func.isRequired,
    removeMovie: PropTypes.func.isRequired,
    startGame: PropTypes.func.isRequired,
};

export default GameSetup;