import React from 'react';
import { Route } from 'react-router-dom';
import GameMode from './GameMode';
import GameSetup from './GameSetup';
import GameGrid from './GameGrid';
import GameGridMulti from './GameGridMulti';
import GameSetupMulti from './GameSetupMulti';
import NoMobile from './NoMobile';

function App() {
	const windowWidth = window.innerWidth || document.body.clientWidth;
	if (windowWidth <= 500) {
		return <NoMobile />;
	}
	return (
		<div>
			<Route path="/" exact component={GameMode} />
			<Route path="/setup" exact component={GameSetup} />
			<Route path="/setup-multi" exact component={GameSetupMulti} />
			<Route path="/setup-multi/:roomID" component={GameSetupMulti} />
			<Route path="/play" exact component={GameGrid} />
			<Route path="/play/:roomID" component={GameGridMulti} />
		</div>
	);
}

export default App;
