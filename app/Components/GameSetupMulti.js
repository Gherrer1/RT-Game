import React from 'react';
import openSocket from 'socket.io-client';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import MovieSearchForm from './MovieSearchForm';

class GameSetupMulti extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			playerName: '',
			socketRoom: null,
			inRoom: false,
			movies: [],
			players: [],
		};

		this.createSocketRoom = this.createSocketRoom.bind(this);
		this.addSocketListeners = this.addSocketListeners.bind(this);
	}

	createSocketRoom() {
		const socket = openSocket('http://localhost:8000');
		socket.on('room id', (roomID) => {
			this.setState({
				socketRoom: roomID,
				inRoom: true,
			});
			this.socket = socket;
			this.addSocketListeners(socket);
		});
		socket.emit('create room');
	}

	addSocketListeners(socket) {
		socket.on('did remove movie', newMoviesState => this.setState({ movies: newMoviesState }));
		socket.on('did add movie pack', movies => this.setState({ movies }));
	}

	render() {
		const { playerName, inRoom, socketRoom } = this.state;

		return (
			<div className="game-setup">
				<NavBar />
				<h2>Step 1: What&#39;s Your Name?</h2>
				<input
					type="text"
					className="player-name-input"
					value={playerName}
					onChange={e => this.setState({ playerName: e.target.value })}
				/>
				{inRoom
					? (
						<div>
							<p className="invite-link">
								Share this link to invite people to your game room: {socketRoom}
							</p>
							<MovieSearchForm />
						</div>
					)
					: (
						<div>
							<Button disabled={playerName === ''} onClick={this.createSocketRoom}>
								Invite Friends
							</Button>
							<Button disabled={playerName === ''}>
								Join Room
							</Button>
						</div>
					)
				}
			</div>
		);
	}
}

export default GameSetupMulti;
