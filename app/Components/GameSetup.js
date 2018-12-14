import React from 'react';
import PropTypes from 'prop-types';
import openSocket from 'socket.io-client';
import GameSetupSplitScreen from './GameSetupSplitScreen';

const initialPlayerData = [
	{ name: '', score: 0, id: 1 },
	{ name: '', score: 0, id: 2 },
];

// TODO: get rid of all traces of sockets in here

// const fakePlayerData = [
// 	{ name: 'Lonzo', score: 0, id: 2 },
// 	{ name: 'Ingram', score: 0, id: 14 },
// 	{ name: 'Kuzma', score: 0, id: 0 },
// ];

class GameSetup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: [],
			players: initialPlayerData,
			loading: false,
		};

		this.updatePlayerName = this.updatePlayerName.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.removePlayer = this.removePlayer.bind(this);
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

	render() {
		const { movies, players, loading } = this.state;

		return (
			<GameSetupSplitScreen
				players={players}
				updatePlayerName={this.updatePlayerName}
				addPlayer={this.addPlayer}
				removePlayer={this.removePlayer}
				movies={movies}
				addMovieToGame={movie => this.setState(prevState => ({
					movies: prevState.movies.concat([ movie ]),
				}))}
				addMovieStarterPack={moviesPack => this.setState({ movies: moviesPack })}
				removeMovie={movie => this.setState(prevState => ({
					movies: prevState.movies.filter(mov => mov.image !== movie.image),
				}))}
				loading={loading}
				startGame={this.startGame}
				startLoading={() => this.setState({ loading: true })}
				endLoading={() => this.setState({ loading: false })}
			/>
		);
	}
}

GameSetup.propTypes = {
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default GameSetup;
