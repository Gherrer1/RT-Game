import React from 'react';
import MovieSearchForm from './MovieSearchForm';
import getMovieData from '../api';

class RTGame extends React.Component {
    constructor(props) {
        super(props);
    }

    async searchForMovie(movieTitle) {
        console.log(movieTitle);

        const movieData = await getMovieData(movieTitle);
        console.log(movieData);
    }

    render() {
        return (
            <div>
                <h1>Rotten Tomatoes Game</h1>
                <MovieSearchForm handleSubmit={this.searchForMovie} />
            </div>
        );
    }
}

export default RTGame;