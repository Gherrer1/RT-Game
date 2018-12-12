import React from 'react';
import PropTypes from 'prop-types';
import openSocket from 'socket.io-client';
import { Alert, Button } from 'react-bootstrap/lib';
import GameSetupSplitScreen from './GameSetupSplitScreen';
import NavBar from './NavBar';
import MoviesList from './MoviesList';
import PlayersForm from './PlayersForm';

const initialPlayerData = [
	{ name: '', score: 0, id: 1 },
	{ name: '', score: 0, id: 2 },
];

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
			socketRoom: null,
		};

		this.updatePlayerName = this.updatePlayerName.bind(this);
		this.addMovieToGame = this.addMovieToGame.bind(this);
		this.removeMovie = this.removeMovie.bind(this);
		this.addPlayer = this.addPlayer.bind(this);
		this.removePlayer = this.removePlayer.bind(this);
		this.addMovieStarterPack = this.addMovieStarterPack.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.addListenersToSocket = this.addListenersToSocket.bind(this);
		this.startGame = this.startGame.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.endLoading = this.endLoading.bind(this);
	}

	startGame() {
		const { multi: multiplayerMode, history } = this.props;
		const { movies, players } = this.state;
		if (!multiplayerMode) {
			history.push({
				pathname: '/play',
				state: {
					movies,
					players,
				},
			});
		}
	}

	addListenersToSocket(socket) {
		socket.on('did remove movie', newMoviesState => this.setState({ movies: newMoviesState }));
		socket.on('did add movie pack', movies => this.setState({ movies }));
	}

	setLoading() {
		this.setState({ loading: true });
	}

	endLoading() {
		this.setState({ loading: false });
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

	createRoom() {
		// TODO: handle fail event?
		// TODO: remove socket from component instance if socket disconnects
		const socket = openSocket('http://localhost:8000');
		socket.on('room id', (roomID) => {
			this.setState({
				socketRoom: roomID,
			});
			this.socket = socket;
			this.addListenersToSocket(socket);
		});
		socket.on('new player', playerID => console.log(`new player has joined this room: ${playerID}`));

		const { movies, players } = this.state;
		const gameState = { movies, players };
		socket.emit('create room', gameState);
	}

	joinRoom() {
		const socket = openSocket('http://localhost:8000');
		socket.on('new player', playerID => console.log(`new player has joined this room: ${playerID}`));
		socket.on('successful join', (roomID, gameState) => {
			this.setState({
				socketRoom: roomID,
				movies: gameState.movies,
				players: gameState.players,
			});
			this.socket = socket;
			this.addListenersToSocket(socket);
		});
		socket.on('failed join', () => alert('Failed to join that room. It might not exist')
			|| socket.close());

		const roomID = prompt('Which room?');
		socket.emit('join room', roomID.trim());
	}

	updatePlayerName(index, name) {
		this.setState(prevState => ({
			players: prevState.players.map((player, i) => (i === index
				? { ...player, name }
				: player
			)),
		}));
	}

	addMovieStarterPack(movies) {
		const { socketRoom } = this.state;
		if (this.socket && socketRoom) {
			this.socket.emit('add movie starter pack', socketRoom, movies);
		} else {
		// TODO: might have to disable <a> when loading
			this.setState({
				movies,
			});
		}
	}

	addMovieToGame(movie) {
		this.setState(prevState => ({
			movies: prevState.movies.concat([ movie ]),
		}));
	}

	removeMovie(movie) {
		const { socketRoom } = this.state;
		if (this.socket && socketRoom) {
			// send intent to remove movie from game state
			this.socket.emit('remove movie', socketRoom, movie.image);
		} else {
			this.setState(prevState => ({
				movies: prevState.movies.filter(mov => mov.image !== movie.image),
			}));
		}
	}

	render() {
		const { movies, players, loading, socketRoom } = this.state;

		const { multi: multiplayerMode } = this.props;

		if (!multiplayerMode) {
			return (
				<GameSetupSplitScreen
					players={players}
					updatePlayerName={this.updatePlayerName}
					addPlayer={this.addPlayer}
					removePlayer={this.removePlayer}
					movies={movies}
					addMovieToGame={this.addMovieToGame}
					addMovieStarterPack={this.addMovieStarterPack}
					removeMovie={this.removeMovie}
					loading={loading}
					startGame={this.startGame}
					setLoading={this.setLoading}
					endLoading={this.endLoading}
				/>
			);
		}

		return (
			<div>Hey</div>
			// <GameSetupMultiplayer
				
			// />
		);

		return <div>Hey</div>

		// return (
		// 	<React.Fragment>
				
		// 		{multiplayerMode && (
		// 			<div>
		// 				<button type="button">Invite Friends</button>
		// 				<button type="button">Join Room</button>
		// 			</div>
		// 		)}
		// 		{/* {socketRoom
		// 			? <p>Your friends can join with this room id: {socketRoom}</p>
		// 			: (
		// 				<div>
		// 					<button onClick={() => this.createRoom()} type="button">Invite Friends</button>
		// 					<button onClick={() => this.joinRoom()} type="button">Join Room</button>
		// 				</div>
		// 			)
		// 		}  */}
		// 		</React.Fragment>
		// );
	}
}

GameSetup.propTypes = {
	multi: PropTypes.bool,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};
GameSetup.defaultProps = {
	multi: false,
};

export default GameSetup;
