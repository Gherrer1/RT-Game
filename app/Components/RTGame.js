import React from 'react';
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
		};

		this.beginGame = this.beginGame.bind(this);
	}

	componentDidMount() {
		const windowWidth = window.innerWidth || document.body.clientWidth;
		if (windowWidth <= 500) {
			this.setState({ onMobile: true });
		}
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
