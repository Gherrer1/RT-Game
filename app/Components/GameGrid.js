import React from 'react';
import PropTypes from 'prop-types';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import PlayerGuesses from './PlayerGuesses';
import ScoreRoundRow from './ScoreRoundRow';
import { isValidRatingGuess } from '../helpers/validators';
import { playersWhoHaventGuessedYet, getWinningScore } from '../helpers/gameplay';

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

	componentDidMount() {
		document.body.style.setProperty('--num-columns', this.state.movies.length);
	}

	scoreRound(round) {
		// first, make sure that all players have entered a non empty string score
		const { players, movies } = this.state;
		const problemPlayers = playersWhoHaventGuessedYet(players, round);
		if (problemPlayers.length > 0) {
			const errMsg = `The following players need to input a guess: ${problemPlayers.map(p => p.name).join(', ')}`;
			alert(errMsg);
			return;
		}

		// now take each guess and update players score
		const actualScore = movies[round].meterScore;
		console.log('actual score', actualScore);
		const eachPlayersGuess = players.map(p => p.guesses).map(guesses => guesses[round]);
		const scoreOffsets = eachPlayersGuess.map(guess => (Number(guess) === actualScore
			? -10 : Math.abs(actualScore - Number(guess))));
		const updatedPlayersState = players.map((p, index) => ({
			...p,
			score: p.score + scoreOffsets[index],
		}));

		this.setState(prevState => ({
			round: prevState.round + 1,
			players: updatedPlayersState,
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
		const winningScore = getWinningScore(players);
		return (
			<div>
				<HowScoringWorks />
				<div className="game-grid">
					<GridHeader movies={movies} round={round} />
					{players.map(player => (
						<PlayerGuesses
							key={player.id}
							player={player}
							round={round}
							updateGuess={this.updateGuess}
							winningScore={winningScore}
						/>
					))}
					<ScoreRoundRow
						movies={movies}
						round={round}
						handleClick={this.scoreRound}
					/>
					{(round >= movies.length)
						&& (
							<div>The winner is{' '}
								{players.reduce((accumulator, current) => (
									current.score < accumulator.score ? current : accumulator
								), players[0]).name}!
							</div>
						)
					}
				</div>
			</div>
		);
	}
}

GameGrid.propTypes = {
	players: PropTypes.array.isRequired,
	movies: PropTypes.array.isRequired,
};

export default GameGrid;
