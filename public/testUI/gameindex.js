var renderer = null,
scene = null,
camera = null,
root = null,
gun = null,
monster = null,
group = null,
selection = null,plane= null, offset = new THREE.Vector3,
fichas = [],
movimientoValido = false, primerMovimiento = true,turnoJugador = false,
orbitControls = null, raycaster = null, dragControls = null;
var mouse = new THREE.Vector2();
var maxPuntos = 6;
var objLoader = null, mtlLoader = null;
var fichasJugador= [];
var duration = 20000; // ms
var currentTime = Date.now();
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function initControls(){
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    dragControls = new THREE.DragControls(fichasJugador, camera, renderer.domElement );
		dragControls.addEventListener( 'dragstart', function (event) {
      console.log(event.object.parent);
      selection = {event.object.parent.l1,event.object.parent.l2}
			orbitControls.enabled = false;
		});
		dragControls.addEventListener( 'dragend', function (event) {
      //selection = {event.object.parent.l1,event.object.parent.l2}
			orbitControls.enabled = true;

		});
}

function loadDominoTiles(i,j){
    if(!objLoader){
      objLoader = new THREE.OBJLoader();
    }
    if(!mtlLoader){
      mtlLoader = new THREE.MTLLoader();
    }

    var dominoTileMTL = "../Models/"+i+"-"+j+".mtl";
    var dominoTileOBJ = "../Models/"+i+"-"+j+".obj";
    mtlLoader.load(dominoTileMTL, (materials)=>{
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(dominoTileOBJ, (object)=>{
        object.l1 = i;
        object.l2 = j;
        object.position.set(getRandomInt(0, 10),getRandomInt(0, 10),getRandomInt(0, 50));
        fichas.push(object);
      });
    });
  }
  function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
  }

function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
}

function run() {
    requestAnimationFrame(function() { run(); });
    // Render the scene
    renderer.render( scene, camera );
    // Spin the cube for next frame
    animate();
    // Update the camera controller
    orbitControls.update();
}


var directionalLight = null;
var spotLight = null;
var ambientLight = null;

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  for (var i = 0; i <= maxPuntos; i++) {
    var last = i;
    for(var j = 0; j<=maxPuntos;j++){
      if (i > 0 && last > j) {
        j = last;
      }
      loadDominoTiles(i,j);
    }
  }
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /*/cubemap
		var path = "../images/cubemap/park/";
		var format = '.png';

    var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

    new THREE.CubeTextureLoader().load(urls, function(reflectionCube)
    {
      reflectionCube.format = THREE.RGBFormat;
      scene.background = reflectionCube;
      renderer.render( scene, camera );
    });*/

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-2, 6, 12);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    ambientLight = new THREE.AmbientLight ( 0xffffff );
    root.add(ambientLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Now add the group to our scene
    scene.add(root);
    window.addEventListener( 'resize', onWindowResize);
}

$(function () {
  var socket = io();
  var name, gameId, tiles;
  var canvas = document.getElementById("webglcanvas");
  canvas.style.display = "none";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
    canvas.style.display = "block";
    createScene(canvas)
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
  //  createScene(canvas);
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
    var j = 0;
    var i = 0;
    while(j < 7){
      if (tiles[j].l1 == fichas[i].l1 && tiles[j].l2 == fichas[i].l2) {
        fichasJugador.push(fichas[i].children[0]);
        scene.add(fichas[i]);
        j++;
        i=0;
      }
      else
        i++;
    }
    for(var i = 0; i < fichasJugador.length; i++)
      console.log(fichasJugador[i]);
    initControls();
    run();
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
      turnoJugador = true;
      // Habilitar mover ficha
      if (turnoJugador) {

        // Verificar movimiento

        // Quitar ficha del jugador
        // tiles.splice(0,1);

        //Enviar movimiento
        if(movimientoValido){
          var move = {};
          move.gameId = gameId;
          move.tile = selection;
          socket.emit('send move', move);
          turnoJugador = false;
          
          selection = {};
        }
      }
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
