import React from 'react';
import Player from './Player';
import { IPlayerDuringGame } from '../../sharedTypes';

interface Props {
	player: IPlayerDuringGame;
	round: number;
	winningScore: number;
	updateGuess(playerID: string, guessIndex: number, newValue: string): void;
}

function PlayerGuesses({ player, round, updateGuess, winningScore }: Props) {
	return (
		<React.Fragment>
			<Player player={player} winningScore={winningScore} />
			{player.guesses.map((guess, index) => (
				<div key={index} className={`movie-col-cell ${index === round ? '' : 'dormant'}`}>
					<input
						value={guess}
						onChange={e => updateGuess(player.id, index, e.target.value)}
						disabled={index !== round}
						placeholder="0 - 100"
						className="guess-input"
					/>
				</div>
			))}
		</React.Fragment>
	);
}

interface OPGuesses {
	player: IPlayerDuringGame;
	round: number;
	winningScore: number;
}

export function OtherPlayerGuesses({ player, round, winningScore }: OPGuesses) {
	return (
		<React.Fragment>
			<Player player={player} winningScore={winningScore} />
			{player.guesses.map((guess, index) => (
				<div key={index} className={`movie-col-cell ${index === round ? '' : 'dormant'}`}>
					{(() => {
						if (index < round) {
							return <span>{guess}</span>;
						}

						if (index === round) {
							if (player.submittedGuessForRound) {
								return <span style={{ borderBottom: `3px solid ${player.color}` }}>Ready!</span>;
							}
							return <span>Hidden</span>;
						}

						return null;
					})()}
				</div>
			))}
		</React.Fragment>
	);
}

export default PlayerGuesses;
