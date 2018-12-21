/* eslint-disable prefer-promise-reject-errors */
import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import puppeteer from 'puppeteer';
import { preconfiguredRouterLocation } from '../Components/constants';
import io from '../../sockets/socketSetup';
import App from '../Components/App';

const delay = time => new Promise(resolve => setTimeout(resolve, time));
const fakeResponse = JSON.stringify({
	message: 'Movie found!',
	movie: {
		name: 'Saw II',
		year: 2005,
		image: 'https://resizing.flixster.com/rC26YbjB9YcaitFie1N-_TczA-s=/fit-in/80x80/v1.bTsxMTE3NzU3OTtqOzE3OTk0OzEyMDA7ODAwOzEyMDA',
		meterScore: 36,
	},
});
function goToOurSite(page, url) {
	return page.goto(url);
}
function typePlayerName(page, name) {
	return page.type('.player-name-input', name);
}
function clickCreateOrJoinRoom(page) {
	return page.click('div > button');
}
async function getInviteLink(page) {
	await page.waitForSelector('.invite-link > a');
	return page.$eval('.invite-link > a', el => el.href);
}
async function addMovieToGame(page) {
	await page.type('.movie-search-form > form > input', 'Saw II');
	await page.click('.movie-search-form > form > button');
	return page.waitForSelector('.movies-list > div', {
		timeout: 2000,
	});
}
function clickStartGameBtn(page) {
	return page.click('.start-game > button');
}
async function startGameWith2Players(page1, page2) {
	fetch.mockResponseOnce(fakeResponse);

	await typePlayerName(page1, 'lonzo');
	await clickCreateOrJoinRoom(page1);
	const inviteLink = await getInviteLink(page1);
	await goToOurSite(page2, inviteLink);
	await typePlayerName(page2, 'kuzma');
	await clickCreateOrJoinRoom(page2);
	await addMovieToGame(page1);
	await page2.waitForSelector('.movies-list > div', {
		timeout: 2000,
	});
	await clickStartGameBtn(page1);
	return inviteLink;
}
function createDialogExpectation(page, expectedDialog) {
	return new Promise((resolve, reject) => {
		setTimeout(() => reject('never got a dialog'), 2000);

		page.on('dialog', (dialog) => {
			if (dialog.message() !== expectedDialog) {
				return reject(`dialog should have been ${expectedDialog} but instead was ${dialog.message()}`);
			}
			return resolve();
		});
	});
}

describe('end to end tests', () => {
	describe('Multiplayer', () => {
		let browser;
		let page1;
		afterEach(async (done) => {
			await browser.close();
			io.close(done);
		});
		beforeEach(async (done) => {
			fetch.resetMocks();
			const options = {};
			// const options = { headless: false, slowMo: 200 };
			browser = await puppeteer.launch(options);
			page1 = await browser.newPage();
			await page1.goto('http://localhost:8080');
			await page1.click('a[href$="/setup-multi"');

			const port = 8000;
			io.listen(port);
			await delay(500);
			done();
		});
		it('should not allow `Start Game` until 2+ players and 1+ movies are added to game', async () => {
			fetch.mockResponseOnce(fakeResponse);

			await typePlayerName(page1, 'lonzo');
			await clickCreateOrJoinRoom(page1);
			await page1.waitForSelector('.players-list');
			let playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(1);
			const inviteURL = await getInviteLink(page1);
			const page2 = await browser.newPage();
			await goToOurSite(page2, inviteURL);
			await typePlayerName(page2, 'kuzma');
			await clickCreateOrJoinRoom(page2);

			await page1.waitForSelector('.players-list > div:nth-child(2)');
			playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(2);

			const playerNames2 = await page2.$$('.players-list > div');
			expect(playerNames2.length).toBe(2);

			let startGameBtnIsDisabled1 = await page1.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(true);
			let startGameBtnIsDisabled2 = await page2.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(true);

			await addMovieToGame(page1);

			startGameBtnIsDisabled1 = await page1.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(false);
			startGameBtnIsDisabled2 = await page2.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(false);
		}, 30000);
		it('should not let user join room if game is ongoing', async () => {
			const page2 = await browser.newPage();
			const inviteLink = await startGameWith2Players(page1, page2);

			const page3 = await browser.newPage();
			await goToOurSite(page3, inviteLink);
			await typePlayerName(page3, 'kentavious');
			const dialogExpectation = createDialogExpectation(page3, 'The game has already started. Room not joined.');
			await clickCreateOrJoinRoom(page3);
			return dialogExpectation;
		}, 10000);
		it('should not let user join room if room is full', async () => {
			const pages = await Promise.all((new Array(4).fill(0).map(() => browser.newPage())));

			await typePlayerName(page1, 'lonzo');
			await clickCreateOrJoinRoom(page1);
			const inviteURL = await getInviteLink(page1);

			await Promise.all(pages.map(page => goToOurSite(page, inviteURL)));
			await Promise.all(pages.map((page, index) => typePlayerName(page, `Player ${index}`)));
			await Promise.all(pages.map(page => clickCreateOrJoinRoom(page)));

			const page5 = pages[pages.length - 1];
			await page5.waitForSelector('.players-list > div:nth-child(5)', {
				timeout: 2000,
			});

			const page6 = await browser.newPage();
			await goToOurSite(page6, inviteURL);

			const dialogExpectation = createDialogExpectation(page6, 'That room is already full.');
			await page6.type('.player-name-input', 'player 100');
			await page6.click('div > button');
			return dialogExpectation;
		}, 20000);
		it.skip('should redirect to home if you navigate straight to /play/:roomID without coming from /setup-multi', () => {
			throw new Error('unimplemented');
		});
	});

	describe('split screen navigation', () => {
		afterEach(cleanup);

		let renderResult;
		let getByText;
		let container;
		let queryByText;
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
		it('should show "Invite Friends" and "Join Room" buttons on <GameSetup /> when user clicks on Multiplayer', async () => {
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
		it('should redirect to home if user navigates to /play without any players or movies state', async () => {
			renderResult = render(
				<MemoryRouter
					initialEntries={['/play']}
				>
					<App />
				</MemoryRouter>
			);
			({ getByText, queryByText, container } = renderResult);
			await waitForElement(() => getByText(/Split Screen/) && getByText(/Multiplayer/), {
				timeout: 250,
			});
		});
		it('<GameGrid /> should have a navbar', () => {
			renderResult = render(
				<StaticRouter location={preconfiguredRouterLocation} context={{}}>
					<App />
				</StaticRouter>
			);
			({ container } = renderResult);
			const navBar = container.querySelector('.site-title');
			expect(navBar).toBeDefined();
		});
	});
});

// puppeteer reference:
// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageevalselector-pagefunction-args
