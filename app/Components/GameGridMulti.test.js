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
	});

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
	});

	it('should redirect to / if user navigates to this route not from <GameSetupMulti />', async () => {
		cleanup();
		renderResult = render(
			<MemoryRouter initialEntries={['/play/123']}>
				<App />
			</MemoryRouter>
		);
		({ getByText } = renderResult);
		await waitForElement(() => getByText('Multiplayer'), { timeout: 1000 });
	});
	it('should be notified if another player leaves', async () => {
		getByText('Bertoldt');
		socketClient.close();
		await waitForElement(() => expect(queryByText('Bertoldt')).toBeNull() || true, {
			timeout: 1000,
		});
	});
	it('should be notified when a player has submitted her guess for the round', async () => {
		expect(queryByText('Ready!')).toBeNull();
		socketClient.emit('player submitted guess', roomID, '79');
		await waitForElement(() => getByText('Ready!'), { timeout: 1000 });
	});
	it('should show the actual movie rating once all players have submitted their answers', async () => {
		const expectedRating = 36;
		expect(queryByText('36')).toBeNull();
		socketClient.emit('player submitted guess', roomID, '50');
		// simulate UI typeing 70 into input, clicking ready

		await waitForElement(getByText('36'), { timeout: 1000 });
	});
});
