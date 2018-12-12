import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import GameSetup from '../GameSetup';
import io from '../../../sockets/socketSetup';

const preconfiguredRouterLocation = {
	pathname: '/play',
	state: {
		movies: [{
			image: 'https://resizing.flixster.com/A31QtxjB2dTh0__osCvH6XfREHo=/fit-in/80x80/v1.bTsxMTE2NzgzNTtqOzE3OTQ5OzEyMDA7ODAwOzEyMDA',
			meterScore: 87,
			name: 'The Dark Knight Rises',
			year: 2012,
		}],
		players: [{
			id: 1,
			name: 'Lonzo',
			score: 0,
		}],
	},
};

describe('<GameSetup />', () => {
	afterEach(cleanup);

	describe('socket interaction', () => {
		let renderResult;
		let getByText;
		let container;

		beforeEach(() => {
			const port = 8000;
			io.listen(port);
			console.log(`listening on port ${port}`);
			// render component
			renderResult = render(<GameSetup />);
			({ getByText, container } = renderResult);
		});
		afterEach((done) => {
			io.close(done);
		});

		it.skip('should show room ID when user clicks "Invite Friends" button', async () => {
			fireEvent.click(getByText('Invite Friends'));
			const roomIdElement = await waitForElement(() => getByText(/can join with this room id/), {
				timeout: 500,
			});
			expect(container).toContainElement(roomIdElement);
		});
		it.skip('should remove movie when it received "did remove movie" socket message', async () => {
			fireEvent.click(getByText(/Super heroes/));
			await waitForElement(() => getByText(/Deadpool/), { timeout: 500 });
		});
	});

	describe('ui', () => {
		let renderResult;
		let getByText;
		let queryByText;
		let container;
		beforeEach(() => {
			renderResult = render(
				<MemoryRouter>
					<GameSetup />
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

			const deadpoolElement = await waitForElement(() => getByText(/Deadpool/), {
				timeout: 500,
			});
			expect(container).toContainElement(deadpoolElement);
		});

		it('should always show Step 1, Step 2, and Step 3', () => {
			renderResult = render(
				<StaticRouter location={preconfiguredRouterLocation}>
					<GameSetup />
				</StaticRouter>
			);
			({ getByText } = renderResult);
			getByText(/Step 1/);
			getByText(/Step 2/);
			getByText(/Step 3/);
		});
	});
});
