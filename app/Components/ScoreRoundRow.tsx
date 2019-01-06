import React from 'react';
import { Button } from 'react-bootstrap/lib';
import { IMovie } from '../../sharedTypes';

interface Props {
	round: number;
	movies: IMovie[];
	buttonText: string;
	handleClick: (round: number) => void;
	disableButton: boolean;
}

function ScoreRoundRow({ round, handleClick, movies, buttonText, disableButton = false }: Props) {
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

export default ScoreRoundRow;
