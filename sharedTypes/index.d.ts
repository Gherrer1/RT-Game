declare global {
    interface Window {
        socket: SocketIOClient.Socket;
    }
}

export interface IPlayer {
    id: string | number;
    name: string;
    color: string;
    score: number;
    guesses: string[];
}

export interface IPlayerDuringGame {
    id: string | number;
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
    meterScore: number;
}

export interface IGameStateSetup {
    movies: IMovie[];
    players: IPlayer[];
}