import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import { isValidRatingGuess } from '../helpers/validators';
import { getWinningScore } from '../helpers/gameplay';
import PlayerGuesses, { OtherPlayerGuesses } from './PlayerGuesses';
import socketEventNames from '../../sockets/socketEventNames';

const { PLAYER_LEFT } = socketEventNames;

function removeSocketListeners(socket) {
	socket.off(PLAYER_LEFT);
}

class GameGridMulti extends React.Component {
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
	}

	updateGuess(guess) {
		console.log(guess);
	}

	render() {
		const { players, movies, round, shouldRedirectToHome } = this.state;

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
