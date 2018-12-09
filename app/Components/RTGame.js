import React from 'react';
import openSocket from 'socket.io-client';
import GameGrid from './GameGrid';
import GameSetup from './GameSetup';
import NoMobile from './NoMobile';

const socket = openSocket('http://localhost:8000');

function subscribeToTimer(interval, cb) {
	socket.on('timer', cb);
	socket.emit('subscribeToTimer', interval);
}

class RTGame extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: [],
			players: [],
			playing: false,
			onMobile: false,
			time: null,
		};

		this.beginGame = this.beginGame.bind(this);
	}

	componentDidMount() {
		const windowWidth = window.innerWidth || document.body.clientWidth;
		if (windowWidth <= 500) {
			this.setState({ onMobile: true });
		}

		console.log('subscribing to timer');
		subscribeToTimer(1500, (time) => {
			this.setState({ time });
		});
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
		const { playing, movies, players, onMobile } = this.state;

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
			<GameSetup
				beginGame={this.beginGame}
			/>
		);
	}
}

export default RTGame;
