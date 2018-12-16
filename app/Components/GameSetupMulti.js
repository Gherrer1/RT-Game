import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import openSocket from 'socket.io-client';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import PlayersList from './PlayersList';
import getInviteURL from '../helpers/url';

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL;
if (!SOCKET_SERVER_URL) {
	throw new Error('Socket server url missing. Check your .env file');
}
console.log(SOCKET_SERVER_URL);

class GameSetupMulti extends React.Component {
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

	playerJoined(newPlayersState) {
		this.setState({
			players: newPlayersState,
		});
	}

	createSocketRoom() {
		const { playerName } = this.state;
		const socket = openSocket(SOCKET_SERVER_URL);
		socket.on('room id', (roomID, gameState) => {
			this.setState({
				socketRoom: roomID,
				inRoom: true,
				players: gameState.players,
			});
			window.socket = socket;
			this.addSocketListeners(socket);
		});
		socket.on('new player', newPlayerState => this.playerJoined(newPlayerState));
		socket.emit('create room', playerName);
	}

	joinRoom() {
		// try to connect
		const { playerName } = this.state;
		const { match } = this.props;
		const roomID = match.params.roomID || prompt('Enter the room ID');
		const socket = openSocket(SOCKET_SERVER_URL);
		socket.on('successful join', (roomId, gameState) => {
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
		socket.on('new player', newPlayerState => this.playerJoined(newPlayerState));
		socket.on('failed join', () => alert('That room does not exist.') || socket.close());
		socket.emit('join room', roomID, playerName);
	}

	// exclusively related to movies for now
	addSocketListeners(socket) {
		socket.on('did remove movie', newMoviesState => this.setState({ movies: newMoviesState }));
		socket.on('did add movie pack', movies => this.setState({ movies }));
	}

	render() {
		const { playerName, inRoom, fromInviteLink, socketRoom, movies, players } = this.state;

		return (
			<div className="game-setup">
				<NavBar />
				<h2>Step 1: What&#39;s Your Name?</h2>
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
								addMovieToGame={movie => this.setState(prevState => ({
									movies: prevState.movies.concat([ movie ]),
								}))}
								didFireSearch={() => this.setState({ loading: true })}
								searchDidEnd={() => this.setState({ loading: false })}
								disableSearch={movies.length >= 5}
								handleMovieSet={_movies => this.setState({ movies: _movies })}
							/>

							<MoviesList
								movies={movies}
								removeMovie={movie => this.setState(prevState => ({
									movies: prevState.movies.filter(_movie => _movie.image !== movie.image),
								}))}
							/>

							<h2>Step 3:</h2>
							<Link to={{
								pathname: `/play/${socketRoom}`,
								state: {
									movies,
									players,
								},
							}}
							>
								<Button>Start Game</Button>
							</Link>
						</div>
					)
					: (
						<div>
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
};

export default GameSetupMulti;
