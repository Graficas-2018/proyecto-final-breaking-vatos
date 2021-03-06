var renderer = null,
scene = null,
camera = null,
root = null,
table = null,
reflectionCube = null,
group = null,
socket = null,
selection = null,
gameId = null,
fichas = [],tiles=null,
movimientoValido = false, primerMovimiento = false,turnoJugador = false,numberLeft = -1, numberRight = -1,fichasIniciales = 7,
orbitControls = null, raycaster = null, dragControls = null, infoGame= null, lastTile=null, jugadorContinua = true, loaded=false,
destX = 0, destY = 0, destZ = 0,
der1 = false, der2 = false, izq1 = false, izq2 = false;
var mouse = new THREE.Vector2();
var maxPuntos = 6;
var objLoader = null, mtlLoader = null;
var objAM = null;
var movimiento = false;
var turn = false;
var fichasJugador= [];
var duration = 20000; // ms
var currentTime = Date.now();
var activated = false;
var posDer = new THREE.Vector3(0,-168.5,-4);
var posIzq = new THREE.Vector3(0,-168.5,0);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDragStart(event) {
    var l1 = event.object.parent.l1;
    var l2 = event.object.parent.l2;
    var parent = event.object;
    selection = {l1: l1,l2:l2,id:parent,idF:parent.parent.idFicha};
    orbitControls.enabled = false;
}
function onDragEnd(event) {
  orbitControls.enabled = true;
  completeTurn();
}

function initControls(){
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.minDistance = 20;
    orbitControls.maxDistance = 300;
    orbitControls.enablePan = false;
    orbitControls.enableKeys = false;
    orbitControls.target.set(0,-4,0);
    dragControls = new THREE.DragControls(fichasJugador, camera, renderer.domElement );
		dragControls.addEventListener('dragstart', onDragStart);
		dragControls.addEventListener('dragend', onDragEnd);
}

function completeTurn(){
  // Habilitar mover ficha
  var move = {};
  if (turnoJugador && selection) {
    move.gameId = gameId;
    if (infoGame.primerMovimiento) {
        numberLeft = selection.l1;
        numberRight = selection.l2;
        movimientoValido = true;
        der1 = true;
    }
    else{
      if(infoGame.numberLeft === selection.l1){
        numberLeft = selection.l2;
        numberRight = infoGame.numberRight;
        movimientoValido = true;
        der2 = true;
      }
      else if(infoGame.numberLeft === selection.l2){
        numberLeft = selection.l1;
        numberRight = infoGame.numberRight;
        movimientoValido = true;
        der1 = true;
      }
      else if(infoGame.numberRight === selection.l1){
        numberRight = selection.l2;
        numberLeft = infoGame.numberLeft;
        movimientoValido = true;
        izq2 = true;
      }
      else if(infoGame.numberRight === selection.l2){
        numberRight = selection.l1;
        numberLeft = infoGame.numberLeft;
        movimientoValido = true;
        izq1 = true;
      }
      else{
        movimientoValido = false;
        der1 = false;
        der2 = false;
        izq1 = false;
        izq2 = false;
      }
    }
    //Enviar movimiento
    if(movimientoValido){
      var tile = {};
      tile.id = selection.idF;
      tile.l1 = selection.l1;
      tile.l2 = selection.l2;
      move.tile = tile;
      move.numberLeft = numberLeft;
      move.numberRight = numberRight;
      move.primerMovimiento = infoGame.primerMovimiento;
      move.lastTile = selection.id;
      var index = fichasJugador.indexOf(selection.id);
      lastTile = fichasJugador[index];

      if(der1)
      {
        fichasJugador[index].rotation.y -= (Math.PI / 2);
        translateObj(fichasJugador[index], posDer);
        setTimeout(function()
        {
          posDer = new THREE.Vector3(0,posDer.y,(posDer.z - 4));
        }, 2000);
        move.dir = 2;
      }
      else if(der2)
      {
        fichasJugador[index].rotation.y += (Math.PI / 2);
        translateObj(fichasJugador[index], posDer);
        setTimeout(function()
        {
          posDer = new THREE.Vector3(0,posDer.y,(posDer.z - 4));
        }, 2000);
        move.dir = 3;
      }
      else if(izq1)
      {
        fichasJugador[index].rotation.y += (Math.PI / 2);
        translateObj(fichasJugador[index], posIzq);
        setTimeout(function()
        {
          posIzq = new THREE.Vector3(0,posIzq.y,(posIzq.z + 4));
        }, 2000);
        move.dir = 0;
      }
      else if(izq2)
      {
        fichasJugador[index].rotation.y -= (Math.PI / 2);
        translateObj(fichasJugador[index], posIzq);
        setTimeout(function()
        {
          posIzq = new THREE.Vector3(0,posIzq.y,(posIzq.z + 4));
        }, 2000);
        move.dir = 1;
      }
      der1 = false;
      der2 = false;
      izq1 = false;
      izq2 = false;

      socket.emit('send move', move);
      turnoJugador = false;
      setTimeout(function()
      {
        if (index > -1) {
          changeCamera();
          fichasJugador.splice(index, 1);
          hideDominoes(fichasJugador);
        }
      }, 2000);
      dragControls = new THREE.DragControls(fichasJugador, camera, renderer.domElement );
      selection = null;
      movimientoValido = false;
      activated = false;
    }
    else{
      putDominoesOnCamera(fichasJugador);
      movimientoValido = false
      selection = null;
      return;
    }
  }
}

var k = 0;
function loadDominoTiles(i,j,k){
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
        object.idFicha = k;
        object.l1 = i;
        object.l2 = j;
        //object.position.set(getRandomInt(0, 10),getRandomInt(0, 10),getRandomInt(0, 50));
        object.position.set(10.3,164.8,0.05);
        fichas.push(object);
      });
    });
  }
  function toString(v) {
    return "[ " + v.x + ", " + v.y + ", " + v.z + " ]";
  }

function hideDominoes(objects)
{
  for (var i = 0; i < objects.length; i++)
  {
    objects[i].traverse( function ( child )
    {
        if ( child instanceof THREE.Mesh )
        {
            child.visible = false;
        }
    });
  }
}

function showDominoes(objects)
{
  for (var i = 0; i < objects.length; i++)
  {
    objects[i].traverse( function ( child )
    {
        if ( child instanceof THREE.Mesh )
        {
            child.visible = true;
        }
    });
  }
}

function putDominoesOnCamera(objects)
{
  var files = 0;
  if(objects.length <= 7)
    files = 1;
  else if(objects.length <= 14)
    files = 2;
  else if(objects.length <= 21)
    files = 3;
  else
    files = 4;

  var far = files * -15;

  for (var i = 0; i < files; i++)
  {
    for (var j = (i*7); j < ((i*7)+7); j++)
    {
      if(j < objects.length)
      {
        objects[j].position.set(3 + (6*i), far, (7.25 * files) - ((j - (i*7)) * (2.5 * files)));
        objects[j].rotation.y = Math.PI / 2;
      }
    }
  }
}

function loadTable()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        '../Models/table/classic_dining_table.obj',
        function(object)
        {
            var texture = new THREE.TextureLoader().load('../Models/table/wood-textures_00399209.jpg');
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 1);
            var specularMap = new THREE.TextureLoader().load('../Models/table/Twilight_r.jpg');

            object.traverse( function ( child )
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    child.material.specularMap = specularMap;
                }
            } );

            table = object;
            table.scale.set(2,2,6);
            table.position.set(0,-66.5,0);
            scene.add(object);
        },
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        });
}

function translateObj(object, end)
{
    objAM = object;
    destX = end.x;
    destY = end.y;
    destZ = end.z;
    movimiento = true;
}

function inRange(val1, val2)
{
  if(Math.abs(Math.abs(val1) - Math.abs(val2)) <= 0.5)
  {
      return true;
  }
  return false;
}

function changeCamera()
{
    if(turn)
    {
      translateObj(camera, new THREE.Vector3(170,110,220));
      orbitControls.enableZoom = true;
      orbitControls.enableRotate = true;
      turn = false;
    }
    else
    {
      translateObj(camera, new THREE.Vector3(10.3,164.8,0.05));
      orbitControls.enableRotate = false;
      orbitControls.enableZoom = false;
      turn = true;
    }
}

function animate()
{
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    if(movimiento)
    {
      if(inRange(destX, objAM.position.x))
      {
        objAM.position.x = destX;
      }
      if(inRange(destY, objAM.position.y))
      {
        objAM.position.y = destY;
      }
      if(inRange(destZ, objAM.position.z))
      {
        objAM.position.z = destZ;
      }

      if(inRange(destX, objAM.position.x) && inRange(destY, objAM.position.y) && inRange(destZ, objAM.position.z))
      {
        movimiento = false;
        return;
      }

      if(destX > objAM.position.x)
      {
          objAM.position.x += 0.1 * deltat;
      }
      else if(destX < objAM.position.x)
      {
          objAM.position.x -= 0.1 * deltat;
      }

      if(destY > objAM.position.y)
      {
          objAM.position.y += 0.1 * deltat;
      }
      else if(destY < objAM.position.y)
      {
          objAM.position.y -= 0.1 * deltat;
      }

      if(destZ > objAM.position.z)
      {
          objAM.position.z += 0.1 * deltat;
      }
      else if(destZ < objAM.position.z)
      {
          objAM.position.z -= 0.1 * deltat;
      }
    }
}

function run() {
    requestAnimationFrame(function() { run(); });
    // Render the scene
    renderer.render( scene, camera );
    // Spin the cube for next frame
    animate();
    // Update the camera controller
    orbitControls.update();
    if (!turnoJugador) {
      dragControls.deactivate();
    }
    else if(turnoJugador){
      dragControls.activate();
      //activated = true;
    }
}


var directionalLight = null;
var spotLight = null;
var ambientLight = null;

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  for (var i = 1; i <= maxPuntos; i++) {
    var last = i;
    for(var j = 1; j<=maxPuntos;j++){
      if (i > 0 && last > j) {
        j = last;
      }
      loadDominoTiles(i,j,k);
      k++;
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

    //*/cubemap
		var path = "../images/cubemap/park/";
		var format = '.jpg';

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
    });

    loadTable();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(170, 110, 220);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    ambientLight = new THREE.AmbientLight ( 0xffffff );
    root.add(ambientLight);

    // Add a directional light to show off the object
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(-50, 30, 0);
    root.add(directionalLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Now add the group to our scene
    scene.add(root);
    window.addEventListener( 'resize', onWindowResize);
}


function darFichasJugador(number, eatTile){
  var j = 0;
  var i = 0;
  while(j < number){
    if (tiles[j].l1 == fichas[i].l1 && tiles[j].l2 == fichas[i].l2) {
      fichasJugador.push(fichas[i].children[0]);
      scene.add(fichas[i]);
      j++;
      i=0;
    }
    else{
      i++;
    }
  }
}

function agregarFichaJuego(number,move,isForUser){
  var j = 0, i =0;
  if(move.tile != null){
    while(j < number){
      var moSe =move.tile.id;
      var fi = fichas[i].idFicha;
      if (moSe === fi){
        scene.add(fichas[i]);
        if(isForUser){
          fichasJugador.push(fichas[i].children[0]);
        }

        if(move.dir == 0)
        {
          fichas[i].children[0].rotation.y += Math.PI;
          fichas[i].children[0].position.set(posIzq.x,posIzq.y,posIzq.z);
          posIzq = new THREE.Vector3(0,posIzq.y,(posIzq.z + 4));
        }
        else if(move.dir == 1)
        {
          fichas[i].children[0].position.set(posIzq.x,posIzq.y,posIzq.z);
          posIzq = new THREE.Vector3(0,posIzq.y,(posIzq.z + 4));
        }
        else if(move.dir == 2)
        {
          fichas[i].children[0].position.set(posDer.x,posDer.y,posDer.z);
          posDer = new THREE.Vector3(0,posDer.y,(posDer.z - 4));
        }
        else if(move.dir == 3)
        {
          fichas[i].children[0].rotation.y += Math.PI;
          fichas[i].children[0].position.set(posDer.x,posDer.y,posDer.z);
          posDer = new THREE.Vector3(0,posDer.y,(posDer.z - 4));
        }
        else if(move.dir == -1)
        {
          putDominoesOnCamera(fichasJugador);
        }

        j++;
        i=0;
      }
      else{
        i++;
      }
    }
  }
}

$(function () {
  socket = io();
  var name;
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
    //if(!loaded)
      createScene(canvas);
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
    initControls();
    darFichasJugador(fichasIniciales);
    putDominoesOnCamera(fichasJugador);
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
      dragControls.activate();
      putDominoesOnCamera(fichasJugador);
      showDominoes(fichasJugador);
      turnoJugador = true;
      infoGame = obj;
      if(!obj.primerMovimiento)
      {
      agregarFichaJuego(1,obj,false);
      }
      setTimeout(function()
      {
        changeCamera();
      }, 2000);

      alert("Es tu turno");

      dragControls = new THREE.DragControls(fichasJugador, camera, renderer.domElement );
    }
  });

  // Cuando se recibe un movimiento
  socket.on('new move', (move) => {
    console.log(move);
    if (move.tile != null) {
      if(!move.primerMovimiento)
        agregarFichaJuego(1,move,false);
      $('#messages').append($('<li>').text("El jugador "+ move.player +"  puso la ficha" + move.tile.l1 + ":" + move.tile.l2+". Los siguientes numeros validos son a la izquierda "+move.numberLeft+ " y a la derecha "+move.numberRight));
    }
    //Actualizar movimientos
  });
  //If user needs to get additional tile
  $('#tileButton').click(function(){
    socket.emit('request tile', gameId);
  });

  //When tile is received
  socket.on('new tile', (tilesS) => {
    if(tilesS != null){
      console.log(tilesS[0]);
      var fichaComida = {};
      var tile={};
      tile.id = tilesS[0].id;
      tile.l1 = tilesS[0].l1;
      tile.l2 = tilesS[0].l2;
      fichaComida.tile= tile;
      fichaComida.dir = -1;
      agregarFichaJuego(1,fichaComida,true);
      //$('#messages').append($('<li>').text(JSON.stringify(tile)));
    }
    else{
      jugadorContinua = false;
      var move = {};
      move.gameId = gameId;
      move.tile = null;
      move.numberLeft = infoGame.numberLeft;
      move.numberRight = infoGame.numberRight;
      move.primerMovimiento = infoGame.primerMovimiento;
      move.lastTile = null;
      changeCamera();
      hideDominoes(fichasJugador);
      socket.emit('send move', move);
    }
  });

  /*/ When game is over
  $('#overButton').click(function(){
    socket.emit('game over', gameId);
  });*/

  //When game over
  socket.on('game over', (info) => {
    turnoJugador = false;
    //$('#messages').append($('<li>').text(info.message));
    alert(info.message);
  });

  // If any error happens
  socket.on('issue', (msg) => {
    alert("Issue: " + msg);
  });
});
