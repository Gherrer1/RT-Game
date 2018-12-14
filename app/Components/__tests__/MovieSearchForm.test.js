import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import MovieSearchForm from '../MovieSearchForm';

describe('<MovieSearchForm />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
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
		({ getByText, container } = renderResult);

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
		const searchBtn = getByText(/Searching for movie\.\.\./);
		expect(searchBtn).toBeDisabled();
		// wait for element to not be disabled
		await waitForElement(() => expect(getByText('Add Movie')).not.toBeDisabled() || true, {
			timeout: 2000,
		});
	});
	it('should clear `ambiguous search result` message when user selects movie from recommendations', () => {
		throw new Error('unimp');
	});
	it('should  clear `ambiguous search result` OR `no movie found` message when new search fires', () => {
		throw new Error('unimp');
	});
});
