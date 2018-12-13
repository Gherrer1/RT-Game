import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import GameSetupMulti from '../GameSetupMulti';
import io from '../../../sockets/socketSetup';

describe('<GameSetupMulti />', () => {
	afterEach((done) => {
		cleanup();
		io.close(done);
	});

	let renderResult;
	let getByText;
	let queryByText;
	let container;
	beforeEach(() => {
		renderResult = render(
			<StaticRouter context={{}}>
				<GameSetupMulti />
			</StaticRouter>
		);
		({ getByText, queryByText, container } = renderResult);

		const port = 8000;
		io.listen(port);
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
	it('should show a link to invite users when user clicks `Invite Friends`', async () => {
		fireEvent.change(container.querySelector('.player-name-input'), {
			target: {
				value: 'l',
			},
		});
		fireEvent.click(getByText(/Invite Friends/));
		await waitForElement(() => container.querySelector('.invite-link'), {
			timeout: 1000,
		});
	});
	it('should not show <MovieSearchForm /> or Start Game Button until user has clicked `Invite Friends` or `Join Room`', async () => {
		const MovieSearchForm = container.querySelector('.movie-search-form');
		expect(MovieSearchForm).toBeNull();
		fireEvent.change(container.querySelector('.player-name-input'), {
			target: {
				value: 'l',
			},
		});
		fireEvent.click(getByText(/Invite Friends/));
		await waitForElement(() => container.querySelector('.movie-search-form'), {
			timeout: 1000,
		});
	});
});
