import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import PlayersForm from './PlayersForm';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';

const initialPlayerData = [
	{ name: '', score: 0, id: 1 },
	{ name: '', score: 0, id: 2 },
];

class GameSetup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: [],
			players: initialPlayerData,
			loading: false,
		};

		this.startGame = this.startGame.bind(this);
	}

	startGame() {
		const { history } = this.props;
		const { movies, players } = this.state;
		history.push({
			pathname: '/play',
			state: {
				movies,
				players,
			},
		});
	}

	render() {
		const { movies, players, loading } = this.state;

		return (
			<div className="game-setup">
				<NavBar />

				<h2>Step 1: Who&#39;s Playing?</h2>
				<PlayersForm
					players={players}
					updatePlayerName={(index, name) => this.setState(prevState => ({
						players: prevState.players.map((player, i) => (i === index
							? { ...player, name }
							: player
						)),
					}))}
					addPlayer={() => this.setState(prevState => ({
						players: prevState.players.concat([{
							name: '',
							score: 0,
							id: prevState.players[prevState.players.length - 1].id + 1,
						}]),
					}))}
					removePlayer={id => this.setState(prevState => ({
						players: prevState.players.filter(p => p.id !== id),
					}))}
				/>

				<h2>Step 2: Add 1 to 5 movies</h2>
				<MovieSearchForm
					handleMovieSet={moviesPack => this.setState({ movies: moviesPack })}
					disabled={loading || movies.length === 5}
					loading={loading}
					didFireSearch={() => this.setState({ loading: true })}
					searchDidEnd={() => this.setState({ loading: false })}
					addMovieToGame={movie => this.setState(prevState => ({
						movies: prevState.movies.concat([ movie ]),
					}))}
					disableSearch={movies.length === 5}
				/>

				<MoviesList
					movies={movies}
					removeMovie={movie => this.setState(prevState => ({
						movies: prevState.movies.filter(mov => mov.image !== movie.image),
					}))}
				/>

				<h2>Step 3:</h2>
				<Button
					onClick={this.startGame}
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
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default GameSetup;
