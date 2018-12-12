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
	let stub = jest.fn();
	beforeEach(() => {
		renderResult = render(
			<StaticRouter context={{}}>
				<MovieSearchForm
					addMovieToGame={stub}
					didFireSearch={stub}
					searchDidEnd={stub}
					handleMovieSet={stub}
				/>
			</StaticRouter>
		);
		({ getByText, container } = renderResult);
	});

	it('should show <AmbiguousSearchResults /> if I search for "Toy Storey"', async () => {
		const input = container.querySelector('form > input');
		fireEvent.change(input, {
			target: {
				value: 'Toy Storey',
			},
		});
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => getByText(/No exact match found/), {
			timeout: 2000,
		});
	});
});
