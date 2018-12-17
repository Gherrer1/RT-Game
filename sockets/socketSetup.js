/* eslint-disable no-console */
const io = require('socket.io')();
const Player = require('./Player');

const CREATE_ROOM = 'create room';
const JOIN_ROOM = 'join room';
const ROOM_ID = 'room id';
const NEW_PLAYER = 'new player';
const SUCCESSFUL_JOIN = 'successful join';
const FAILED_JOIN = 'failed join';
const REMOVE_MOVIE = 'remove movie';
const DID_REMOVE_MOVIE = 'did remove movie';
const ADD_MOVIE_STARTER_PACK = 'add movie starter pack';
const DID_ADD_MOVIE_PACK = 'did add movie pack';

const ADD_MOVIE = 'add movie';
const ADDED_MOVIE = 'added movie';

function getRoom(id) {
	return io.sockets.adapter.rooms[id];
}

io.on('connection', (socket) => {
	console.log('connection!');
	console.log('all rooms:', Object.keys(io.sockets.adapter.rooms));

	socket.on(CREATE_ROOM, (name) => {
		socket.join(socket.id);
		console.log(`created room ${socket.id}`);
		const room = getRoom(socket.id);
		room.gameState = {
			movies: [],
			players: [new Player(socket.id, name)], // TODO: generate random color to represent player
		};
		socket.emit(ROOM_ID, socket.id, room.gameState);
	});

	socket.on(JOIN_ROOM, (roomID, playerName) => {
		// if theres no room, fail and disconnect
		const room = getRoom(roomID);
		if (!room) {
			return socket.emit(FAILED_JOIN);
		}
		// if room already has 5 players, fail and disconnect
		if (room.gameState.players.length >= 5) {
			return socket.emit(FAILED_JOIN);
		}

		socket.join(roomID);
		console.log(`${socket.id} is joining room ${roomID}`);

		const newGameState = {
			...room.gameState,
			players: [...room.gameState.players, new Player(socket.id, playerName)],
		};
		room.gameState = newGameState;
		socket.emit(SUCCESSFUL_JOIN, roomID, room.gameState);
		socket.to(roomID).emit(NEW_PLAYER, room.gameState.players);
	});

	socket.on(ADD_MOVIE, (roomID, movie) => {
		const room = getRoom(roomID);
		if (!room) {
			return;
		}

		if (room.gameState.movies.length >= 5) {
			// TODO: send too many movies message
			return;
		}

		const newMoviesState = room.gameState.movies.concat([ movie ]);
		room.gameState = {
			...room.gameState,
			movies: newMoviesState,
		};
		io.in(roomID).emit(ADDED_MOVIE, room.gameState.movies);
	});

	socket.on(REMOVE_MOVIE, (roomID, movie) => {
		const room = getRoom(roomID);
		if (!room) {
			return;
		}

		const newMoviesState = room.gameState.movies.filter(_movie => _movie.image !== movie.image);
		room.gameState = {
			...room.gameState,
			movies: newMoviesState,
		};
		io.in(roomID).emit(DID_REMOVE_MOVIE, room.gameState.movies);
	});

	socket.on(ADD_MOVIE_STARTER_PACK, (roomID, movies) => {
		const room = getRoom(roomID);
		if (!room) {
			return;
		}

		room.gameState = {
			...room.gameState,
			movies,
		};
		io.in(roomID).emit(DID_ADD_MOVIE_PACK, room.gameState.movies);
	});

	socket.on('disconnect', () => {
		console.log(`disconnected ${socket.id}`);
		console.log('All rooms:', io.sockets.adapter.rooms);
	});
});

module.exports = io;
