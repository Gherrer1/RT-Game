import React from 'react';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import puppeteer from 'puppeteer';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App from '../App';
import io from '../../../sockets/socketSetup';
import { preconfiguredRouterLocation } from '../constants';

describe('<App />', () => {
	afterEach(cleanup);

	let renderResult;
	let getByText;
	let getByPlaceholderText;
	let queryByText;
	let container;

	describe('navigation', () => {
		describe('non-socket navigation', () => {
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

		describe('socket navigation', () => {
			beforeEach(async () => {
				const port = 8000;
				io.listen(port);

				renderResult = render(
					<MemoryRouter>
						<App />
					</MemoryRouter>
				);
				({ getByText, queryByText, getByPlaceholderText, container } = renderResult);

				fireEvent.click(getByText('Multiplayer'));
				fireEvent.change(container.querySelector('.player-name-input'), {
					target: {
						value: 'Lonzo',
					},
				});
				fireEvent.click(getByText('Invite Friends'));
			});
			afterEach(done => io.close(done));

			it('should now allow navigation from <GameSetupMulti /> to <GameGrid /> unless at least 2 players and 1 movie added to game', async () => {
				function delay(time) {
					return new Promise(function(resolve, reject) {
						setTimeout(resolve, time);
					});
				}

				// const options = {};
				const options = { headless: false, slowMo: 200 };
				// puppeteer
				const browser = await puppeteer.launch(options);
				let page;
				page = await browser.newPage();
				await page.goto('http://localhost:8080');
				// to click on something
				await page.click('a[href$="/setup-multi"]');
				// to type something
				await page.type('.player-name-input', 'lonzo');
				await page.click('div > button');
				// to query the page for elements
				const elements = await page.$$('.players-list > div');
				// open another tab using invite link
				// to get some info about an element
				const inviteURL = await page.$eval('.invite-link > a', el => el.href);
				const page2 = await browser.newPage();
				await page2.goto(inviteURL);
				// sleep
				await delay(2000);
				await browser.close();
				// expect(inviteLink).toEqual({});
				expect(inviteURL).toBe('haha');
				expect(elements.length).toBe(2);

				throw new Error('still implementing');
			}, 60000);
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