import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import GameSetup from './GameSetup';
import { preconfiguredRouterLocation } from './constants';

describe('<GameSetup />', () => {
	afterEach(cleanup);

	describe('ui', () => {
		let renderResult;
		let getByText;
		let queryByText;
		let container;
		beforeEach(() => {
			renderResult = render(
				<MemoryRouter>
					<GameSetup history={{ push: jest.fn() }} />
				</MemoryRouter>
			);
			({ getByText, queryByText, container } = renderResult);
		});
		it('should show a navbar', () => {
			const navBar = container.querySelector('.site-title');
			expect(navBar).toBeTruthy();
		});
		it('should show Deadpool when user clicks superheroes starter pack', async () => {
			expect(queryByText(/Deadpool/)).toBeNull();
			fireEvent.click(getByText(/Super heroes/));

			await waitForElement(() => getByText(/Deadpool/), {
				timeout: 500,
			});
		});

		it('should always show Step 1, Step 2, and Step 3', () => {
			renderResult = render(
				<StaticRouter location={preconfiguredRouterLocation} context={{}}>
					<GameSetup history={{ push: jest.fn() }} />
				</StaticRouter>
			);
			({ getByText } = renderResult);
			getByText(/Step 1/);
			getByText(/Step 2/);
			getByText(/Step 3/);
		});
	});
});
