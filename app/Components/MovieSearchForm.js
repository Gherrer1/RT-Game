import React from 'react';

class MovieSearchFrom extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            movieInput: '',
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();

        this.props.handleSubmit(this.state.movieInput);
        this.setState({
            movieInput: '',
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    name="movieTitle"
                    value={this.state.movieInput}
                    onChange={e => this.setState({ movieInput: e.target.value })}
                    autoComplete="off"
                />
                <button type="submit">Add Movie</button>
            </form>
        );
    }
}

export default MovieSearchFrom;