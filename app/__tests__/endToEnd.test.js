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
			// to click on something
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

			// to type something
			await page1.type('.player-name-input', 'lonzo');
			await page1.click('div > button');
			// to query the page for elements
			await page1.waitForSelector('.players-list');
			let playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(1);
			// open another tab using invite link
			// to get some info about an element
			const inviteURL = await page1.$eval('.invite-link > a', el => el.href);
			const page2 = await browser.newPage();
			await page2.goto(inviteURL);
			await page2.type('.player-name-input', 'kuzma');
			await page2.click('div > button');
			// wait for playerNames1 to be length 2

			await page1.waitForSelector('.players-list > div:nth-child(2)');
			playerNames1 = await page1.$$('.players-list > div');
			expect(playerNames1.length).toBe(2);

			const playerNames2 = await page2.$$('.players-list > div');
			expect(playerNames2.length).toBe(2);

			// expect `Start Game` button to still be disabled
			let startGameBtnIsDisabled1 = await page1.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(true);
			let startGameBtnIsDisabled2 = await page2.$('.start-game > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(true);

			// add a movie, then expect `Start Game` button to no longer be disabled
			await page1.type('.movie-search-form > form > input', 'Saw II');
			await page1.click('.movie-search-form > form > button');
			await page1.waitForSelector('.movies-list > div', {
				timeout: 2000,
			});

			// now expect button to no longer be disabled
			startGameBtnIsDisabled1 = await page1.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled1).toBe(false);
			startGameBtnIsDisabled2 = await page2.$('.link-to-game-grid > button[disabled]') !== null;
			expect(startGameBtnIsDisabled2).toBe(false);
		}, 30000);
	});

	describe('navigation', () => {
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

		describe('multiplayer navigation', () => {
			beforeEach(async () => {
				const port = 8000;
				io.listen(port);

				renderResult = render(
					<MemoryRouter>
						<App />
					</MemoryRouter>
				);
				({ getByText, queryByText, container } = renderResult);

				fireEvent.click(getByText('Multiplayer'));
				fireEvent.change(container.querySelector('.player-name-input'), {
					target: {
						value: 'Lonzo',
					},
				});
				fireEvent.click(getByText('Invite Friends'));
			});
			afterEach(done => io.close(done));

			it.skip('should display `Multiplayer Game` if in a multiplayer <GameGrid />', () => {
				throw new Error('unimplemented');
			});
			it.skip('should not display `Multiplayer Game` if not in a multiplayer <GameGrid />', () => {
				throw new Error('unimplemeneted');
			});
		});
	});
});

// puppeteer reference:
// https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageevalselector-pagefunction-args
