import React from 'react';
import { Route } from 'react-router-dom';
import GameMode from './GameMode';
import GameSetup from './GameSetup';
import GameGrid from './GameGrid';

function App() {
	return (
		<div>
			<Route path="/" exact component={GameMode} />
			{/* <RTGame /> */}
			<Route path="/setup" exact component={GameSetup} />
			<Route path="/setup-multi" exact render={props => <GameSetup {...props} multi />} />
			<Route path="/play" exact component={GameGrid} />
		</div>
	);
}

export default App;
