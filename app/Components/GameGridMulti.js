import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavBar from './NavBar';
import HowScoringWorks from './HowScoringWorks';
import GridHeader from './GridHeader';
import { isValidRatingGuess } from '../helpers/validators';
import { getWinningScore } from '../helpers/gameplay';

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
	}

	componentDidMount() {
		const { movies } = this.state;

		if (!window.socket) {
			this.setState({
				shouldRedirectToHome: true,
			});
			return;
		}

		if (movies) {
			document.body.style.setProperty('--num-columns', movies.length);
		}
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
				<div className="game-grid">
					<GridHeader movies={movies} round={round} />
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