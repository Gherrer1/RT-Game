import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
	return (
		<Link to="/">
			<h1 className="site-title">The Rotten Tomatoes Game</h1>
		</Link>
	);
}

export default NavBar;
