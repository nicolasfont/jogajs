var express = require('express'),
    server = express.createServer(),
    port = process.env.PORT || process.env.C9_PORT || 9090;

server.get('/', function(req, res) {
    res.send('Hello World');
});

server.use(express.static(__dirname));

server.listen(port);
console.log('Listening on port ' + port);