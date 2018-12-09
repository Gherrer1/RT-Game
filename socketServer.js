/* eslint-disable no-console */
const io = require('socket.io')();

const CREATE_ROOM = 'create room';
const JOIN_ROOM = 'join room';
const ROOM_ID = 'room id';
const NEW_PLAYER = 'new player';
const SUCCESSFUL_JOIN = 'successful join';
const FAILED_JOIN = 'failed join';

io.on('connection', (socket) => {
	console.log('connection!');

	socket.on(CREATE_ROOM, () => {
		console.log(`creating room ${socket.id}`);
		socket.join(socket.id);
		socket.emit(ROOM_ID, socket.id);
	});

	socket.on(JOIN_ROOM, (roomID) => {
		// check if this room exists first
		if (!io.sockets.adapter.rooms[roomID]) {
			return socket.emit(FAILED_JOIN);
		}

		socket.join(roomID);
		console.log(`${socket.id} is joining room ${roomID}`);
		socket.emit(SUCCESSFUL_JOIN, roomID);
		io.in(roomID).emit(NEW_PLAYER, socket.id);
	});

	socket.on('disconnect', () => {
		console.log(`disconnected ${socket.id}`);
	});

	console.log('socket rooms:', io.sockets.adapter.rooms);
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
