const io = require('./socketSetup');

const port = 8000;
io.listen(port);
console.log(`listening on port ${port}`);