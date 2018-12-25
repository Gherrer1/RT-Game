import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap/lib';

function ScoreRoundRow({ round, handleClick, movies, buttonText, disableButton }) {
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
					cellContent = (
						<Button
							disabled={disableButton}
							bsSize="small"
							bsStyle="success"
							onClick={() => handleClick(round)}
						>
							{buttonText}
						</Button>);
				}


				return (
					<div key={index} className={`movie-col-cell ${index < round ? 'actual-score' : ''}`}>
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
	buttonText: PropTypes.string.isRequired,
	disableButton: PropTypes.bool,
};
ScoreRoundRow.defaultProps = {
	disableButton: false,
};

export default ScoreRoundRow;
