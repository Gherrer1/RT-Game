import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import GameSetup from '../GameSetup';
import io from '../../../sockets/socketSetup';

describe('<GameSetup />', () => {
	afterEach(cleanup);

	describe('socket interaction', () => {
		let renderResult;
		let getByText;
		let container;

		beforeEach(() => {
			const port = 8000;
			io.listen(port);
			console.log(`listening on port ${port}`);
			// render component
			renderResult = render(<GameSetup />);
			({ getByText, container } = renderResult);
		});
		afterEach((done) => {
			io.close(done);
		});

		it.skip('should show room ID when user clicks "Invite Friends" button', async () => {
			fireEvent.click(getByText('Invite Friends'));
			const roomIdElement = await waitForElement(() => getByText(/can join with this room id/), {
				timeout: 500,
			});
			expect(container).toContainElement(roomIdElement);
		});
		it.skip('should remove movie when it received "did remove movie" socket message', async () => {
			fireEvent.click(getByText(/Super heroes/));
			await waitForElement(() => getByText(/Deadpool/), { timeout: 500 });
		});
	});

	describe('ui', () => {
		let renderResult;
		let getByText;
		let queryByText;
		let container;
		beforeEach(() => {
			renderResult = render(<GameSetup />);
			({ getByText, queryByText, container } = renderResult);
		});
		it('should show a navbar', () => {
			const navBar = container.querySelector('.site-title');
			expect(navBar).toBeTruthy();
		});
		it.skip('should show "Invite Friends" button', () => {
			const inviteFriendsBtnNode = getByText('Invite Friends');
			expect(container).toContainElement(inviteFriendsBtnNode);
		});
		it.skip('should show "Join Room" button', () => {
			const joinRoomBtnNode = getByText('Join Room');
			expect(container).toContainElement(joinRoomBtnNode);
		});
		it('should show Deadpool when user clicks superheroes starter pack', async () => {
			expect(queryByText(/Deadpool/)).toBeNull();
			fireEvent.click(getByText(/Super heroes/));

			const deadpoolElement = await waitForElement(() => getByText(/Deadpool/), {
				timeout: 500,
			});
			expect(container).toContainElement(deadpoolElement);
		});
	});
});
