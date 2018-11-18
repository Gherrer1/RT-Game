import React from 'react';
import PropTypes from 'prop-types';
import GridHeader from './GridHeader';
import PlayerGuesses from './PlayerGuesses';
import ScoreRoundRow from './ScoreRoundRow';
import { isValidRatingGuess } from '../helpers/validators';
import { playersWhoHaventGuessedYet } from '../helpers/gameplay';

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
		this.scoreRound = this.scoreRound.bind(this);
	}

	scoreRound(round) {
		// first, make sure that all players have entered a non empty string score
		const { players } = this.state;
		const problemPlayers = playersWhoHaventGuessedYet(players, round);
		if (problemPlayers.length > 0) {
			const errMsg = `The following players need to input a guess: ${problemPlayers.map(p => p.name).join(' ')}`;
			alert(errMsg);
			return;
		}

		this.setState(prevState => ({
			round: prevState.round + 1,
		}));
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
				<ScoreRoundRow numMovies={movies.length} round={round} handleClick={this.scoreRound} />
			</div>
		);
	}
}

GameGrid.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
};

export default GameGrid;
