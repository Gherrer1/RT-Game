import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter } from 'react-router-dom';
import openSocket from 'socket.io-client';
import 'jest-dom/extend-expect';
import App from './App';
import socketServer from '../../sockets/socketSetup';
import clearWindowSocket from '../helpers/clearWindowSocket';
import fakeMovies from '../fakeMovieData';

const nameUserTypes = {
	target: {
		value: 'l',
	},
};

function simulateTypePlayersName(container) {
	fireEvent.change(container.querySelector('.player-name-input'), nameUserTypes);
}
async function simulateCreateRoom(renderResult) {
	const { container, getByText } = renderResult;
	simulateTypePlayersName(container);
	fireEvent.click(getByText('Invite Friends'));
	await waitForElement(() => container.querySelector('.movie-search-form'), {
		timeout: 2000,
	});
}
async function simulateAddMovie(renderResult) {
	const { container, getByText } = renderResult;
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
}

describe('<GameSetupMulti />', () => {
	let renderResult;
	let getByText;
	let queryByText;
	let container;
	let socketClient;
	beforeEach(() => {
		renderResult = render(
			<MemoryRouter initialEntries={['/setup-multi']}>
				<App />
			</MemoryRouter>
		);
		({ getByText, queryByText, container } = renderResult);

		socketServer.listen(8000);
		socketClient = openSocket('http://localhost:8000');
	});

	afterEach((done) => {
		fetch.resetMocks();
		if (window.socket) {
			clearWindowSocket(window);
		}
		cleanup();
		if (socketClient.connected) {
			socketClient.close();
		}
		socketServer.close(done);
	}, 12500);

	describe('ui', () => {
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
	});

	describe('create room', () => {
		it('shouldnt have window.socket yet', () => {
			expect(window.socket).toBeUndefined();
		});
		// bug - test solution
		it('should disable `Invite Friends` and `Join Room` buttons when user clicks `Invite Friends` - so they dont click again while socket server processes', async () => {
			simulateTypePlayersName(container);
			expect(getByText('Invite Friends')).not.toBeDisabled();
			expect(getByText('Join Room')).not.toBeDisabled();
			fireEvent.click(getByText('Invite Friends'));
			expect(getByText('Invite Friends')).toBeDisabled();
			expect(getByText('Join Room')).toBeDisabled();
		});
		it('should disable `Invite Friends` and `Join Room` buttons when user clicks `Join Room` - so they dont click again while socket server processes', async () => {
			simulateTypePlayersName(container);
			expect(getByText('Invite Friends')).not.toBeDisabled();
			expect(getByText('Join Room')).not.toBeDisabled();
			fireEvent.click(getByText('Join Room'));
			expect(getByText('Invite Friends')).toBeDisabled();
			expect(getByText('Join Room')).toBeDisabled();
		});
		it.skip('should reenable `Invite Friends` and `Join Room` buttons if joined room doesnt exist and user isnt coming from invite link', async () => {
			throw new Error('unimplemented');
		});
		it.skip('should redirect to home if room doesnt exist and user is coming from invite link', async () => {
			throw new Error('unimplemented');
		});
		it.skip('should redirect home if game is in progress', async () => {
			throw new Error('unimplemented');
		});
		it('should show a link to invite users when user clicks `Invite Friends`', async () => {
			expect(container.querySelector('.invite-link')).toBeNull();
			await simulateCreateRoom(renderResult);
			await waitForElement(() => container.querySelector('.invite-link'), {
				timeout: 1000,
			});
		});
		it('should still not have window.socket', () => {
			// Sanity check test - my tests were messing with the global state within the test runner
			// and this was to verify that - its not actually related to testing my application but I'm
			// leaving this in here because it's a nice lesson about react-testing-library: when
			// it renders your components, if your components alter global window object, that
			// state will be reflected in your jest test runner
			expect(window.socket).toBeUndefined();
		});
		it('should not show a .player-name-input once user creates room', async () => {
			expect(container.querySelector('.player-name-input')).toBeDefined();
			await simulateCreateRoom(renderResult);
			await waitForElement(() => expect(container.querySelector('.player-name-input')).toBeNull() || true, {
				timeout: 1000,
			});
		});
		it('should show a <PlayersList /> once user is in a room', async () => {
			expect(container.querySelector('.players-list')).toBeNull();
			await simulateCreateRoom(renderResult);
			await waitForElement(() => expect(container.querySelector('.players-list')).not.toBeNull() || true, {
				timeout: 1000,
			});
		});
		it('should not show <MovieSearchForm /> or Start Game Button until user has clicked `Invite Friends` or `Join Room`', async () => {
			const MovieSearchForm = container.querySelector('.movie-search-form');
			expect(MovieSearchForm).toBeNull();
			await simulateCreateRoom(renderResult);
			await waitForElement(() => container.querySelector('.movie-search-form'), {
				timeout: 1000,
			});
		});
	});

	describe('while in room', () => {
		let roomID;
		beforeEach(async (done) => {
			await simulateCreateRoom(renderResult);
			const inviteLink = container.querySelector('.invite-link > a').getAttribute('href');
			const split = inviteLink.split('/');
			roomID = split[split.length - 1];
			done();
		});
		it('should add movie to screen after a successful search', async () => {
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
		it('should add movie to screen after another player adds movie', async () => {
			expect(container.querySelector('.movies-list > div')).toBeNull();
			socketClient.emit('add movie', roomID, fakeMovies[0]);
			await waitForElement(() => container.querySelector('.movies-list > div'), { timeout: 1000 });
			getByText(/Thor/);
		});
		it('should add 5 movies to screen after clicking Movie starter pack', async () => {
			getByText(/Super heroes/);
			expect(queryByText(/Deadpool/)).toBeNull();
			fireEvent.click(getByText(/Super heroes/));
			await waitForElement(() => getByText(/Deadpool/), {
				timeout: 500,
			});
			expect(container.querySelectorAll('.movies-list > div').length).toBe(5);
		});
		// bug - test this
		it('should add 5 movies to screen after other player adds Movie starter pack', async () => {
			getByText(/Super heroes/);
			expect(container.querySelectorAll('.movie-list > div').length).toBe(0);
			socketClient.emit('add movie starter pack', roomID, fakeMovies);
			await waitForElement(() => getByText(/Stuart Little/) && getByText(/Iron Man/), { timeout: 1500 });
		});
		it('should transition to <GameGridMulti /> without redirecting back to home', async () => {
			socketClient.emit('join room', roomID, 'Bertholdt');
			await waitForElement(() => getByText('Bertholdt'), { timeout: 1000 });
			await simulateAddMovie(renderResult);

			expect(container.querySelector('.start-game > button[disabled]')).toBeNull();
			fireEvent.click(getByText('Start Game'));
			await waitForElement(() => getByText('How scoring works:'), { timeout: 1000 });
			await new Promise(resolve => setTimeout(resolve, 500));
			await waitForElement(() => getByText('How scoring works:'), { timeout: 1000 });
		}, 10000);
	});
});
