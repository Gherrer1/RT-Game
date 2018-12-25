import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import PlayersForm from './PlayersForm';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';

function GameSetupSplitScreen(props) {
	const { players, movies, updatePlayerName, addPlayer, removePlayer, startLoading, endLoading,
		addMovieStarterPack, loading, removeMovie, addMovieToGame, startGame } = props;
	return (
		<div className="game-setup">
			<NavBar />
			<h2>Step 1: Who&#39;s Playing?</h2>
			<PlayersForm
				players={players}
				updatePlayerName={updatePlayerName}
				addPlayer={addPlayer}
				removePlayer={removePlayer}
			/>

			<h2>Step 2: Add 1 to 5 movies</h2>
			<MovieSearchForm
				handleMovieSet={addMovieStarterPack}
				disabled={loading || movies.length === 5}
				loading={loading}
				didFireSearch={startLoading}
				searchDidEnd={endLoading}
				addMovieToGame={addMovieToGame}
				disableSearch={movies.length === 5}
			/>

			<MoviesList movies={movies} removeMovie={removeMovie} />

			<h2>Step 3:</h2>
			<Button
				onClick={() => startGame()}
				bsStyle="primary"
				disabled={loading || movies.length === 0 || players.length === 0}
			>
				Start Game!
			</Button>
		</div>
	);
}

GameSetupSplitScreen.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
	addPlayer: PropTypes.func.isRequired,
	removePlayer: PropTypes.func.isRequired,
	updatePlayerName: PropTypes.func.isRequired,
	addMovieToGame: PropTypes.func.isRequired,
	addMovieStarterPack: PropTypes.func.isRequired,
	removeMovie: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	startGame: PropTypes.func.isRequired,
	startLoading: PropTypes.func.isRequired,
	endLoading: PropTypes.func.isRequired,
};

export default GameSetupSplitScreen;
