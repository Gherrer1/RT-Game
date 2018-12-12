import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';

class GameMode extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showingMultiplayerOptions: false,
		};
	}

	render() {
		const { showingMultiplayerOptions } = this.state;
		return (
			<div>
				<NavBar />
				<div className="select-game-mode">
					<Link to="/setup">
						<Button>Split Screen</Button>
					</Link>
					<div />
					<Button onClick={() => this.setState({
						showingMultiplayerOptions: true,
					})}
					>
						Multiplayer
					</Button>
					{showingMultiplayerOptions && (
						<div className="multiplayer-options">
							<Button>Create Room</Button>
							<Button>Join Room</Button>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default GameMode;
