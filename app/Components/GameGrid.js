import React from 'react';
import PropTypes from 'prop-types';
import GridHeader from './GridHeader';

class GameGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			players: [...props.players],
			movies: [...props.movies],
		};
	}

	render() {
		const { players, movies } = this.state;
		return (
			<div className="grid">
				<GridHeader movies={movies} />
			</div>
		);
	}
}

GameGrid.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
};

export default GameGrid;
