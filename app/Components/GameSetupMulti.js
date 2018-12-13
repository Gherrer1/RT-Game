import React from 'react';
import { Button } from 'react-bootstrap/lib';
import NavBar from './NavBar';

class GameSetupMulti extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			playerName: '',
		};
	}

	render() {
		const { playerName } = this.state;
		return (
			<div className="game-setup">
				<NavBar />
				<h2>Step 1: What&#39;s Your Name?</h2>
				<input
					type="text"
					className="player-name-input"
					value={playerName}
					onChange={e => this.setState({ playerName: e.target.value })}
				/>
				<div>
					<Button disabled={playerName === ''}>Invite Friends</Button>
					<Button disabled={playerName === ''}>Join Room</Button>
				</div>
			</div>
		);
	}
}

export default GameSetupMulti;
