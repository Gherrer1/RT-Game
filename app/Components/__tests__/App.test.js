import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from '../App';
import io from '../../../sockets/socketSetup';

describe('<App />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
	let queryByText;
	let container;

	describe('navigation', () => {
		describe('non-socket navigation', () => {
			beforeEach(() => {
				renderResult = render(
					<MemoryRouter>
						<App />
					</MemoryRouter>
				);
				({ getByText, queryByText, container } = renderResult);
			});

			it('should start at <GameMode /> route', () => {
				const selectGameModeNode = container.querySelector('.select-game-mode');
				expect(selectGameModeNode).toBeTruthy();

				const splitScreenMode = getByText(/Split Screen/);
				const multiplayerMode = getByText(/Multiplayer/);
				expect(splitScreenMode).toBeTruthy();
				expect(multiplayerMode).toBeTruthy();
			});
			it('should not show Invite Friends button on <GameSetup /> when user clicks on Split Screen', async () => {
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
			it('should show Invite Friends button on <GameSetup /> when user clicks on Multiplayer', async () => {
				expect(container.querySelector('.game-setup')).toBeNull();
				fireEvent.click(getByText(/Multiplayer/));
				await waitForElement(() => container.querySelector('.game-setup'), {
					timeout: 500,
				});
				getByText('Invite Friends');
				getByText('Join Room');
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
			it('(Split Screen) should take you from <GameSetup /> -> <GameGrid /> when user clicks Start Game', async () => {
				fireEvent.click(getByText(/Split Screen/));
				await waitForElement(() => container.querySelector('.game-setup'), {
					timeout: 100,
				});

				const { getByPlaceholderText } = renderResult;
				fireEvent.click(getByText('Super heroes'));
				fireEvent.change(getByPlaceholderText('Player 1'));
				const startGameButton = getByText('Start Game!');
				await waitForElement(() => {
					expect(startGameButton).not.toBeDisabled();
					return true;
				}, { timeout: 200 });
				fireEvent.click(startGameButton);
				await waitForElement(() => container.querySelector('.game-grid'), {
					timeout: 200,
				});
			});
			it.skip('should redirect to home if user navigates to /play without any players or movies state', () => {
				throw new Error('unimplemented');
			});
		});

		describe('socket navigation', () => {
			beforeEach(async () => {
				const port = 8000;
				io.listen(port);

				renderResult = render(
					<MemoryRouter>
						<App />
					</MemoryRouter>
				);
				({ getByText, queryByText, container } = renderResult);
				fireEvent.click(getByText(/Multiplayer/));
				await waitForElement(() => container.querySelector('.multiplayer-options'), {
					timeout: 200,
				});
			});
			afterEach(done => io.close(done));
		});
	});
});
