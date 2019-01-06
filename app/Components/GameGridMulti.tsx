import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import NavBar from './NavBar';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import ScoreRoundRow from './ScoreRoundRow';
import { isValidRatingGuess } from '../helpers/validators';
import { getWinningScore } from '../helpers/gameplay';
import PlayerGuesses, { OtherPlayerGuesses } from './PlayerGuesses';
import socketEventNames from '../../sockets/socketEventNames';
import AnnounceWinner from './AnnounceWinner';
import { IMovie, IPlayerDuringGame } from '../../sharedTypes';

const { PLAYER_LEFT, PLAYER_SUBMITTED_GUESS, PLAYER_DID_SUBMIT_GUESS, DID_SCORE_ROUND, GAME_OVER,
} = socketEventNames;

function removeSocketListeners(socket: SocketIOClient.Socket) {
	socket.off(PLAYER_LEFT);
	socket.off(PLAYER_DID_SUBMIT_GUESS);
	socket.off(DID_SCORE_ROUND);
	socket.off(GAME_OVER);
}

interface State {
	round: number;
	movies: IMovie[];
	players: IPlayerDuringGame[];
	shouldRedirectToHome: boolean;
	socketRoom: string;
	submittedGuessForRound: boolean;
	gameOver: boolean;
}

class GameGridMulti extends React.Component<RouteComponentProps, State> {
	constructor(props: RouteComponentProps) {
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
				players: [],
				movies: [],
				round: 0,
				socketRoom: '',
				submittedGuessForRound: false,
				gameOver: false,
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
			document.body.style.setProperty('--num-columns', movies.length.toString());
		}

		this.addSocketListeners(window.socket);
	}

	componentWillUnmount() {
		if (window.socket) {
			removeSocketListeners(window.socket);
		}
	}

	addSocketListeners(socket: SocketIOClient.Socket) {
		socket.on(PLAYER_LEFT, (newPlayersState: IPlayerDuringGame[]) => this.setState({ players: newPlayersState }));
		socket.on(PLAYER_DID_SUBMIT_GUESS,
			(newPlayersState: IPlayerDuringGame[]) => this.setState({ players: newPlayersState }));
		socket.on(DID_SCORE_ROUND, ({ round, players }: { round: number, players: IPlayerDuringGame[] }) => this.setState({
			round,
			players,
			submittedGuessForRound: false,
		}));
		socket.on(GAME_OVER, ({ round, players }: { round: number, players: IPlayerDuringGame[] }) => this.setState({
			gameOver: true,
			players,
			round,
		}));
	}

	updateGuess(playerId: string, guessIndex: number, newValue: string) {
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

		if (!thisPlayer) {
			console.log('"thisPlayer" was null so we redirected');
			return <Redirect to="/" />;
		}

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

export default GameGridMulti;
