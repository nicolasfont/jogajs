var express = require('express'),
    server = express.createServer();

server.use(express.static(__dirname));

server.listen(process.env.PORT || process.env.C9_PORT);
console.log('Listening on port ' + (process.env.PORT || process.env.C9_PORT));