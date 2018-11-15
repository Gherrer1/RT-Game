import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import getMovieData from '../api';

const { MOVIE_FOUND, COULD_NOT_FIND_MOVIE_NAMED, RECOMMENDATIONS } = require('../../lambda/messages');
const fakeMovieData = [
    { image: 'https://resizing.flixster.com/yTmdjXPPphGLshRtgVT_uIITjZQ=/fit-in/80x80/v1.bTsxMTMxMTY2NztqOzE3OTUwOzEyMDA7MTAxMDsxMzQ2', name: 'Thor' },
    { name: 'Iron man', image: 'https://resizing.flixster.com/VLupEasUmxg6mJGHLSbuOzw9Sdo=/fit-in/80x80/v1.bTsxMTIxODE4OTtqOzE3OTQ5OzEyMDA7MTAwMDsxNTAw' },
    { name: 'Captain America', image: 'https://resizing.flixster.com/UPTF47V9lv1wCTGwqmqDF4nCYmw=/fit-in/80x80/v1.bTsxMTYxODU4MztqOzE3OTU0OzEyMDA7NzMwOzEzMDY' },
    { name: 'Avengers: Infinity War', image: 'https://resizing.flixster.com/OJi1Q2nHq8HM_NCHk5ZHKHPibso=/fit-in/80x80/v1.bTsxMjcwMDQ5MztqOzE3ODc2OzEyMDA7MTY4ODsyNTAw' },
    { name: 'Stuart Little', image: 'https://resizing.flixster.com/1cFCxP0P0sX_GHxZv6alw0Bmevk=/fit-in/80x80/v1.bTsxMTIwNDY2OTtqOzE3OTQ5OzEyMDA7MTUzMDsyMDQw' },
];

class RTGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            movies: fakeMovieData,
            errorMessage: null,
            warningMessage: null,
            searchedFor: null,
            recommendations: null,
        };

        this.searchForMovie = this.searchForMovie.bind(this);
        this.addMovieToGame = this.addMovieToGame.bind(this);
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
        const { movies, errorMessage, warningMessage, searchedFor, recommendations } = this.state;
        return (
            <div>
                <h1>Rotten Tomatoes Game</h1>
                <MovieSearchForm handleSubmit={this.searchForMovie} />
                {errorMessage && (
                    <Alert bsStyle="danger">
                        {COULD_NOT_FIND_MOVIE_NAMED} <strong>{searchedFor}</strong>
                    </Alert>
                )}
                {warningMessage && (
                    <Alert bsStyle="warning">
                        <h4>{warningMessage}</h4>
                        <p>Searched for <strong>{searchedFor}</strong></p>
                        <ul>
                            {recommendations.map(movie => (
                                <li key={movie.image}>
                                    <a
                                        className="recommended-title"
                                        onClick={() => this.addMovieToGame(movie)}
                                    >
                                        {movie.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}
                <MoviesList movies={movies} />
            </div>
        );
    }
}

export default RTGame;