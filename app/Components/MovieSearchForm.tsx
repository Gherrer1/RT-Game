import * as React from 'react';
import { Alert, Button } from 'react-bootstrap/lib';
import AmbiguousSearchResults from './AmbiguousSearchResults';
import dicaprio from '../starterPacks/dicaprio';
import superheroes from '../starterPacks/superheroes';
import princesses from '../starterPacks/princesses';
import getMovieData from '../api';
import { IMovie } from '../../sharedTypes';

const { MOVIE_FOUND, COULD_NOT_FIND_MOVIE_NAMED, RECOMMENDATIONS, MULTIPLE_MOVIES_FOUND } = require('../../lambda/messages');

interface Props {
	addMovieToGame: (movie: IMovie) => undefined;
	handleMovieSet: (movies: IMovie[]) => void;
	didFireSearch: () => void;
	searchDidEnd: () => void;
	disableSearch: boolean;
}

interface State {
	movieInput: string;
	errorMessage: string | null;
	warningMessage: string | null;
	searchedFor: string | null;
	loading: boolean;
	recommendations: IMovie[] | null;
}

class MovieSearchFrom extends React.Component<Props, State> {
	static defaultProps = {
		didFireSearch: () => {},
		searchDidEnd: () => {},
	}

	constructor(props: Props) {
		super(props);

		this.state = {
			movieInput: '',
			loading: false,
			errorMessage: null,
			warningMessage: null,
			searchedFor: null,
			recommendations: null,
		};

		this.searchForMovie = this.searchForMovie.bind(this);
		this.handleSelectMovieStarterPack = this.handleSelectMovieStarterPack.bind(this);
	}

	async searchForMovie(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const { movieInput: movieTitle } = this.state;
		const { didFireSearch, searchDidEnd, addMovieToGame } = this.props;
		didFireSearch();
		this.setState({ loading: true, errorMessage: null, warningMessage: null });
		const movieData = await getMovieData(movieTitle);
		searchDidEnd();
		this.setState({ loading: false, movieInput: '' });
		// console.log(movieData);

		if (movieData.message === MOVIE_FOUND) {
			return addMovieToGame(movieData.movie);
		}

		if (movieData.message.startsWith(COULD_NOT_FIND_MOVIE_NAMED)) {
			return this.setState({
				errorMessage: movieData.message,
				searchedFor: movieData.searchedFor,
				warningMessage: null,
				recommendations: null,
			});
		}

		if (movieData.message === RECOMMENDATIONS) {
			return this.setState({
				errorMessage: null,
				warningMessage: RECOMMENDATIONS,
				searchedFor: movieData.searchedFor,
				recommendations: movieData.recommendations,
			});
		}

		if (movieData.message === MULTIPLE_MOVIES_FOUND) {
			return this.setState({
				errorMessage: null,
				warningMessage: MULTIPLE_MOVIES_FOUND,
				searchedFor: movieData.searchedFor,
				recommendations: movieData.movies,
			});
		}
	}

	handleSelectMovieStarterPack(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, moviePackage: IMovie[]) {
		e.preventDefault();
		const { handleMovieSet } = this.props;
		handleMovieSet(moviePackage);
	}

	render() {
		const { movieInput, errorMessage, warningMessage, searchedFor,
			loading, recommendations } = this.state;
		const { addMovieToGame, disableSearch } = this.props;

		let buttonText;
		if (loading) {
			buttonText = 'Searching for movie...';
		} else if (disableSearch) {
			buttonText = 'Max movies reached';
		} else {
			buttonText = 'Add Movie';
		}

		return (
			<div className="movie-search-form">
				<form onSubmit={this.searchForMovie}>
					<input
						type="text"
						name="movieTitle"
						value={movieInput}
						onChange={e => this.setState({ movieInput: e.target.value })}
						autoComplete="off"
						placeholder="e.g. The Godfather"
					/>
					<Button className="add-movie-btn" type="submit" bsStyle="success" bsSize="small" disabled={disableSearch || loading}>
						{buttonText}
					</Button>
					<div className="movie-packages">
						Need inspiration? Try these packages:
						<button type="button" disabled={loading} onClick={e => this.handleSelectMovieStarterPack(e, superheroes)}>Super heroes</button>
						<button type="button" disabled={loading} onClick={e => this.handleSelectMovieStarterPack(e, princesses)}>Princesses</button>
						<button type="button" disabled={loading} onClick={e => this.handleSelectMovieStarterPack(e, dicaprio)}>DiCaprio</button>
					</div>
				</form>
				{errorMessage && (
					<Alert bsStyle="danger">
						{COULD_NOT_FIND_MOVIE_NAMED} <strong>{searchedFor}</strong>
					</Alert>
				)}
				{warningMessage && (
					<AmbiguousSearchResults
						message={warningMessage}
						searchedFor={searchedFor as string}
						recommendations={recommendations as IMovie[]}
						handleClickMovie={movie => addMovieToGame(movie) || this.setState({
							warningMessage: null,
						})}
					/>
				)}
			</div>
		);
	}
}

export default MovieSearchFrom;
