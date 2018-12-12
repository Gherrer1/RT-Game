import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';
import dicaprio from '../starterPacks/dicaprio';
import superheroes from '../starterPacks/superheroes';
import princesses from '../starterPacks/princesses';

class MovieSearchFrom extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			movieInput: '',
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelectMovieStarterPack = this.handleSelectMovieStarterPack.bind(this);
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

	handleSelectMovieStarterPack(e, moviePackage) {
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
						<button type="button" onClick={e => this.handleSelectMovieStarterPack(e, superheroes)}>Super heroes</button>
						<button type="button" onClick={e => this.handleSelectMovieStarterPack(e, princesses)}>Princesses</button>
						<button type="button" onClick={e => this.handleSelectMovieStarterPack(e, dicaprio)}>DiCaprio</button>
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
