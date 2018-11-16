import React from 'react';
import GameGrid from './GameGrid';
import GameSetup from './GameSetup';

class RTGame extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movies: [],
			players: [],
			playing: false,
		};

		this.beginGame = this.beginGame.bind(this);
	}

	beginGame(movies, players) {
		this.setState({
			movies,
			players,
			playing: true,
		});
	}

	render() {
		const { playing, movies, players } = this.state;
		if (playing) {
			return (
				<GameGrid movies={movies} players={players} />
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
