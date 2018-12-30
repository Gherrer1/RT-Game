export interface IPlayer {
    id: string;
    name: string;
    color: string;
    score: number;
    guesses: string[];
}

export interface IPlayerDuringGame {
    id: string;
    name: string;
    color: string;
    score: number;
    guesses: string[];
    submittedGuessForRound: boolean;
}

export interface IMovie {
    image: string;
    name: string;
    year: number;
}