var express = require('express'); // Get the module
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game.js');
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
  socket.game = new game(socket.id);
  var handshakeData = socket.request;
  // make sure the handshake data looks good as before
  // if error do this:
    // next(new Error('not authorized'));
  // else just call next
  next();
});


// connection
io.on('connection', function(socket){

  //Create new game with password
  socket.on('host game', function (password) {
    console.log(gameinstance.password);
  });

  //Join other player game
  socket.on('join game', function (room) {
    console.log(room);
    //Add player to host room
    socket.join(room);
  });

  // Iniciar juego
  socket.on('start game', function(msg){
    socket.broadcast.to(socket.id).emit('my message', msg);
  });

});

http.listen(3000, function(){
  console.log('Server started, listening on *:3000');
});
