import React from 'react';
import MovieSearchForm from './MovieSearchForm';

class RTGame extends React.Component {
    constructor(props) {
        super(props);
    }

    searchForMovie(movieTitle) {
        console.log(movieTitle);
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