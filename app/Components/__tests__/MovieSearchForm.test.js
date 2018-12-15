import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import MovieSearchForm from '../MovieSearchForm';

function sendSearch(fetchMock, movieTitle, renderResult) {
	const { container, getByText } = renderResult;
	fetch.mockResponseOnce(fetchMock);

	const input = container.querySelector('form > input');
	fireEvent.change(input, {
		target: {
			value: movieTitle,
		},
	});
	fireEvent.click(getByText('Add Movie'));
}

function sendAmbiguousSearch(renderResult) {
	const fetchMock = JSON.stringify({
		message: 'No exact match found. Were you looking for one of these?',
		searchedFor: 'toy storey',
		recommendations: [{
			name: 'Toy Story 3',
			year: 2010,
			image: 'https://resizing.flixster.com/yGhib4t6hawSSBlV4b6OKShni9o=/fit-in/80x80/v1.bTsxMTIxOTYyNDtqOzE3OTk0OzEyMDA7MjI1MDszMDAw',
			meterScore: 98,
		}],
	});
	sendSearch(fetchMock, 'Toy Story', renderResult);
}

function sendErrorSearch(renderResult) {
	const fetchMock = JSON.stringify({
		message: 'Could not find a movie with the name thor 5',
		searchedFor: 'thor 5',
	});
	sendSearch(fetchMock, 'thor 5', renderResult);
}

describe.skip('<MovieSearchForm />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
	let queryByText;
	let container;
	const stub = jest.fn();
	beforeEach(() => {
		renderResult = render(
			<StaticRouter context={{}}>
				<MovieSearchForm
					addMovieToGame={stub}
					didFireSearch={stub}
					searchDidEnd={stub}
					handleMovieSet={stub}
					disableSearch={false}
				/>
			</StaticRouter>
		);
		({ getByText, queryByText, container } = renderResult);

		fetch.resetMocks();
	});

	it('should show <AmbiguousSearchResults /> if I json response indicates No exact match found"', async () => {
		fetch.mockResponseOnce(JSON.stringify({
			message: 'No exact match found. Were you looking for one of these?',
			searchedFor: 'toy storey',
			recommendations: [{
				name: 'Toy Story 3',
				year: 2010,
				image: 'https://resizing.flixster.com/yGhib4t6hawSSBlV4b6OKShni9o=/fit-in/80x80/v1.bTsxMTIxOTYyNDtqOzE3OTk0OzEyMDA7MjI1MDszMDAw',
				meterScore: 98,
			}],
		}));

		const input = container.querySelector('form > input');
		fireEvent.change(input, {
			target: {
				value: 'Toy Storey',
			},
		});
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => getByText(/No exact match found/), {
			timeout: 500,
		});
	});
	it('should show No Movie Found message if json response indicates No movie found', async () => {
		fetch.mockResponseOnce(JSON.stringify({
			message: 'Could not find a movie with the name thor 5',
			searchedFor: 'thor 5',
		}));

		const input = container.querySelector('form > input');
		fireEvent.change(input, {
			target: {
				value: 'thor 5',
			},
		});
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => getByText(/Could not find a movie with the name/), {
			timeout: 500,
		});
	});
	it('should be disabled if max movies are already added to the game', () => {
		renderResult = render(
			<StaticRouter context={{}}>
				<MovieSearchForm
					addMovieToGame={stub}
					didFireSearch={stub}
					searchDidEnd={stub}
					handleMovieSet={stub}
					disableSearch
				/>
			</StaticRouter>
		);
		({ getByText } = renderResult);

		const searchButton = getByText(/Max movies reached/);
		expect(searchButton).toBeDisabled();
	});
	it('should disable search button while searching', async () => {
		sendAmbiguousSearch(renderResult);
		const searchBtn = getByText(/Searching for movie\.\.\./);
		expect(searchBtn).toBeDisabled();
		// wait for element to not be disabled
		await waitForElement(() => expect(getByText('Add Movie')).not.toBeDisabled() || true, {
			timeout: 2000,
		});
	});
	it('should disable starter pack buttons while searching', async () => {
		sendAmbiguousSearch(renderResult);
		const movieStarterPackBtns = container.querySelectorAll('.movie-packages > button');
		movieStarterPackBtns.forEach(button => expect(button).toBeDisabled());
		await waitForElement(() => expect(container.querySelector('.movie-packages > button')).not.toBeDisabled() || true, {
			timeout: 500,
		});
	});
	it('should clear `ambiguous search result` message when user selects movie from recommendations', async () => {
		sendAmbiguousSearch(renderResult);
		await waitForElement(() => getByText(/No exact match found/), {
			timeout: 500,
		});
		fireEvent.click(container.querySelector('.recommended-title'));
		expect(queryByText(/No exact match found/)).toBeNull();
	});
	it('should  clear `no movie found` message when new search fires', async () => {
		sendErrorSearch(renderResult);
		await waitForElement(() => getByText(/Could not find a movie with the name/), {
			timeout: 500,
		});
		sendAmbiguousSearch(renderResult);
		expect(queryByText(/Could not find a movie with the name/)).toBeNull();
	});
	it('should clear `ambiguous search result` message when new search fires', async () => {
		sendAmbiguousSearch(renderResult);
		await waitForElement(() => getByText(/No exact match found/), {
			timeout: 500,
		});
		sendAmbiguousSearch(renderResult);
		expect(queryByText(/No exact match found/)).toBeNull();
	});
});
