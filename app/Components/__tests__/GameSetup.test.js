import React from 'react';
import { render, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import GameSetup from '../GameSetup';

describe('<GameSetup />', () => {
	afterEach(cleanup);

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
