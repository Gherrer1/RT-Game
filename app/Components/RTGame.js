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
	}

	render() {
		const { playing } = this.state;
		if (playing) {
			return (
				<GameGrid />
			);
		}

		return (
			<GameSetup />
		);
	}
}

export default RTGame;
