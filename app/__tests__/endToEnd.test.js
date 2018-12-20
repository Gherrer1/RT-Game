import puppeteer from 'puppeteer';
import io from '../../sockets/socketSetup';

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
			await delay(1000);
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
});
