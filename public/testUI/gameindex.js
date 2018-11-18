$(function () {
  var socket = io();
  var name, gameId, tiles;
  // Show loading game modal
  $('#loadingModal').modal({
    keyboard: false,
    show: true,
    backdrop: 'static'
  });
  // When connected
  socket.on('connect', () => {
    // Hide loadingModal
    $('#loadingModal').modal('dispose');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    //Show nameModal
    $('#nameModal').modal({
      keyboard: false,
      show: true,
      backdrop: 'static'
    });
    //Set HUD data
    $('h2').text("ID Jugador: " + socket.id);
  });
  // Ask for name
  $('#nameButton').click(function(){
    if($('#name').val() == ''){
      return;
    }
    name = $('#name').val();
    console.log($('#joinSend').val());
    // Hide Modal
    $('#nameModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    // Show host or join
    $('#joinModal').modal({
      keyboard: false,
      show: true,
      backdrop: 'static'
    });
  });
  // Host game
  $('#host').click(function() {
    gameId = socket.id;
    socket.emit('host game', {name:name, password: 'Optional password'});
  });
  // Join to game
  $('#joinButton').click(function(){
    socket.emit('join game', {hostId: $('#joinSend').val(), name: name});
    gameId = $('#joinSend').val();
    $('#joinSend').val('');
    return false;
  });
  // Recieve created
  socket.on('game created', function(msg){
    // Hide Modal
    $('#joinModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  });
  // Waiting for players
  socket.on('waiting players', (players)=>{
    console.log("Players: ");
    console.log(players);
    //Update HUD
    $('#players').empty();
    for (p of players) {
      $('#players').append($('<li>').text(p.name));
    }
  });
  // Start game
  $('#startButton').click(function(){
    socket.emit('start game', {teams: false});
  });
  // When game starts
  socket.on('game started', (t) => {
    alert("Juego iniciado");
    console.log(t);
    tiles = t;
  });
  // When player joins room
  socket.on('player connected', (msg) => {
    alert(msg);
    $('#messages').append($('<li>').text(msg));
  });

  // When next turn of game
  socket.on('next turn', (obj) => {
    console.log("NUEVO TURNO");
    if (obj.player == socket.id) {
      alert("Es tu turno");
      // Habilitar mover ficha

      // Verificar movimiento

      // Quitar ficha del jugador
      // tiles.splice(0,1);

      //Enviar movimiento
    }
  });

  // Cuando se recibe un movimiento
  socket.on('new move', (move) => {
    console.log(move);
    if (move.tile != null) {
      $('#messages').append($('<li>').text("El jugador "+ move.player +"  puso la ficha" + move.tile.l1 + ":" + move.tile.l2));
    }
    //Actualizar movimientos
  });

  // Cuando un jugador envía un movimiento
  $('#moveButton').click(function(){
    var move = {};
    move.gameId = gameId;
    var tile = {};
    tile.l1 = 0;
    tile.l2 = 1;
    move.tile = tile;
    socket.emit('send move', move);
    // Si se trata de un "pase" envia null
    //move.tile = null;
    //socket.emit('send move', move);
  });

  //If user needs to get additional tile
  $('#tileButton').click(function(){
    socket.emit('request tile', gameId);
  });

  //When tile is received
  socket.on('new tile', (tile) => {
    console.log(tile);
    $('#messages').append($('<li>').text(tile));
  });

  // When game is over
  $('#overButton').click(function(){
    socket.emit('game over', gameId);
  });

  //When game over
  socket.on('game over', (tile) => {
    $('#messages').append($('<li>').text(" GAME OVER "));
  });

  // If any error happens
  socket.on('issue', (msg) => {
    alert("Issue: " + msg);
  });
});
