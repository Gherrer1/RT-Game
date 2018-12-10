export default function createInviteURL(roomID) {
	const host = window.location.hostname;

	return `${host}${host === 'localhost' ? ':8080' : '.com'}/?r=${roomID}`;
}
