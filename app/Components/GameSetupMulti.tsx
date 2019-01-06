import React from 'react';
import openSocket from 'socket.io-client';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import PlayersList from './PlayersList';
import getInviteURL from '../helpers/url';
import socketEventNames from '../../sockets/socketEventNames';
import { IMovie, IPlayer, IGameStateSetup } from '../../sharedTypes';
import { RouteComponentProps } from 'react-router-dom';

const { CREATE_ROOM, JOIN_ROOM, ROOM_ID, NEW_PLAYER, SUCCESSFUL_JOIN, FAILED_JOIN, REMOVE_MOVIE,
	DID_REMOVE_MOVIE, ADD_MOVIE_STARTER_PACK, DID_ADD_MOVIE_PACK, ADD_MOVIE, DID_ADD_MOVIE,
	ADD_MOVIE_ERROR, ROOM_FULL, PLAYER_LEFT, START_GAME, DID_START_GAME, GAME_IN_PROGRESS,
} = socketEventNames;

const SOCKET_SERVER_URL: string | undefined = process.env.SOCKET_SERVER_URL;
if (!SOCKET_SERVER_URL) {
	throw new Error('Socket server url missing. Check your .env file');
}

interface MatchParams {
	roomID: string;
}

interface Props extends RouteComponentProps<MatchParams> {
}

interface State {
	playerName: string;
	socketRoom: string | null;
	waitingOnSocketServer: boolean;
	inRoom: boolean;
	fromInviteLink: boolean;
	movies: IMovie[];
	players: IPlayer[];
}

class GameSetupMulti extends React.Component<Props, State> {
	// TODO: remove async / socket / api stuff from component
	static removeSocketListeners(socket: SocketIOClient.Socket) {
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

	constructor(props: Props) {
		super(props);

		this.state = {
			playerName: '',
			socketRoom: null,
			waitingOnSocketServer: false,
			inRoom: false,
			fromInviteLink: false,
			movies: [],
			players: [],
		};

		this.createSocketRoom = this.createSocketRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.addSocketListeners = this.addSocketListeners.bind(this);
		this.playerJoined = this.playerJoined.bind(this);
		this.addMovieToServer = this.addMovieToServer.bind(this);
		this.addMovieSetToServer = this.addMovieSetToServer.bind(this);
		this.removeMovieFromServer = this.removeMovieFromServer.bind(this);
		this.startGame = this.startGame.bind(this);
		this.updatePlayerName = this.updatePlayerName.bind(this);
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

	playerJoined(newPlayersState: IPlayer[]) {
		this.setState({
			players: newPlayersState,
		});
	}

	createSocketRoom() {
		const { playerName } = this.state;
		const socket = openSocket(SOCKET_SERVER_URL as string);
		window.socket = socket;
		this.setState({ waitingOnSocketServer: true });
		socket.on(ROOM_ID, (roomID: string, gameState: IGameStateSetup) => {
			this.setState({
				socketRoom: roomID,
				inRoom: true,
				players: gameState.players,
			});
			this.addSocketListeners(socket);
		});
		socket.on(NEW_PLAYER, (newPlayerState: IPlayer[]) => this.playerJoined(newPlayerState));
		// TODO: failed join scenario
		socket.emit(CREATE_ROOM, playerName);
	}

	joinRoom() {
		// try to connect
		const { playerName } = this.state;
		const { match } = this.props;
		const roomID = match.params.roomID || prompt('Enter the room ID');
		const socket = openSocket(SOCKET_SERVER_URL as string);
		window.socket = socket;
		this.setState({ waitingOnSocketServer: true });
		socket.on(SUCCESSFUL_JOIN, (roomId: string, gameState: IGameStateSetup) => {
			this.setState({
				socketRoom: roomId,
				inRoom: true,
				movies: gameState.movies,
				players: gameState.players,
			});
			this.addSocketListeners(socket);
		});
		socket.on(GAME_IN_PROGRESS, () => {
			alert('The game has already started. Room not joined.');
			socket.close()
		});
		socket.on(NEW_PLAYER, (newPlayerState: IPlayer[]) => this.playerJoined(newPlayerState));
		// we also want to remove window.socket dont we
		socket.on(FAILED_JOIN, () => {
			alert('That room does not exist.');
			GameSetupMulti.removeSocketListeners(window.socket);
			delete window.socket;
			socket.close();
		});
		socket.on(ROOM_FULL, () => {
			alert('That room is already full.');
			GameSetupMulti.removeSocketListeners(window.socket);
			delete window.socket;
			socket.close();
		}); // TODO: redirect back to home
		socket.emit(JOIN_ROOM, roomID, playerName);
	}

	addMovieToServer(movie: IMovie): undefined {
		const { socketRoom } = this.state;
		window.socket.emit(ADD_MOVIE, socketRoom, movie);
		return;
	}

	addMovieSetToServer(movies: IMovie[]) {
		const { socketRoom } = this.state;
		window.socket.emit(ADD_MOVIE_STARTER_PACK, socketRoom, movies);
	}

	removeMovieFromServer(movie: IMovie) {
		const { socketRoom } = this.state;
		window.socket.emit(REMOVE_MOVIE, socketRoom, movie);
	}

	updatePlayerName(e: React.ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;

		this.setState({
			playerName: value,
		});
	}

	startGame() {
		const { socketRoom } = this.state;
		window.socket.emit(START_GAME, socketRoom);
	}

	// exclusively related to movies for now
	addSocketListeners(socket: SocketIOClient.Socket) {
		socket.on(DID_REMOVE_MOVIE, (newMoviesState: IMovie[]) => this.setState({ movies: newMoviesState }));
		socket.on(DID_ADD_MOVIE_PACK, (movies: IMovie[]) => this.setState({ movies }));
		socket.on(DID_ADD_MOVIE, (newMovieState: IMovie[]) => this.setState({ movies: newMovieState }));
		socket.on(ADD_MOVIE_ERROR, (msg: string) => alert(msg));
		socket.on(PLAYER_LEFT, (players: IPlayer[]) => this.setState({ players }));
		socket.on(DID_START_GAME, (gameState: IGameStateSetup) => {
			const { history } = this.props;
			const { socketRoom } = this.state;
			history.push({
				pathname: `/play/${socketRoom}`,
				state: gameState,
			});
		});
	}

	render() {
		const { playerName, inRoom, fromInviteLink, socketRoom, movies, players,
			waitingOnSocketServer } = this.state;
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
								addMovieToGame={this.addMovieToServer}
								disableSearch={movies.length >= 5}
								handleMovieSet={this.addMovieSetToServer}
							/>

							<MoviesList
								movies={movies}
								removeMovie={this.removeMovieFromServer}
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
								onChange={this.updatePlayerName}
							/>
							{!fromInviteLink && (
								<Button disabled={playerName === '' || waitingOnSocketServer} onClick={this.createSocketRoom}>
									Invite Friends
								</Button>)}
							<Button disabled={playerName === '' || waitingOnSocketServer} onClick={this.joinRoom}>
								Join Room
							</Button>
							{waitingOnSocketServer
								&& (
									<div>
										Gives us a minute, our Heroku-hosted servers might be in sleep mode...
									</div>)
							}
						</div>
					)
				}
			</div>
		);
	}
}

export default GameSetupMulti;
