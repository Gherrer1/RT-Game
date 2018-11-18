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
			round: 0,
		};
	}

	render() {
		const { players, movies, round } = this.state;
		return (
			<div className="grid">
				<GridHeader movies={movies} round={round} />
				{players.map(player => (
					<PlayerGuesses key={player.id} player={player} round={round} />
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
