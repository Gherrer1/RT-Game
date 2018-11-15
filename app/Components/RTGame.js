import React from 'react';
import MovieSearchForm from './MovieSearchForm';
import MoviesList from './MoviesList';
import getMovieData from '../api';

const { MOVIE_FOUND } = require('../../lambda/messages');

class RTGame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            movies: [],
        };

        this.searchForMovie = this.searchForMovie.bind(this);
    }

    async searchForMovie(movieTitle) {
        const movieData = await getMovieData(movieTitle);
        console.log(movieData);
        if(movieData.message === MOVIE_FOUND) {
            return this.setState(prevState => ({
                movies: prevState.movies.concat([ movieData.movie ]),
            }));
        }
    }

    render() {
        const { movies } = this.state;
        return (
            <div>
                <h1>Rotten Tomatoes Game</h1>
                <MovieSearchForm handleSubmit={this.searchForMovie} />
                <MoviesList movies={movies} />
            </div>
        );
    }
}

export default RTGame;