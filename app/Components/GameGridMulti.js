import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import ScoreRoundRow from './ScoreRoundRow';
import { isValidRatingGuess } from '../helpers/validators';
import { getWinningScore } from '../helpers/gameplay';
import PlayerGuesses, { OtherPlayerGuesses } from './PlayerGuesses';
import socketEventNames from '../../sockets/socketEventNames';
import AnnounceWinner from './AnnounceWinner';

const { PLAYER_LEFT, PLAYER_SUBMITTED_GUESS, PLAYER_DID_SUBMIT_GUESS, DID_SCORE_ROUND, GAME_OVER,
} = socketEventNames;

function removeSocketListeners(socket) {
	socket.off(PLAYER_LEFT);
	socket.off(PLAYER_DID_SUBMIT_GUESS);
	socket.off(DID_SCORE_ROUND);
	socket.off(GAME_OVER);
}

class GameGridMulti extends React.Component {
	constructor(props) {
		super(props);

		const { location } = this.props;
		const { state: routerState } = location;
		if (routerState && routerState.players && routerState.movies) {
			this.state = {
				players: [...routerState.players],
				movies: [...routerState.movies],
				round: routerState.round,
				socketRoom: routerState.socketRoom,
				shouldRedirectToHome: false,
				submittedGuessForRound: false,
				gameOver: false,
			};
		} else {
			this.state = {
				shouldRedirectToHome: true,
			};
		}

		this.updateGuess = this.updateGuess.bind(this);
		this.submitGuess = this.submitGuess.bind(this);
		this.addSocketListeners = this.addSocketListeners.bind(this);
	}

	componentDidMount() {
		if (!window.socket) {
			this.setState({
				shouldRedirectToHome: true,
			});
			return;
		}

		const { movies } = this.state;
		if (movies) {
			document.body.style.setProperty('--num-columns', movies.length);
		}

		this.addSocketListeners(window.socket);
	}

	componentWillUnmount() {
		if (window.socket) {
			removeSocketListeners(window.socket);
		}
	}

	addSocketListeners(socket) {
		socket.on(PLAYER_LEFT, players => this.setState({ players }));
		socket.on(PLAYER_DID_SUBMIT_GUESS,
			newPlayersState => this.setState({ players: newPlayersState }));
		socket.on(DID_SCORE_ROUND, ({ round, players }) => this.setState({
			round,
			players,
			submittedGuessForRound: false,
		}));
		socket.on(GAME_OVER, ({ round, players }) => this.setState({
			gameOver: true,
			players,
			round,
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

	submitGuess() {
		if (!window.socket) {
			return;
		}

		const { players, socketRoom, round } = this.state;
		const thisPlayer = players.find(player => player.id === window.socket.id);
		if (!thisPlayer) {
			this.setState({
				shouldRedirectToHome: true,
			});
			return;
		}

		window.socket.emit(PLAYER_SUBMITTED_GUESS, socketRoom, thisPlayer.guesses[round]);
		this.setState({
			submittedGuessForRound: true,
		});
	}

	render() {
		const { players, movies, round, shouldRedirectToHome,
			submittedGuessForRound, gameOver } = this.state;

		if (shouldRedirectToHome || !window.socket) {
			return <Redirect to="/" />;
		}

		const thisPlayer = players.find(player => player.id === window.socket.id);
		const otherPlayers = players.filter(player => player.id !== window.socket.id);
		const winningScore = getWinningScore(players);

		return (
			<div>
				<NavBar />
				<HowScoringWorks />
				{(round >= movies.length && gameOver)
					&& <AnnounceWinner winners={players.filter(p => p.score === winningScore)} />
				}
				<div className="game-grid">
					<GridHeader movies={movies} round={round} />
					<PlayerGuesses
						player={thisPlayer}
						round={round}
						updateGuess={this.updateGuess}
						winningScore={winningScore}
					/>
					{otherPlayers.map(player => (
						<OtherPlayerGuesses
							player={player}
							key={player.id}
							round={round}
							winningScore={winningScore}
						/>
					))}
					<ScoreRoundRow
						movies={movies}
						round={round}
						buttonText="I'm Ready!"
						handleClick={this.submitGuess}
						disableButton={thisPlayer.guesses[round] === '' || submittedGuessForRound}
					/>
				</div>
			</div>
		);
	}
}

GameGridMulti.propTypes = {
	location: PropTypes.shape({
		state: PropTypes.object,
	}).isRequired,
};

export default GameGridMulti;
