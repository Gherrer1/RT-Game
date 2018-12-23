import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter } from 'react-router-dom';
import openSocket from 'socket.io-client';
import 'jest-dom/extend-expect';
import App from './App';
import socketServer from '../../sockets/socketSetup';

const fakeFetchResponse = JSON.stringify({
	message: 'Movie found!',
	movie: {
		name: 'Saw II',
		year: 2005,
		image: 'https://resizing.flixster.com/rC26YbjB9YcaitFie1N-_TczA-s=/fit-in/80x80/v1.bTsxMTE3NzU3OTtqOzE3OTk0OzEyMDA7ODAwOzEyMDA',
		meterScore: 36,
	},
});
const fakeMovieInputText = {
	target: { value: 'Literally a fake movie search ' },
};

describe('<GameGridMulti />', () => {
	let renderResult;
	let getByText;
	let queryByText;
	let container;
	let socketClient;
	let roomID;
	beforeEach(async (done) => {
		renderResult = render(
			<MemoryRouter initialEntries={['/setup-multi']}>
				<App />
			</MemoryRouter>
		);
		({ getByText, queryByText, container } = renderResult);

		// start up socket server and client
		socketServer.listen(8000);
		socketClient = openSocket('http://localhost:8000');

		// quickly setup game
		fireEvent.change(container.querySelector('.player-name-input'), {
			target: { value: 'lonzo' },
		});
		fireEvent.click(getByText('Invite Friends'));
		await waitForElement(() => container.querySelector('.movie-search-form'), { timeout: 1000 });
		fetch.mockResponseOnce(fakeFetchResponse);
		fireEvent.change(container.querySelector('.movie-search-form > form > input'), fakeMovieInputText);
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => container.querySelector('.movies-list > div'));
		const inviteLink = container.querySelector('.invite-link > a').getAttribute('href');
		const splitByDash = inviteLink.split('/');
		roomID = splitByDash[splitByDash.length - 1];
		socketClient.emit('join room', roomID, 'Bertoldt');
		await waitForElement(() => getByText('Bertoldt'), { timeout: 1000 });
		fireEvent.click(getByText('Start Game'));
		await waitForElement(() => getByText('How scoring works:'));
		done();
	}, 10000);

	afterEach((done) => {
		fetch.resetMocks();
		if (window.socket) {
			delete window.socket;
		}
		cleanup();
		if (socketClient.connected) {
			socketClient.close();
		}
		socketServer.close(done);
	}, 10000);

	it('should redirect to / if user navigates to this route not from <GameSetupMulti />', async () => {
		cleanup();
		renderResult = render(
			<MemoryRouter initialEntries={['/play/123']}>
				<App />
			</MemoryRouter>
		);
		({ getByText } = renderResult);
		await waitForElement(() => getByText('Multiplayer'), { timeout: 1000 });
	}, 10000);
	it('should be notified if another player leaves', async () => {
		getByText('Bertoldt');
		socketClient.close();
		await waitForElement(() => expect(queryByText('Bertoldt')).toBeNull() || true, {
			timeout: 1000,
		});
	});
	it.skip('should be notified if another player leaves by navigating home', async () => {

	});
	it.skip('should be notified if another player leaves by going back (to /setup-multi) (which should then redirect to home)', () => {

	});
	it('should be notified when a player has submitted her guess for the round', async () => {
		expect(queryByText('Ready!')).toBeNull();
		socketClient.emit('player submitted guess', roomID, '79');
		await waitForElement(() => getByText('Ready!'), { timeout: 1000 });
	}, 10000);
	it('should disable `Im Ready!` button after user submits a valid guess', async () => {
		expect(getByText("I'm Ready!")).toBeDisabled();
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '33' } });
		expect(getByText("I'm Ready!")).not.toBeDisabled();
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => expect(getByText("I'm Ready!")).toBeDisabled() || true, { timeout: 1000 });
	});
	it('should show the actual movie rating once all players have submitted their answers', async () => {
		expect(queryByText('36')).toBeNull();
		socketClient.emit('player submitted guess', roomID, '50');
		await waitForElement(() => getByText('Ready!'), { timeout: 3000 });
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '56' } });
		expect(container.querySelector('.guess-input:enabled').value).toBe('56');
		expect(getByText("I'm Ready!")).not.toBeDisabled();
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Actual score:/), { timeout: 2000 });
	}, 10000);
	it.skip('should update each players scores after all players have submitted their answers', () => {
		throw new Error('uimplememnted');
	});
	it.skip('should move on to next round after all players have submitted their answers', () => {
		throw new Error('unimplemented');
	});
	it.skip('should show winner after users go through all the movies (rounds)', () => {
		throw new Error('unimplemented');
	});
});
