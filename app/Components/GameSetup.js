import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap/lib';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import AmbiguousSearchResults from './AmbiguousSearchResults';
import PlayersForm from './PlayersForm';
import getMovieData from '../api';

const { MOVIE_FOUND, COULD_NOT_FIND_MOVIE_NAMED, RECOMMENDATIONS, MULTIPLE_MOVIES_FOUND } = require('../../lambda/messages');
const fakeMovieData = require('../fakeMovieData');

const initialPlayerData = [
	{ name: '', score: 0, id: 1 },
	{ name: '', score: 0, id: 2 },
];

const fakePlayerData = [
	{ name: 'Lonzo', score: 0, id: 2 },
	{ name: 'Ingram', score: 0, id: 14 },
	{ name: 'Kuzma', score: 0, id: 0 },
];

class GameSetup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: fakeMovieData,
			players: fakePlayerData,
			errorMessage: null,
			warningMessage: null,
			searchedFor: null,
			recommendations: null,
			loading: false,
		};

		this.searchForMovie = this.searchForMovie.bind(this);
		this.updatePlayerName = this.updatePlayerName.bind(this);
		this.addMovieToGame = this.addMovieToGame.bind(this);
		this.removeMovie = this.removeMovie.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.removePlayer = this.removePlayer.bind(this);
		this.addMovieThemeSet = this.addMovieThemeSet.bind(this);
	}

	async searchForMovie(movieTitle) {
		this.setState({ loading: true });
		const movieData = await getMovieData(movieTitle);
		console.log(movieData);
		if (movieData.message === MOVIE_FOUND) {
			return this.addMovieToGame(movieData.movie);
		}

		if (movieData.message.startsWith(COULD_NOT_FIND_MOVIE_NAMED)) {
			return this.setState({
				loading: false,
				errorMessage: movieData.message,
				searchedFor: movieData.searchedFor,
				warningMessage: null,
				recommendations: null,
			});
		}

		if (movieData.message === RECOMMENDATIONS) {
			return this.setState({
				loading: false,
				errorMessage: null,
				warningMessage: RECOMMENDATIONS,
				searchedFor: movieData.searchedFor,
				recommendations: movieData.recommendations,
			});
		}

		if (movieData.message === MULTIPLE_MOVIES_FOUND) {
			return this.setState({
				loading: false,
				errorMessage: null,
				warningMessage: MULTIPLE_MOVIES_FOUND,
				searchedFor: movieData.searchedFor,
				recommendations: movieData.movies,
			});
		}

		return this.setState({ loading: false });
	}

	addPlayer(e) {
		e.preventDefault();

		this.setState(prevState => ({
			players: prevState.players.concat([{
				name: '',
				score: 0,
				id: prevState.players[prevState.players.length - 1].id + 1,
			}]),
		}));
	}

	removePlayer(id) {
		this.setState(prevState => ({
			players: prevState.players.filter(p => p.id !== id),
		}));
	}

	updatePlayerName(index, name) {
		this.setState(prevState => ({
			players: prevState.players.map((player, i) => (i === index
				? { ...player, name }
				: player
			)),
		}));
	}

	addMovieThemeSet(movies) {
		// TODO: might have to disable <a> when loading
		this.setState({
			movies,
		});
	}

	addMovieToGame(movie) {
		this.setState(prevState => ({
			movies: prevState.movies.concat([ movie ]),
			loading: false,
			errorMessage: null,
			warningMessage: null,
			searchFor: null,
			recommendations: null,
		}));
	}

	removeMovie(movie) {
		this.setState(prevState => ({
			movies: prevState.movies.filter(mov => mov.image !== movie.image),
		}));
	}

	render() {
		const { movies, players, errorMessage, warningMessage,
			searchedFor, recommendations, loading } = this.state;
		const { beginGame } = this.props;
		return (
			<div className="game-setup">
				<h1 className="site-title">The Rotten Tomatoes Game</h1>

				<MovieSearchForm
					handleSubmit={this.searchForMovie}
					handleMovieSet={this.addMovieThemeSet}
					disabled={loading || movies.length === 5}
					loading={loading}
				/>
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
						handleClickMovie={this.addMovieToGame}
					/>
				)}
				<MoviesList movies={movies} removeMovie={this.removeMovie} />
				<PlayersForm
					players={players}
					updatePlayerName={this.updatePlayerName}
					addPlayer={this.addPlayer}
					removePlayer={this.removePlayer}
				/>

				<h2>Step 3:</h2>
				<Button
					onClick={() => beginGame(movies, players)}
					bsStyle="primary"
					disabled={loading || movies.length === 0 || players.length === 0}
				>
					Start Game!
				</Button>
			</div>
		);
	}
}

GameSetup.propTypes = {
	beginGame: PropTypes.func.isRequired,
};

export default GameSetup;
