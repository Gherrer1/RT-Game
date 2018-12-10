/* eslint-disable no-console */
const io = require('socket.io')();

const CREATE_ROOM = 'create room';
const JOIN_ROOM = 'join room';
const ROOM_ID = 'room id';
const NEW_PLAYER = 'new player';
const SUCCESSFUL_JOIN = 'successful join';
const FAILED_JOIN = 'failed join';
const REMOVE_MOVIE = 'remove movie';
const DID_REMOVE_MOVIE = 'did remove movie';

io.on('connection', (socket) => {
	console.log('connection!');

	socket.on(CREATE_ROOM, (gameState) => {
		socket.join(socket.id);
		socket.emit(ROOM_ID, socket.id);
		console.log(`created room ${socket.id}`);
		const room = io.sockets.adapter.rooms[socket.id];
		room.gameState = gameState;

		console.log('Room initialized with game state:', room.gameState);
	});

	socket.on(JOIN_ROOM, (roomID) => {
		// if theres no room, fail and disconnect
		const room = io.sockets.adapter.rooms[roomID];
		if (!room) {
			return socket.emit(FAILED_JOIN);
		}

		socket.join(roomID);
		console.log(`${socket.id} is joining room ${roomID}`);
		const { gameState } = io.sockets.adapter.rooms[roomID];
		socket.emit(SUCCESSFUL_JOIN, roomID, gameState);
		io.in(roomID).emit(NEW_PLAYER, socket.id);
	});

	socket.on(REMOVE_MOVIE, (roomID, movieID) => {
		const room = io.sockets.adapter.rooms[roomID];
		if (!room) {
			return;
		}

		const newMoviesState = room.gameState.movies.filter(movie => movie.image !== movieID);
		room.gameState = {
			...room.gameState,
			movies: newMoviesState,
		};
		io.in(roomID).emit(DID_REMOVE_MOVIE, room.gameState.movies);
	});

	socket.on('disconnect', () => {
		console.log(`disconnected ${socket.id}`);
		console.log('All rooms:', io.sockets.adapter.rooms);
	});
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);
