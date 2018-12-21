import React from 'react';
import PropTypes from 'prop-types';
import openSocket from 'socket.io-client';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import PlayersList from './PlayersList';
import getInviteURL from '../helpers/url';
import socketEventNames from '../../sockets/socketEventNames';

const { CREATE_ROOM, JOIN_ROOM, ROOM_ID, NEW_PLAYER, SUCCESSFUL_JOIN, FAILED_JOIN, REMOVE_MOVIE,
	DID_REMOVE_MOVIE, ADD_MOVIE_STARTER_PACK, DID_ADD_MOVIE_PACK, ADD_MOVIE, DID_ADD_MOVIE,
	ADD_MOVIE_ERROR, ROOM_FULL, PLAYER_LEFT, START_GAME, DID_START_GAME, GAME_IN_PROGRESS,
} = socketEventNames;

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;
if (!SOCKET_SERVER_URL) {
	throw new Error('Socket server url missing. Check your .env file');
}

class GameSetupMulti extends React.Component {
	// TODO: remove async / socket / api stuff from component
	static removeSocketListeners(socket) {
		socket.off(DID_REMOVE_MOVIE);
		socket.off(DID_ADD_MOVIE_PACK);
		socket.off(DID_ADD_MOVIE);
		socket.off(ADD_MOVIE_ERROR);
		socket.off(PLAYER_LEFT);
		socket.off(DID_START_GAME);
		socket.off(SUCCESSFUL_JOIN);
		socket.off(NEW_PLAYER);
		socket.off(FAILED_JOIN);
		socket.off(ROOM_FULL);
		socket.off(ROOM_ID);
		socket.off(GAME_IN_PROGRESS);
	}

	constructor(props) {
		super(props);

		this.state = {
			playerName: '',
			socketRoom: null,
			inRoom: false,
			fromInviteLink: false,
			loading: false,
			movies: [],
			players: [],
		};

		this.createSocketRoom = this.createSocketRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.addSocketListeners = this.addSocketListeners.bind(this);
		this.playerJoined = this.playerJoined.bind(this);
		this.addMovieToServer = this.addMovieToServer.bind(this);
		this.removeMovieFromServer = this.removeMovieFromServer.bind(this);
		this.startGame = this.startGame.bind(this);
	}

	componentDidMount() {
		const { match } = this.props;
		const { params } = match;
		// if url looks like this: /setup-multi/:roomID
		if (params.roomID) {
			this.setState({
				fromInviteLink: true,
			});
		}
	}

	componentWillUnmount() {
		if (window.socket) {
			GameSetupMulti.removeSocketListeners(window.socket);
		}
	}

	playerJoined(newPlayersState) {
		this.setState({
			players: newPlayersState,
		});
	}

	createSocketRoom() {
		const { playerName } = this.state;
		const socket = openSocket(SOCKET_SERVER_URL);
		socket.on(ROOM_ID, (roomID, gameState) => {
			this.setState({
				socketRoom: roomID,
				inRoom: true,
				players: gameState.players,
			});
			window.socket = socket;
			this.addSocketListeners(socket);
		});
		socket.on(NEW_PLAYER, newPlayerState => this.playerJoined(newPlayerState));
		socket.emit(CREATE_ROOM, playerName);
	}

	joinRoom() {
		// try to connect
		const { playerName } = this.state;
		const { match } = this.props;
		const roomID = match.params.roomID || prompt('Enter the room ID');
		const socket = openSocket(SOCKET_SERVER_URL);
		socket.on(SUCCESSFUL_JOIN, (roomId, gameState) => {
			window.socket = socket;
			this.setState({
				socketRoom: roomId,
				inRoom: true,
				movies: gameState.movies,
				players: gameState.players,
			});
			// here is where we add movie updates listeners
			this.addSocketListeners(socket);
		});
		socket.on(GAME_IN_PROGRESS, () => alert('The game has already started. Room not joined.') || socket.close());
		socket.on(NEW_PLAYER, newPlayerState => this.playerJoined(newPlayerState));
		socket.on(FAILED_JOIN, () => alert('That room does not exist.') || socket.close());
		socket.on(ROOM_FULL, () => alert('That room is already full.') || socket.close()); // TODO: redirect back to home
		socket.emit(JOIN_ROOM, roomID, playerName);
	}

	addMovieToServer(movie) {
		const { socketRoom } = this.state;
		window.socket.emit(ADD_MOVIE, socketRoom, movie);
	}

	removeMovieFromServer(movie) {
		const { socketRoom } = this.state;
		window.socket.emit(REMOVE_MOVIE, socketRoom, movie);
	}

	startGame() {
		const { socketRoom } = this.state;
		window.socket.emit(START_GAME, socketRoom);
	}

	// exclusively related to movies for now
	addSocketListeners(socket) {
		socket.on(DID_REMOVE_MOVIE, newMoviesState => this.setState({ movies: newMoviesState }));
		socket.on(DID_ADD_MOVIE_PACK, movies => this.setState({ movies }));
		socket.on(DID_ADD_MOVIE, movieState => this.setState({ movies: movieState }));
		socket.on(ADD_MOVIE_ERROR, msg => alert(msg));
		socket.on(PLAYER_LEFT, players => this.setState({ players }));
		socket.on(DID_START_GAME, (gameState) => {
			const { history } = this.props;
			const { socketRoom } = this.state;
			history.push({
				pathname: `/play/${socketRoom}`,
				state: gameState,
			});
		});
	}

	render() {
		const { playerName, inRoom, fromInviteLink, socketRoom, movies, players } = this.state;
		const startGameDisabled = !(players.length >= 2 && movies.length >= 1);

		return (
			<div className="game-setup">
				<NavBar />
				{inRoom
					? (
						<div>
							<h2>Players in your room</h2>
							<PlayersList players={players} />

							<p className="invite-link">
								Share this link to invite people to your game room:&nbsp;
								<a href={getInviteURL(socketRoom)}>
									{getInviteURL(socketRoom)}
								</a>
							</p>
							<h2>Step 2: Add 1 to 5 movies</h2>
							<MovieSearchForm
								addMovieToGame={movie => this.addMovieToServer(movie)}
								didFireSearch={() => this.setState({ loading: true })}
								searchDidEnd={() => this.setState({ loading: false })}
								disableSearch={movies.length >= 5}
								handleMovieSet={_movies => this.setState({ movies: _movies })}
							/>

							<MoviesList
								movies={movies}
								removeMovie={movie => this.removeMovieFromServer(movie)}
							/>

							<h2>Step 3:</h2>
							<div className="start-game">
								<Button
									className=""
									disabled={startGameDisabled}
									onClick={this.startGame}
								>
									Start Game
								</Button>
							</div>
						</div>
					)
					: (
						<div>
							<h2>Step 1: What&#39;s Your Name?</h2>
							<input
								type="text"
								className="player-name-input"
								value={playerName}
								onChange={e => this.setState({
									playerName: e.target.value,
								})}
							/>
							{!fromInviteLink && (
								<Button disabled={playerName === ''} onClick={this.createSocketRoom}>
									Invite Friends
								</Button>)}
							<Button disabled={playerName === ''} onClick={this.joinRoom}>
								Join Room
							</Button>
						</div>
					)
				}
			</div>
		);
	}
}

GameSetupMulti.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.object.isRequired,
	}).isRequired,
	history: PropTypes.shape({
		push: PropTypes.func.isRequired,
	}).isRequired,
};

export default GameSetupMulti;
