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
//app.get('/', function(req, res){
  //res.sendFile(__dirname + '/index.html');
//});

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
    console.log(obj);
    games.get(socket.id).addPlayer(socket.id, obj.name);
    //Emit waiting for players
    socket.emit('game created', true);
    socket.emit('waiting players', games.get(socket.id).players.values());
  });

  //Join other player game
  socket.on('join game', function (obj) {
    // Verify game exists
    if (games.has(obj.hostId)) {
      //Try to add player
      if(!games.get(obj.hostId).addPlayer(socket.id, obj.name)){
        socket.emit('issue', 'No se pudo agregar al jugador');
        return;
      }
      //Add player to host room
      socket.join(obj.hostId);
      console.log(socket.id + " joined to room: " + obj.hostId);
      // Notify players of joined player
      socket.emit('game created', true);
      socket.broadcast.to(obj.hostId).emit('waiting players', games.get(obj.hostId).players.values());
      socket.emit('waiting players', games.get(obj.hostId).players.values());
    } else {
      // Error no game
      socket.emit('issue', 'El juego no existe');
    }
  });

  // Iniciar juego
  socket.on('start game', function(msg){
    console.log('Game started');
    //Call start game
    games.get(socket.id).startGame();
    // Send tiles to players
    for (player of games.get(socket.id).players.values()) {
      io.sockets.connected[player.socketId].emit('game started', player.tiles);
    }
    // Send nextTurn to the host
    socket.emit('next turn', {nextTurn:socket.id, previousMove:null});
  });

  //Siguiente movimiento
  socket.on('next move', function(move){
    console.log("Jugador " + socket.id + " movio ficha: " + move.l1 + ":" + move.l2);
    // Notificar movimiento y a quien le va
    socket.emit('next turn', {nextTurn:socket.id, previousMove:move});
  });

});

http.listen(3000, function(){
  console.log('Server started, listening on *:3000');
});
