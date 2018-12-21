import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import PlayerGuesses from './PlayerGuesses';
import ScoreRoundRow from './ScoreRoundRow';
import AnnounceWinners from './AnnounceWinner';
import { isValidRatingGuess } from '../helpers/validators';
import { playersWhoHaventGuessedYet, getWinningScore } from '../helpers/gameplay';

class GameGrid extends React.Component {
	constructor(props) {
		super(props);

		const { location } = this.props;
		const { state: routerState } = location;
		if (routerState && routerState.players && routerState.movies) {
			this.state = {
				players: routerState.players.map(player => ({
					...player,
					guesses: routerState.movies.map(() => ''),
				})),
				movies: [...routerState.movies],
				round: 0,
				shouldRedirectToHome: false,
			};
		} else {
			this.state = {
				shouldRedirectToHome: true,
			};
		}

		this.updateGuess = this.updateGuess.bind(this);
		this.scoreRound = this.scoreRound.bind(this);
	}

	componentDidMount() {
		const { movies } = this.state;
		if (movies) {
			document.body.style.setProperty('--num-columns', movies.length);
		}
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
		const { players, movies, round, shouldRedirectToHome } = this.state;

		if (shouldRedirectToHome) {
			return <Redirect to="/" />;
		}

		const winningScore = getWinningScore(players);
		return (
			<div>
				<NavBar />
				<HowScoringWorks />
				{(round >= movies.length)
						&& <AnnounceWinners winners={players.filter(p => p.score === winningScore)} />
				}
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
						buttonText="Score Row!"
					/>
				</div>
			</div>
		);
	}
}

GameGrid.propTypes = {
	location: PropTypes.object.isRequired,
};

export default GameGrid;
