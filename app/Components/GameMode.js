import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';
import clearWindowSocket from '../helpers/clearWindowSocket';

class GameMode extends React.Component {
	componentDidMount() {
		if (window.socket) {
			clearWindowSocket(window);
		}
	}

	render() {
		return (
			<div>
				<NavBar />
				<div className="select-game-mode">
					<Link to="/setup">
						<Button bsSize="lg">Split Screen</Button>
					</Link>
					<div />
					<Link to="/setup-multi">
						<Button bsSize="lg">
							Multiplayer
						</Button>
					</Link>
				</div>
			</div>
		);
	}
}

export default GameMode;
