import React from 'react';
import openSocket from 'socket.io-client';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';

class GameSetupMulti extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			playerName: '',
			socketRoom: null,
			inRoom: false,
			loading: false,
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
		const { playerName, inRoom, socketRoom, movies } = this.state;

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
