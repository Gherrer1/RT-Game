import React from 'react';

function HowScoringWorks() {
	return (
		<div>
			<h2>How scoring works:</h2>
			<ul>
				<li>Each player starts at 0</li>
				<li>
					The difference between the movie&#39;s actual rating and your guess is added to your score
				</li>
				<li>
					If you guess the score correctly, 10 is subtracted from your score
				</li>
				<li>Lowest score wins!</li>
			</ul>
		</div>
	);
}

export default HowScoringWorks;
