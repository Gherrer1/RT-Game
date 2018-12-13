import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
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
});
