import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';

function GameMode() {
	return (
		<div>
			<NavBar />
			<div className="select-game-mode">
				<Link to="/setup">
					<Button>Split Screen</Button>
				</Link>
				<div />
				<Link to="/setup-multi">
					<Button>
						Multiplayer
					</Button>
				</Link>
			</div>
		</div>
	);
}

export default GameMode;
