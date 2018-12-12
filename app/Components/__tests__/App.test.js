import React from 'react';
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
		renderResult = render(<App />);
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
		it('should navigate from <GameMode /> -> <GameSetup /> and Invite Friends button should be absent when user clicks Split Screen', async () => {
			fireEvent.click(getByText(/Split Screen/));
			await waitForElement(() => container.querySelector('.game-setup'), {
				timeout: 500,
			});
			const inviteFriendsNode = queryByText('Invite Friends');
			const joinRoomNode = queryByText('Join Room');
			expect(inviteFriendsNode).toBeNull();
			expect(joinRoomNode).toBeNull();
		});
		it('should show Create Game or Join Game model if user clicks Multiplayer', () => {
			throw new Error('unimplemented');
		});
	});
});
