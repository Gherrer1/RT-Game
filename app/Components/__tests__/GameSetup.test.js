import React from 'react';
import { render, cleanup, fireEvent, waitForElement } from 'react-testing-library';
import 'jest-dom/extend-expect';
import GameSetup from '../GameSetup';
import io from '../../../sockets/socketSetup';

describe('<GameSetup />', () => {
	afterEach(cleanup);

	describe('socket interaction', () => {
		beforeEach(() => {
			const port = 8000;
			io.listen(port);
			console.log(`listening on port ${port}`);
		});
		afterEach((done) => {
			io.close(done);
		});

		it('should show room ID when user clicks "Invite Friends" button', async () => {
			const renderResult = render(<GameSetup />);
			const { getByText, container } = renderResult;
			fireEvent.click(getByText('Invite Friends'));

			const roomIdElement = await waitForElement(() => getByText(/can join with this room id/), {
				timeout: 500,
			});
			expect(container).toContainElement(roomIdElement);
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
	});
});
