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
			fetch.mockResponseOnce(JSON.stringify({
				message: 'Movie found!',
				movie: {
					name: 'Saw II',
					year: 2005,
					image: 'https://resizing.flixster.com/rC26YbjB9YcaitFie1N-_TczA-s=/fit-in/80x80/v1.bTsxMTE3NzU3OTtqOzE3OTk0OzEyMDA7ODAwOzEyMDA',
					meterScore: 36,
				},
			}));

			await page1.type('.player-name-input', 'lonzo');
			await page1.click('div > button');
			await page1.waitForSelector('.players-list');
			let playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(1);
			const inviteURL = await page1.$eval('.invite-link > a', el => el.href);
			const page2 = await browser.newPage();
			await page2.goto(inviteURL);
			await page2.type('.player-name-input', 'kuzma');
			await page2.click('div > button');

			await page1.waitForSelector('.players-list > div:nth-child(2)');
			playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(2);

			const playerNames2 = await page2.$$('.players-list > div');
			expect(playerNames2.length).toBe(2);

			let startGameBtnIsDisabled1 = await page1.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(true);
			let startGameBtnIsDisabled2 = await page2.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(true);

			await page1.type('.movie-search-form > form > input', 'Saw II');
			await page1.click('.movie-search-form > form > button');
			await page1.waitForSelector('.movies-list > div', {
				timeout: 2000,
			});

			startGameBtnIsDisabled1 = await page1.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(false);
			startGameBtnIsDisabled2 = await page2.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(false);
		}, 30000);
		it('should not let user join room if room is full', async () => {
			const pages = await Promise.all((new Array(4).fill(0).map(() => browser.newPage())));

			await page1.type('.player-name-input', 'lonzo');
			await page1.click('div > button');
			await page1.waitForSelector('.invite-link > a');
			const inviteURL = await page1.$eval('.invite-link > a', el => el.href);

			await Promise.all(pages.map(page => page.goto(inviteURL)));
			await Promise.all(pages.map((page, index) => page.type('.player-name-input', `player ${index}`)));
			await Promise.all(pages.map(page => page.click('div > button')));

			const page5 = pages[pages.length - 1];
			await page5.waitForSelector('.players-list > div:nth-child(5)', {
				timeout: 2000,
			});

			const page6 = await browser.newPage();
			await page6.goto(inviteURL);

			const dialogPromise = new Promise((resolve, reject) => {
				setTimeout(() => reject('new got a dialog'), 4000);
				page6.on('dialog', (dialog) => {
					const expectedDialog = 'That room is already full.';
					if (dialog.message() !== expectedDialog) {
						return reject(`dialog should have been '${expectedDialog}' but instead was '${dialog.message()}'`);
					}
					return resolve();
				});
			});
			await page6.type('.player-name-input', 'player 100');
			await page6.click('div > button');
			return dialogPromise;
		}, 20000);
		it.skip('should not let user join room if game is ongoing', () => {
			throw new Error('unimplemented');
		});
		it.skip('should not let user join room if room doesnt exist', () => {
			throw new Error('unimplemented');
		});
	});

	describe('split screen navigation', () => {
		afterEach(cleanup);

		let renderResult;
		let getByText;
		let container;
		let queryByText;
		describe('split screen navigation', () => {
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
});

// puppeteer reference:
// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageevalselector-pagefunction-args
