import React from 'react';
import openSocket from 'socket.io-client';
import GameGrid from './GameGrid';
import GameSetup from './GameSetup';
import NoMobile from './NoMobile';

class RTGame extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: [],
			players: [],
			playing: false,
			onMobile: false,
			socketRoom: null,
		};

		this.beginGame = this.beginGame.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
	}

	componentDidMount() {
		const windowWidth = window.innerWidth || document.body.clientWidth;
		if (windowWidth <= 500) {
			this.setState({ onMobile: true });
		}
	}

	createRoom() {
		const socket = openSocket('http://localhost:8000');
		socket.on('room id', roomID => this.setState({
			socketRoom: roomID,
		}));
		socket.on('new player', playerID => console.log(`new player has joined this room: ${playerID}`));

		socket.emit('create room');
	}

	joinRoom() {
		const socket = openSocket('http://localhost:8000');
		socket.on('new player', playerID => console.log(`new player has joined this room: ${playerID}`));
		socket.on('successful join', roomID => this.setState({
			socketRoom: roomID,
		}));
		socket.on('failed join', () => alert('Failed to join that room. It might not exist')
			|| socket.close());

		const roomID = prompt('Which room?');
		socket.emit('join room', roomID);
	}

	beginGame(movies, players) {
		const nonEmptyPlayers = players.filter(p => p.name !== '');
		if (nonEmptyPlayers.length === 0) {
			return alert('Please add names for the players who are playing');
		}
		this.setState({
			movies,
			players,
			playing: true,
		});
	}

	render() {
		const { playing, movies, players, onMobile, socketRoom } = this.state;

		if (onMobile) {
			return (
				<NoMobile />
			);
		}

		if (playing) {
			const playingPlayers = players.filter(p => p.name !== '');
			return (
				<GameGrid movies={movies} players={playingPlayers} />
			);
		}

		return (
			<React.Fragment>
				<GameSetup
					beginGame={this.beginGame}
				/>
				{socketRoom
					? <p>{socketRoom}</p>
					: (
						<div>
							<button onClick={() => this.createRoom()} type="button">Invite Friend</button>
							<button onClick={() => this.joinRoom()} type="button">Join Room</button>
						</div>)
				}
			</React.Fragment>
		);
	}
}

export default RTGame;
