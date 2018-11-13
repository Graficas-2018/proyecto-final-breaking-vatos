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
  socket.on('host game', function (obj) {
    console.log('Alojando juego, ID: ' + socket.id + ' op pass: ' + obj.password);
    games.set(socket.id , new game());
    // Add player
    games.get(socket.id).addPlayer(socket.id, obj.name);
    //Emit created game
    socket.emit('game created', games.get(socket.id).players.entries());
  });

  //Join other player game
  socket.on('join game', function (room) {
    // Verify game exists
    if (games.has(room)) {
      //Try to add player
      if(!games.get(room).addPlayer(socket.id, "Nombre")){
        socket.emit('issue', 'No se pudo agregar al jugador');
      }
      //Add player to host room
      socket.join(room);
      console.log(socket.id + " joined to room: " + room);
      // Add player in game
      games.get(room).addPlayer();
      // Notify players of joined player
      socket.broadcast.to(room).emit('player connected', 'Se ha conectado el jugador: ' + socket.id);
      socket.emit('game created', true);
    } else {
      // Error no game
      socket.emit('issue', 'El juego no existe');
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
