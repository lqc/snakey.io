var static = require('node-static');
var http = require('http'); 
var snakesModule = require('./snake.js');
var gameModule = require('./game.js');
var socketio = require('socket.io');

var app, game;

var fileServer = new static.Server('./');

game = new gameModule.Game({
    speed: 10,
    timeout: 100,
    apples: 200,
    size: 100
});

//Start Game
game.start();

//Http handler, it will server all static files
function handler (req, res) {
    req.addListener('end', function () {
        fileServer.serve(req, res, function (e, r) {
            if (e && (e.status == 404)) {
                fileServer.serveFile('client/client.html', 200, {}, req, res);
            }
        });
    }).resume();
}

var onSocketConnection = function (socket) {
    socket.emit('config', {
        size: game.options.size
    });
    
    game.registerViewer(socket);

    socket.on('add-snake', game.addSnake);
}

app = http.createServer(handler);
app.listen(process.argv[2] || 80);

io = socketio.listen(app);
io.set('log level', 1);
io.sockets.on('connection', onSocketConnection);