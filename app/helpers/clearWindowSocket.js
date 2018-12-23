export default function clearWindowSocket(_window) {
	if (_window.socket) {
		const keys = Object.keys(_window.socket._callbacks);
		const eventsToUnsubscribe = keys.filter(key => key !== '$connecting' && key !== '$connect').map(key => key.substr(1));
		eventsToUnsubscribe.forEach(key => _window.socket.off(key));
		window.socket.close();
		delete window.socket;
		console.log('unsubscribed from sockets and closed socket');
	}
}
