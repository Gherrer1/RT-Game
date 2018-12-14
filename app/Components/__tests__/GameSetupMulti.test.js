import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { StaticRouter } from 'react-router-dom';
import 'jest-dom/extend-expect';
import GameSetupMulti from '../GameSetupMulti';
import io from '../../../sockets/socketSetup';

const nameUserTypes = {
	target: {
		value: 'l',
	},
};

function simulateTypeUserName(container) {
	fireEvent.change(container.querySelector('.player-name-input'), nameUserTypes);
}

describe('<GameSetupMulti />', () => {
	afterEach((done) => {
		cleanup();
		io.close(done);
	});

	let renderResult;
	let getByText;
	let container;
	beforeEach(() => {
		fetch.resetMocks();

		renderResult = render(
			<StaticRouter context={{}}>
				<GameSetupMulti />
			</StaticRouter>
		);
		({ getByText, container } = renderResult);

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
		fireEvent.change(playerNameInput, nameUserTypes);
		expect(inviteFriendsBtn).not.toBeDisabled();
		expect(joinRoomBtn).not.toBeDisabled();
	});
	it('should show a link to invite users when user clicks `Invite Friends`', async () => {
		expect(container.querySelector('.invite-link')).toBeNull();
		fireEvent.change(container.querySelector('.player-name-input'), nameUserTypes);
		fireEvent.click(getByText(/Invite Friends/));
		await waitForElement(() => container.querySelector('.invite-link'), {
			timeout: 1000,
		});
	});
	it('should not show <MovieSearchForm /> or Start Game Button until user has clicked `Invite Friends` or `Join Room`', async () => {
		const MovieSearchForm = container.querySelector('.movie-search-form');
		expect(MovieSearchForm).toBeNull();
		fireEvent.change(container.querySelector('.player-name-input'), nameUserTypes);
		fireEvent.click(getByText(/Invite Friends/));
		await waitForElement(() => container.querySelector('.movie-search-form'), {
			timeout: 1000,
		});
	});
	it('should add movie to screen after a successful search', async () => {
		simulateTypeUserName(container);
		fireEvent.click(getByText(/Invite Friends/));
		await waitForElement(() => container.querySelector('.movie-search-form'), {
			timeout: 1000,
		});

		// make sure there arent any movies to begin with
		let movieDivs = container.querySelectorAll('.movies-list > div');
		expect(movieDivs.length).toBe(0);
		fetch.mockResponseOnce(JSON.stringify({
			message: 'Movie found!',
			movie: {
				name: 'Saw II',
				year: 2005,
				image: 'https://resizing.flixster.com/rC26YbjB9YcaitFie1N-_TczA-s=/fit-in/80x80/v1.bTsxMTE3NzU3OTtqOzE3OTk0OzEyMDA7ODAwOzEyMDA',
				meterScore: 36,
			},
		}));

		fireEvent.change(container.querySelector('.movie-search-form > form > input'), {
			target: {
				value: 'Literally a fake movie search',
			},
		});
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => container.querySelector('.movies-list > div'));
		movieDivs = container.querySelectorAll('.movies-list > div');
		expect(movieDivs.length).toBe(1);
	});
});
