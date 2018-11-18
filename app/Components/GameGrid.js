import React from 'react';
import PropTypes from 'prop-types';
import GridHeader from './GridHeader';
import PlayerGuesses from './PlayerGuesses';
import ScoreRoundRow from './ScoreRoundRow';
import { isValidRatingGuess } from '../helpers/validators';

class GameGrid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			players: props.players.map(player => ({
				...player,
				guesses: props.movies.map(() => ''),
			})),
			movies: [...props.movies],
			round: 0,
		};

		this.updateGuess = this.updateGuess.bind(this);
	}

	updateGuess(playerId, guessIndex, newValue) {
		if (!isValidRatingGuess(newValue)) {
			return;
		}
		this.setState(prevState => ({
			players: prevState.players.map(p => (p.id === playerId ? ({
				...p,
				guesses: p.guesses.map((g, index) => (index === guessIndex ? newValue : g)),
			}) : p)),
		}));
	}

	render() {
		const { players, movies, round } = this.state;
		return (
			<div className="grid">
				<GridHeader movies={movies} round={round} />
				{players.map(player => (
					<PlayerGuesses
						key={player.id}
						player={player}
						round={round}
						updateGuess={this.updateGuess}
					/>
				))}
				<ScoreRoundRow numMovies={movies.length} round={round} />
			</div>
		);
	}
}

GameGrid.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
};

export default GameGrid;
