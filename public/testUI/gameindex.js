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
    socket.emit('host game', {name:name, password: 'Optional password'});
  });
  // Join to game
  $('#joinButton').click(function(){
    socket.emit('join game', {hostId: $('#joinSend').val(), name: name});
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
    //Actualizar movimientos
    if (obj.previousMove !=  null) {
      $('#messages').append($('<li>').text("El jugador x  puso la ficha" + obj.previousMove.l1+ ":" + obj.previousMove.l2));
    }
    // Si no es el turno no hacer nada
    if (obj.nextTurn != socket.id) {
      return;
    }
    alert("Es tu turno");
    // Habilitar mover ficha

    // Verificar movimiento

    // Quitar ficha del jugador
    console.log(tiles);
    var tile = tiles[0];
    console.log(tile);
    tiles.splice(0,1);
    console.log("TILE:" + tile.l1);
    //Enviar movimiento
    socket.emit('next move', tile);
  });
  // If any error happens
  socket.on('issue', (msg) => {
    alert("Issue: " + msg);
  });
});
