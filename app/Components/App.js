import React from 'react';
import { Route } from 'react-router-dom';
import GameMode from './GameMode';
import GameSetup from './GameSetup';
// import RTGame from './RTGame';

// GameSetup's beginGame function can just programmtically navigate to new route from there

function App() {
	return (
		<div>
			<Route path="/" exact component={GameMode} />
			{/* <RTGame /> */}
			<Route path="/setup" exact component={GameSetup} />
			<Route path="/setup-multi" exact render={props => <GameSetup {...props} multi />} />
		</div>
	);
}

export default App;
