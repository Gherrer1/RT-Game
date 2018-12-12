import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import GameMode from './GameMode';
import GameSetup from './GameSetup';
// import RTGame from './RTGame';

// GameSetup's beginGame function can just programmtically navigate to new route from there

function App() {
	return (
		<Router>
			<div>
				<Route path="/" exact component={GameMode} />
				{/* <RTGame /> */}
				<Route path="/setup" exact render={props => <GameSetup />} />
			</div>
		</Router>
	);
}

export default App;
