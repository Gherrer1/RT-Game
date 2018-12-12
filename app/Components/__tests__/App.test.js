import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from '../App';

describe('<App />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
	let queryByText;
	let container;
	beforeEach(() => {
		renderResult = render(
			<MemoryRouter>
				<App />
			</MemoryRouter>
		);
		({ getByText, queryByText, container } = renderResult);
	});

	describe('navigation', () => {
		it('should start at <GameMode /> route', () => {
			const selectGameModeNode = container.querySelector('.select-game-mode');
			expect(selectGameModeNode).toBeTruthy();

			const splitScreenMode = getByText(/Split Screen/);
			const multiplayerMode = getByText(/Multiplayer/);
			expect(splitScreenMode).toBeTruthy();
			expect(multiplayerMode).toBeTruthy();
		});
		it('should show Create Game or Join Game model if user clicks Multiplayer', async () => {
			expect(queryByText('Create Room')).toBeNull();
			expect(queryByText('Join Room')).toBeNull();
			fireEvent.click(getByText(/Multiplayer/));
			await waitForElement(() => container.querySelector('.multiplayer-options'), {
				timeout: 200,
			});
			getByText('Create Room');
			getByText('Join Room');
		});
		it('should navigate from <GameMode /> -> <GameSetup /> and Invite Friends button should be absent when user clicks Split Screen', async () => {
			expect(container.querySelector('.game-setup')).toBeNull();
			fireEvent.click(getByText(/Split Screen/));
			await waitForElement(() => container.querySelector('.game-setup'), {
				timeout: 500,
			});
			const inviteFriendsNode = queryByText('Invite Friends');
			const joinRoomNode = queryByText('Join Room');
			expect(inviteFriendsNode).toBeNull();
			expect(joinRoomNode).toBeNull();
		});
		it('should take you back home when user clicks the Rotten Tomatoes Game navbar', async () => {
			fireEvent.click(getByText(/Split Screen/));
			await waitForElement(() => container.querySelector('.game-setup'), {
				timeout: 100,
			});
			expect(queryByText(/Split Screen/)).toBeNull();
			fireEvent.click(getByText('The Rotten Tomatoes Game'));
			await waitForElement(() => getByText(/Split Screen/), {
				timeout: 100,
			});
		});
	});
});
