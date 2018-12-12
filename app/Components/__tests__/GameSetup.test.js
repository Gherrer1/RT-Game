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

		it('should show room ID when user clicks "Invite Friends" button', async () => {
			fireEvent.click(getByText('Invite Friends'));
			const roomIdElement = await waitForElement(() => getByText(/can join with this room id/), {
				timeout: 500,
			});
			expect(container).toContainElement(roomIdElement);
		});
		it('should remove movie when it received "did remove movie" socket message', async () => {
			fireEvent.click(getByText(/Super heroes/));
			await waitForElement(() => getByText(/Deadpool/), { timeout: 500 });

		});
	});

	describe('ui', () => {
		it('should show "Invite Friends" button', () => {
			const renderResult = render(<GameSetup />);
			const { getByText, container } = renderResult;
			const inviteFriendsBtnNode = getByText('Invite Friends');
			expect(container).toContainElement(inviteFriendsBtnNode);
		});
		it('should show "Join Room" button', () => {
			const renderResult = render(<GameSetup />);
			const { container, getByText } = renderResult;
			const joinRoomBtnNode = getByText('Join Room');
			expect(container).toContainElement(joinRoomBtnNode);
		});
		it('should show Deadpool when user clicks superheroes starter pack', async () => {
			const renderResult = render(<GameSetup />);
			const { getByText, container, queryByText } = renderResult;
			expect(queryByText(/Deadpool/)).toBeNull();
			fireEvent.click(getByText(/Super heroes/));

			const deadpoolElement = await waitForElement(() => getByText(/Deadpool/), {
				timeout: 500,
			});
			expect(container).toContainElement(deadpoolElement);
		});
	});
});
