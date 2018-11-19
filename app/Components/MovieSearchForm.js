import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/lib/Button';

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

		const { handleSubmit } = this.props;
		const { movieInput } = this.state;
		handleSubmit(movieInput);
		this.setState({
			movieInput: '',
		});
	}

	render() {
		const { movieInput } = this.state;
		const { disabled, loading } = this.props;
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type="text"
					name="movieTitle"
					value={movieInput}
					onChange={e => this.setState({ movieInput: e.target.value })}
					autoComplete="off"
				/>
				<Button className="add-movie-btn" type="submit" bsStyle="success" disabled={disabled}>
					{loading ? 'Searching for movie...' : 'Add Movie'}
				</Button>
			</form>
		);
	}
}

MovieSearchFrom.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	disabled: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
};

export default MovieSearchFrom;
