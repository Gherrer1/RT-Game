import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';

function ScoreRoundRow({ numMovies, round }) {
	const emptyArray = (new Array(numMovies)).fill(0);
	return (
		<React.Fragment>
			<div />
			{emptyArray.map((_, index) => (index === round
				? (
					<div key={index}>
						<Button bsSize="small" bsStyle="success">Score Round</Button>
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
};

export default ScoreRoundRow;
