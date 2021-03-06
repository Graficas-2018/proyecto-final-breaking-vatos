var compression = require('compression');
var express = require('express'); // Get the module
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js');
var HashMap = require('hashmap');
var jugadorContinua = true;
// Use compression
app.use(compression());
// Serve static assets
app.use('/game', express.static('public'));
// HTML only to test socket
// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

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
    games.get(socket.id).addPlayer(socket.id, obj.name, jugadorContinua);
    //Emit waiting for players
    socket.emit('game created', true);
    socket.emit('waiting players', games.get(socket.id).players.values());
  });

  //Join other player game
  socket.on('join game', function (obj) {
    // Verify game exists
    if (games.has(obj.hostId)) {
      //Try to add player
      if(!games.get(obj.hostId).addPlayer(socket.id, obj.name,jugadorContinua)){
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
    io.to(socket.id).emit('next turn', {player: games.get(socket.id).nextTurn(),primerMovimiento:games.get(socket.id).getFirstMove()});
  });

  //Siguiente movimiento
  socket.on('send move', function(move){
    if (move != null) {
      if(move.primerMovimiento == true){
        move.primerMovimiento = false;
      }
      for (var player of games.get(move.gameId).players.values()) {
        player.canContinue(move);
      }
      var actualPlayer = games.get(move.gameId).players.get(socket.id);
      var indexNextPlayer = games.get(move.gameId).nextTurn();
      var nextPlayer = games.get(move.gameId).players.get(indexNextPlayer);
      if(move.tile != null){
        actualPlayer.tileDelivered(move);
        /*actualPlayer.canContinue(move);
        nextPlayer.canContinue(move);*/
        var numTiles = actualPlayer.getTiles();
        console.log(actualPlayer.name+" "+JSON.stringify(numTiles));
        if(numTiles.length <= 0){
          var message ={message: "Ganador: "+actualPlayer.name};
          io.to(move.gameId).emit('game over',message);
          games.delete(move.gameId);
          //return;
        }
        else {
          if (games.get(move.gameId).gameOverTie()) {
            var info = games.get(move.gameId).sumPointsPlayers();
            var message ={message: "Ganador por puntos: "+info.name+" con "+info.points+"puntos"};
            io.to(move.gameId).emit('game over',message);
            games.delete(move.gameId);
          }
          else{
            /*for (var player of games.get(move.gameId).players.values()) {
              io.sockets.connected[player.socketId].emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
            }*/
            // Notificar movimiento y a quien le va
            io.to(move.gameId).emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
            io.to(move.gameId).emit('next turn', {player: indexNextPlayer,tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento, dir: move.dir});
            //socket.broadcast.to(games.get(move.gameId).nextTurn()).emit('next turn', null);
          }
        }
      }
      else{
        /*for (var player of games.get(move.gameId).players.values()) {
          io.sockets.connected[player.socketId].emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
        }*/
        io.to(move.gameId).emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
        io.to(move.gameId).emit('next turn', {player: indexNextPlayer,tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento, dir: move.dir});
      }
    }
    else{
      /*for (var player of games.get(move.gameId).players.values()) {
        io.sockets.connected[player.socketId].emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
      }*/
      // Notificar movimiento y a quien le va
      io.to(move.gameId).emit('new move', {player: socket.id, tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento});
      io.to(move.gameId).emit('next turn', {player: indexNextPlayer,tile: move.tile ,numberLeft:move.numberLeft, numberRight:move.numberRight, primerMovimiento:move.primerMovimiento, dir: move.dir});
    }
    //console.log("Jugador " + socket.id + " movio ficha: " + move.l1 + ":" + move.l2);
  });

  // Cuando come fichas
  socket.on('request tile', function(gameId){
    // Ask game for tile and emit
    var newTile = games.get(gameId).getTile();
    var actualPlayer = games.get(gameId).players.get(socket.id);
    console.log("Agregada "+JSON.stringify(newTile));
    if(newTile!=null)
      actualPlayer.addTile(newTile[0]);
    socket.emit('new tile', newTile);
  });

  // Cuando un jugador gana o se cierra el juego
  /*socket.on('game over', function(gameId){
    // End game
    io.to(gameId).emit('game over');
    games.delete(gameId);
  });*/

});

http.listen(3000, function(){
  console.log('Server started, listening on *:3000');
});
