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
		this.addSocketListeners = this.addSocketListeners.bind(this);
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

	createSocketRoom() {
		const { playerName } = this.state;
		const socket = openSocket('http://localhost:8000');
		socket.on('room id', (roomID, gameState) => {
			this.setState({
				socketRoom: roomID,
				inRoom: true,
			});
			window.socket = socket;
			this.addSocketListeners(socket);
		});
		socket.emit('create room', playerName);
	}

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
									players: [{ name: e.target.value, score: 0, id: 1 }], // remove this line later
								})}
							/>
							{!fromInviteLink && (
								<Button disabled={playerName === ''} onClick={this.createSocketRoom}>
									Invite Friends
								</Button>)}
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

GameSetupMulti.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.object.isRequired,
	}).isRequired,
};

export default GameSetupMulti;
