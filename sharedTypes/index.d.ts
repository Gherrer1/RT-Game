export interface IPlayer {
    id: string;
    name: string;
    color: string;
    score: number;
    guesses: string[];
}

export interface IMovie {
    image: string;
    name: string;
    year: number;
}