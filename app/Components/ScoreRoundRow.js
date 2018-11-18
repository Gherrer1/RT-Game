import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';

function ScoreRoundRow({ numMovies, round, handleClick }) {
	const emptyArray = (new Array(numMovies)).fill(0);
	return (
		<React.Fragment>
			<div />
			{emptyArray.map((_, index) => (index === round
				? (
					<div key={index}>
						<Button bsSize="small" bsStyle="success" onClick={() => handleClick(round)}>Score Round</Button>
					</div>
				)
				: <div key={index} />
			))}
		</React.Fragment>
	);
}

ScoreRoundRow.propTypes = {
	numMovies: PropTypes.number.isRequired,
	round: PropTypes.number.isRequired,
	handleClick: PropTypes.func.isRequired,
};

export default ScoreRoundRow;
