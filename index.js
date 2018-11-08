var compression = require('compression');
var express = require('express'); // Get the module
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js');
var HashMap = require('hashmap');
// Use compression
app.use(compression());
// Serve static assets
app.use('/game', express.static('public'));
// HTML only to test socket
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// For every socket host new game
io.use(function(socket, next) {
  console.log(socket.id);
  // Use socket id as game password
  //var handshakeData = socket.request;
  next();
});

// Games in memory
var games = new HashMap();


// connection
io.on('connection', function(socket){

  //Create new game
  socket.on('host game', function (password) {
    console.log('Alojando juego, ID: ' + socket.id + ' op pass: ' + password);
    games.set(socket.id , new game());
  });

  //Join other player game
  socket.on('join game', function (room) {
    // Verify game exists
    if (games.has(room)) {
      //Add player to host room
      socket.join(room);
      console.log(socket.id + " joined to room: " + room);
      // Notify players of joined player
      socket.broadcast.to(room).emit('player connected', 'Se ha conectado el jugador: ' + socket.id);
    } else {
      // Error no game

    }
  });

  // Iniciar juego
  socket.on('start game', function(msg){
    console.log('Game started');
    io.broadcast.to(socket.id).emit('start game', msg);
  });

});

http.listen(3000, function(){
  console.log('Server started, listening on *:3000');
});
