/* eslint-disable no-console */
const io = require('socket.io')();
const Player = require('./Player');
const { CREATE_ROOM, JOIN_ROOM, ROOM_ID, NEW_PLAYER, SUCCESSFUL_JOIN, FAILED_JOIN, REMOVE_MOVIE,
	DID_REMOVE_MOVIE, ADD_MOVIE_STARTER_PACK, DID_ADD_MOVIE_PACK, ADD_MOVIE, DID_ADD_MOVIE,
	ADD_MOVIE_ERROR, ROOM_FULL, PLAYER_LEFT, START_GAME, DID_START_GAME, GAME_IN_PROGRESS
} = require('./socketEventNames');

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
			gameHasStarted: false,
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
			return socket.emit(ROOM_FULL);
		}

		if (room.gameState.gameHasStarted) {
			return socket.emit(GAME_IN_PROGRESS);
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

	socket.on(START_GAME, (roomID) => {
		const room = getRoom(roomID);
		if (!room) { return; }

		if (room.gameState.movies.length < 1 || room.gameState.players.length < 2) { return; }
		// TODO: check if all players are ready
		room.gameState = {
			...room.gameState,
			gameHasStarted: true,
		};
		io.in(roomID).emit(DID_START_GAME);
	});

	socket.on(ADD_MOVIE, (roomID, movie) => {
		const room = getRoom(roomID);
		if (!room) {
			return;
		}

		if (room.gameState.movies.length >= 5) {
			socket.emit(ADD_MOVIE_ERROR, 'Max movies reached');
			return;
		}

		const newMoviesState = room.gameState.movies.concat([ movie ]);
		room.gameState = {
			...room.gameState,
			movies: newMoviesState,
		};
		io.in(roomID).emit(DID_ADD_MOVIE, room.gameState.movies);
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

	socket.on('disconnecting', () => {
		// remove player from room
		const playersRooms = Object.keys(socket.rooms);
		for (let i = 0; i < playersRooms.length; i++) {
			const roomID = playersRooms[i];
			const room = getRoom(roomID);
			if (room.gameState) {
				const newPlayersState = room.gameState.players.filter(p => p.id !== socket.id);
				room.gameState = {
					...room.gameState,
					players: newPlayersState,
				};
				io.in(playersRooms[i]).emit(PLAYER_LEFT, room.gameState.players);
			}
		}
	});

	socket.on('disconnect', () => {
		console.log(`disconnected ${socket.id}`);
		console.log('All rooms:', io.sockets.adapter.rooms);
	});
});

module.exports = io;
