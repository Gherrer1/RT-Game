const io = require('./socketSetup');

const PORT = process.env.PORT || 8000;
io.listen(PORT);
console.log(`listening on port ${PORT}`);
