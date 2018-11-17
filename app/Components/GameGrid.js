import React from 'react';
import PropTypes from 'prop-types';
import GridHeader from './GridHeader';
import PlayerGuesses from './PlayerGuesses';

class GameGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			players: props.players.map(player => ({
				...player,
				guesses: props.movies.map(() => 0),
			})),
			movies: [...props.movies],
		};
	}

	render() {
		const { players, movies } = this.state;
		return (
			<div className="grid">
				<GridHeader movies={movies} />
				{players.map(player => (
					<PlayerGuesses key={player.id} player={player} />
				))}
			</div>
		);
	}
}

GameGrid.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
};

export default GameGrid;
