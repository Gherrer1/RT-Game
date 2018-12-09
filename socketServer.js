const io = require('socket.io')();

io.on('connection', (client) => {
	console.log('connection!');

	let jsInterval;

	client.on('subscribeToTimer', (interval) => {
		console.log(`client is subscribing to timer with interval ${interval}`);
		jsInterval = setInterval(() => {
			client.emit('timer', new Date());
			console.log(`still emitting lol for client ${client.id}`);
		}, interval);
	});

	client.on('disconnect', (val) => {
		console.log('disconnected', val);
		clearInterval(jsInterval);
	});
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);