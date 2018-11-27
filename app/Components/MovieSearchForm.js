import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import dicaprio from '../themeSets/dicaprio';

class MovieSearchFrom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movieInput: '',
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelectMovieThemeSet = this.handleSelectMovieThemeSet.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();

		const { handleSubmit } = this.props;
		const { movieInput } = this.state;
		handleSubmit(movieInput);
		this.setState({
			movieInput: '',
		});
	}

	handleSelectMovieThemeSet(e, moviePackage) {
		e.preventDefault();
		const { handleMovieSet } = this.props;
		handleMovieSet(moviePackage);
	}

	render() {
		const { movieInput } = this.state;
		const { disabled, loading } = this.props;
		const buttonText = disabled
			? (loading ? 'Searching for movie...' : 'Max movies reached')
			: 'Add Movie';

		return (
			<div>
				<h2>Step 1: Add 1 to 5 movies</h2>
				<form onSubmit={this.handleSubmit}>
					<input
						type="text"
						name="movieTitle"
						value={movieInput}
						onChange={e => this.setState({ movieInput: e.target.value })}
						autoComplete="off"
						placeholder="e.g. The Godfather"
					/>
					<Button className="add-movie-btn" type="submit" bsStyle="success" bsSize="small" disabled={disabled}>
						{buttonText}
					</Button>
					<div className="movie-packages">
						Need inspiration? Try these packages:
						<button type="button" onClick={e => this.handleSelectMovieThemeSet(e, superheroes)}>Super heroes</button>
						<button type="button" onClick={e => this.handleSelectMovieThemeSet(e, princesses)}>Princesses</button>
						<button type="button" onClick={e => this.handleSelectMovieThemeSet(e, dicaprio)}>DiCaprio</button>
					</div>
				</form>
			</div>
		);
	}
}

MovieSearchFrom.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	handleMovieSet: PropTypes.func.isRequired,
	disabled: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
};

export default MovieSearchFrom;
