export default function createInviteURL(roomID) {
	if (window.location.hostname === 'localhost') {
		return `http://localhost:8080/setup-multi/${roomID}`;
	}
	return `https://${window.location.hostname}/setup-multi/${roomID}`;
}
