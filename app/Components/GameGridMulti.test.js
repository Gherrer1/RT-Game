import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import { MemoryRouter } from 'react-router-dom';
import openSocket from 'socket.io-client';
import 'jest-dom/extend-expect';
import App from './App';
import socketServer from '../../sockets/socketSetup';
import clearWindowSocket from '../helpers/clearWindowSocket';

const fakeFetchResponse1 = JSON.stringify({
	message: 'Movie found!',
	movie: {
		name: 'Saw II',
		year: 2005,
		image: 'https://resizing.flixster.com/rC26YbjB9YcaitFie1N-_TczA-s=/fit-in/80x80/v1.bTsxMTE3NzU3OTtqOzE3OTk0OzEyMDA7ODAwOzEyMDA',
		meterScore: 36,
	},
});
const fakeFetchResponse2 = JSON.stringify({
	message: 'Movie found!',
	movie: {
		image: 'https://resizing.flixster.com/3ZFWkpQboU-qeXF_5wFPpntkRKo=/fit-in/80x80/v1.bTsxMjQxNTA2NTtqOzE3ODczOzEyMDA7Mzc4OzU2MA',
		meterScore: 92,
		name: 'Spider-Man: Homecoming',
		year: 2017,
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
		socketServer.attach(8000, {
			pingInterval: 1000,
			pingTimeout: 1000,
		});
		socketClient = openSocket('http://localhost:8000');

		// quickly setup game
		fireEvent.change(container.querySelector('.player-name-input'), {
			target: { value: 'lonzo' },
		});
		fireEvent.click(getByText('Invite Friends'));
		await waitForElement(() => container.querySelector('.movie-search-form'), { timeout: 1000 });
		fetch.mockResponseOnce(fakeFetchResponse1);
		fireEvent.change(container.querySelector('.movie-search-form > form > input'), fakeMovieInputText);
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => container.querySelector('.movies-list > div'));
		fetch.resetMocks();
		fetch.mockResponseOnce(fakeFetchResponse2);
		fireEvent.change(container.querySelector('.movie-search-form > form > input'), fakeMovieInputText);
		fireEvent.click(getByText('Add Movie'));
		await waitForElement(() => container.querySelector('.movies-list > div:nth-child(2)'), { timeout: 500 });
		const inviteLink = container.querySelector('.invite-link > a').getAttribute('href');
		const splitByDash = inviteLink.split('/');
		roomID = splitByDash[splitByDash.length - 1];
		socketClient.emit('join room', roomID, 'Bertoldt');
		await waitForElement(() => getByText('Bertoldt'), { timeout: 1000 });
		fireEvent.click(getByText('Start Game'));
		await waitForElement(() => getByText('How scoring works:'));
		done();
	}, 11000);

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
	}, 12000);

	it('should redirect to / if user navigates to this route not from <GameSetupMulti />', async () => {
		cleanup();
		renderResult = render(
			<MemoryRouter initialEntries={['/play/123']}>
				<App />
			</MemoryRouter>
		);
		({ getByText } = renderResult);
		await waitForElement(() => getByText('Multiplayer'), { timeout: 1000 });
	}, 9000);
	it('should be notified if another player leaves', async () => {
		getByText('Bertoldt');
		socketClient.close();
		await waitForElement(() => expect(queryByText('Bertoldt')).toBeNull() || true, {
			timeout: 1000,
		});
	});
	it('should be notified if another player leaves by navigating home', (done) => {
		socketClient.on('player left', () => done());
		fireEvent.click(getByText('The Rotten Tomatoes Game'));
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
	it('should update each players scores after all players have submitted their answers', async () => {
		const playerScoreNodes = container.querySelectorAll('.player-score');
		playerScoreNodes.forEach(node => expect(node.textContent).toBe('0'));
		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '40' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => {
			const _playerScoreNodes = container.querySelectorAll('.player-score');
			expect(_playerScoreNodes[0].textContent).toBe('4');
			expect(_playerScoreNodes[1].textContent).toBe('14');
			return true;
		}, { timeout: 1000 });
	});
	it('should move on to next round after all players have submitted their answers', async () => {
		let firstRoundMovie = container.querySelector('.header-movie:not(.dormant)');
		let secondRoundMovie = container.querySelector('.header-movie.dormant');
		expect(firstRoundMovie.textContent).toMatch(/Saw II/);
		expect(secondRoundMovie.textContent).toMatch(/Spider-Man/);

		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '40' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Actual score:/), { timeout: 2000 });

		firstRoundMovie = container.querySelector('.header-movie.dormant');
		secondRoundMovie = container.querySelector('.header-movie:not(.dormant)');
		expect(firstRoundMovie.textContent).toMatch(/Saw II/);
		expect(secondRoundMovie.textContent).toMatch(/Spider-Man/);
	});
	// was bug - now tested
	it('should undisable the next round\'s `Im Ready` button when user has their guess typed in ready to submit', async () => {
		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '40' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Actual score:/), { timeout: 500 });

		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '39' } });
		expect(getByText("I'm Ready!")).not.toBeDisabled();
	});
	it('should show winner after users go through all the movies (rounds)', async () => {
		expect(queryByText(/Winner/)).toBeNull();
		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '40' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Actual score:/), { timeout: 500 });
		socketClient.emit('player submitted guess', roomID, '59');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '41' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => expect(container.querySelectorAll('.actual-score').length).toBe(2) || true, { timeout: 1000 });
		getByText(/Winner/);
	});
	it('should show WINNERS if multiple players tie', async () => {
		expect(queryByText(/Winners/)).toBeNull();
		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '50' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Actual score:/), { timeout: 500 });
		socketClient.emit('player submitted guess', roomID, '50');
		fireEvent.change(container.querySelector('.guess-input:enabled'), { target: { value: '50' } });
		fireEvent.click(getByText("I'm Ready!"));
		await waitForElement(() => getByText(/Winners/));
	});
});
