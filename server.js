var express = require('express'),
    server = express.createServer();

server.get('/', function(req, res) {
    res.send('Hello World');
});

server.use(express.static(__dirname));

server.listen(process.env.PORT || process.env.C9_PORT);
console.log('Listening on port ' + (process.env.PORT || process.env.C9_PORT));