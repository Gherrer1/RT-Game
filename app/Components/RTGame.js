import React from 'react';
import GameGrid from './GameGrid';
import GameSetup from './GameSetup';
import getMovieData from '../api';
import PlayersForm from './PlayersForm';

const { MOVIE_FOUND, COULD_NOT_FIND_MOVIE_NAMED, RECOMMENDATIONS, MULTIPLE_MOVIES_FOUND } = require('../../lambda/messages');
const fakeMovieData = [
    { name: 'Thor', image: 'https://resizing.flixster.com/yTmdjXPPphGLshRtgVT_uIITjZQ=/fit-in/80x80/v1.bTsxMTMxMTY2NztqOzE3OTUwOzEyMDA7MTAxMDsxMzQ2', year: 2010 },
    { name: 'Iron man', image: 'https://resizing.flixster.com/VLupEasUmxg6mJGHLSbuOzw9Sdo=/fit-in/80x80/v1.bTsxMTIxODE4OTtqOzE3OTQ5OzEyMDA7MTAwMDsxNTAw', year: 2012 },
    { name: 'Captain America', image: 'https://resizing.flixster.com/UPTF47V9lv1wCTGwqmqDF4nCYmw=/fit-in/80x80/v1.bTsxMTYxODU4MztqOzE3OTU0OzEyMDA7NzMwOzEzMDY', year: 2011 },
    { name: 'Avengers: Infinity War', image: 'https://resizing.flixster.com/OJi1Q2nHq8HM_NCHk5ZHKHPibso=/fit-in/80x80/v1.bTsxMjcwMDQ5MztqOzE3ODc2OzEyMDA7MTY4ODsyNTAw', year: 2018 },
    { name: 'Stuart Little', image: 'https://resizing.flixster.com/1cFCxP0P0sX_GHxZv6alw0Bmevk=/fit-in/80x80/v1.bTsxMTIwNDY2OTtqOzE3OTQ5OzEyMDA7MTUzMDsyMDQw', year: 1999 },
];

const initialPlayerData = [
    { name: '', score: 0, id: 1 },
    { name: '', score: 0, id: 2},
];

class RTGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            movies: fakeMovieData,
            players: initialPlayerData,
            playing: false,
            errorMessage: null,
            warningMessage: null,
            searchedFor: null,
            recommendations: null,
        };

        this.searchForMovie = this.searchForMovie.bind(this);
        this.addMovieToGame = this.addMovieToGame.bind(this);
        this.removeMovie = this.removeMovie.bind(this);
        this.updatePlayerName = this.updatePlayerName.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
    }

    async searchForMovie(movieTitle) {
        const movieData = await getMovieData(movieTitle);
        console.log(movieData);
        if(movieData.message === MOVIE_FOUND) {
            this.addMovieToGame(movieData.movie);
        }

        if(movieData.message.startsWith(COULD_NOT_FIND_MOVIE_NAMED)) {
            return this.setState({
                errorMessage: movieData.message,
                searchedFor: movieData.searchedFor,
                warningMessage: null,
                recommendations: null,
            });
        }

        if(movieData.message === RECOMMENDATIONS) {
            return this.setState({
                errorMessage: null,
                warningMessage: RECOMMENDATIONS,
                searchedFor: movieData.searchedFor,
                recommendations: movieData.recommendations,
            });
        }

        if(movieData.message === MULTIPLE_MOVIES_FOUND) {
            return this.setState({
                errorMessage: null,
                warningMessage: MULTIPLE_MOVIES_FOUND,
                searchedFor: movieData.searchedFor,
                recommendations: movieData.movies
            })
        }
    }

    updatePlayerName(index, name) {
        this.setState(prevState => ({
            players: prevState.players.map((player, i) => i === index ?
                { ...player, name }
                : player
            ),
        }));
    }

    addPlayer(e) {
        e.preventDefault();
        
        this.setState(prevState => ({
            players: prevState.players.concat([{
                name: '',
                score: 0,
                id: prevState.players[prevState.players.length - 1].id + 1,
            }]),
        }));
    }

    removeMovie(movie) {
        this.setState(prevState => ({
            movies: prevState.movies.filter(mov => mov.image !== movie.image),
        }));
    }

    addMovieToGame(movie) {
        this.setState(prevState => ({
            movies: prevState.movies.concat([ movie ]),
            errorMessage: null,
            warningMessage: null,
            searchFor: null,
            recommendations: null,
        }));
    }

    render() {
        const { movies, players, errorMessage, warningMessage, searchedFor, recommendations, playing } = this.state;

        if(playing) {
            return (
                <GameGrid />
            );
        }

        return (
            <GameSetup
                movies={movies}
                players={players}
                errorMessage={errorMessage}
                warningMessage={warningMessage}
                searchedFor={searchedFor}
                recommendations={recommendations}
                removeMovie={this.removeMovie}
                updatePlayerName={this.updatePlayerName}
                addPlayer={this.addPlayer}
                searchForMovie={this.searchForMovie}
                startGame={() => this.setState({ playing: true })}
                addMovieToGame={this.addMovieToGame}
            />
        );
    }
}

export default RTGame;