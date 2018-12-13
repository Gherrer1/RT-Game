import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import GameSetupMulti from '../GameSetupMulti';

describe('<GameSetupMulti />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
	let container;
	beforeEach(() => {
		renderResult = render(
			<StaticRouter context={{}}>
				<GameSetupMulti />
			</StaticRouter>
		);
		({ getByText, container } = renderResult);
	});

	it('should have a player-name input', () => {
		const playerNameInput = container.querySelector('.player-name-input');
		expect(playerNameInput).not.toBeNull();
	});
	it('should disable `Invite Friends` and `Join Room` if user hasnt input his name', () => {
		const playerNameInput = container.querySelector('.player-name-input');
		expect(playerNameInput.value).toBe('');
		const inviteFriendsBtn = getByText(/Invite Friends/);
		const joinRoomBtn = getByText(/Join Room/);
		expect(inviteFriendsBtn).toBeDisabled();
		expect(joinRoomBtn).toBeDisabled();
		fireEvent.change(playerNameInput, {
			target: {
				value: 'l',
			},
		});
		expect(inviteFriendsBtn).not.toBeDisabled();
		expect(joinRoomBtn).not.toBeDisabled();
	});
});
