import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';

function ScoreRoundRow({ round, handleClick, movies }) {
	const emptyArray = (new Array(movies.length)).fill(0);
	return (
		<React.Fragment>
			<div />
			{emptyArray.map((_, index) => {
				let cellContent = null;

				if (index < round) {
					cellContent = `Actual score: ${movies[index].meterScore}`;
				}

				if (index === round) {
					cellContent = <Button bsSize="small" bsStyle="success" onClick={() => handleClick(round)}>Score Round</Button>;
				}


				return (
					<div key={index} className="movie-col-cell">
						{cellContent}
					</div>
				);
			})}
		</React.Fragment>
	);
}

ScoreRoundRow.propTypes = {
	round: PropTypes.number.isRequired,
	handleClick: PropTypes.func.isRequired,
	movies: PropTypes.array.isRequired,
};

export default ScoreRoundRow;
