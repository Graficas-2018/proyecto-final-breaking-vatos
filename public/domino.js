var renderer = null,
scene = null,
camera = null,
root = null,
table = null,
group = null,
reflectionCube = null,
orbitControls = null,
destX = 0,
destY = 0,
destZ = 0;
var maxPuntos = 6;
var objLoader = null, mtlLoader = null;

var movimiento = false;
var objAM = null;
var dominoes = [];
var turn = false;
var duration = 20000; // ms
var currentTime = Date.now();

function getRandomInt(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}

function loadDominoTiles(i,j)
{
    if(!objLoader){
      objLoader = new THREE.OBJLoader();
    }
    if(!mtlLoader){
      mtlLoader = new THREE.MTLLoader();
    }

    var dominoTileMTL = "./Models/"+i+"-"+j+".mtl";
    var dominoTileOBJ = "./Models/"+i+"-"+j+".obj";
    mtlLoader.load(dominoTileMTL, (materials)=>{
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load(dominoTileOBJ, (object)=>{
        object.position.set(getRandomInt(0, 10),getRandomInt(0, 10),getRandomInt(0, 50));
        object.valIzq = i;
        object.valDer = j;
        dominoes.push(object);
        scene.add(object);
      });
    });
}

function hideDominoes(objects)
{
  for (var i = 0; i < objects.length; i++)
  {
    objects[i].traverse( function ( child )
    {
        if ( child instanceof THREE.Mesh )
        {
            if(child.visible)
            {
              child.visible = false;
            }
            else
            {
              child.visible = true;
            }
        }
    });
  }
}

function loadTable()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        'Models/table/classic_dining_table.obj',
        function(object)
        {
            var texture = new THREE.TextureLoader().load('Models/table/wood-textures_00399209.jpg');
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 1);
            var specularMap = new THREE.TextureLoader().load('Models/table/Twilight_r.jpg');

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

function onKeyDown(event)
{

    switch(event.keyCode)
    {
        case 37: //Left
            //translateObj(dominoes[0],new THREE.Vector3(getRandomInt(0, 10), -3.7, getRandomInt(0, 10)));
            //console.log("izquierda");
            putDominoesOnCamera(dominoes);
            break;
        case 38: //Up
            //translateObj(dominoes[1],new THREE.Vector3(getRandomInt(0, 10), -3.7, getRandomInt(0, 10)));
            //console.log("arriba");
            changeCamera();
            break;
        case 39: //Right
            translateObj(dominoes[2],new THREE.Vector3(getRandomInt(0, 10), -3.7, getRandomInt(0, 10)));
            //console.log("derecha");
            break;
        case 40: //Down
            //translateObj(dominoes[3],new THREE.Vector3(getRandomInt(0, 10), -3.7, getRandomInt(0, 10)));
            hideDominoes(dominoes);
            //console.log("abajo");
            break;
    }
}

function putDominoesOnCamera(objects) //Es necesario remover las fichas como hijos de la cámara para ponerlas despues
{
  //Remueve las fichas como hijas de la cámara para volver a ser acomodadas
  for (var i = camera.children.length - 1; i >= 0; i--)
  {
      camera.remove(camera.children[i]);
  }


  var files = 0;
  if(objects.length <= 7)
    files = 1;
  else if(objects.length <= 14)
    files = 2;
  else if(objects.length <= 21)
    files = 3;
  else
    files = 4;

  //1 fila es 22 en x y 12 en y         3
  //2 filas es 44 en x y 24 en y        3 y 9
  //3 filas es 66 en x y 36 en y        3 y 9 y 15
  //4 filas es 88 en x y 48 en y        3 y 9 y 15 y 21

  var far = files * -15;

  for (var i = 0; i < files; i++)
  {
    for (var j = (i*7); j < ((i*7)+7); j++)
    {
      if(j < objects.length)
      {
        camera.add(objects[j]);
        objects[j].position.set((7.25 * files) - ((j - (i*7)) * (2.5 * files)),-3 - (6*i), far);
        objects[j].rotation.x = Math.PI / 2;
      }
    }
  }
}

function removeFromCamera(object)
{
  camera.remove(object);
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
        console.log("llego");
        movimiento = false;
        return;
      }

      if(destX > objAM.position.x)
      {
          objAM.position.x += 0.05 * deltat;
      }
      else if(destX < objAM.position.x)
      {
          objAM.position.x -= 0.05 * deltat;
      }

      if(destY > objAM.position.y)
      {
          objAM.position.y += 0.05 * deltat;
      }
      else if(destY < objAM.position.y)
      {
          objAM.position.y -= 0.05 * deltat;
      }

      if(destZ > objAM.position.z)
      {
          objAM.position.z += 0.05 * deltat;
      }
      else if(destZ < objAM.position.z)
      {
          objAM.position.z -= 0.05 * deltat;
      }
    }
}

function changeCamera()
{
    if(turn)
    {
      translateObj(camera, new THREE.Vector3(170,110,220));
      orbitControls.enableRotate = true;
      turn = false;
    }
    else
    {
      translateObj(camera, new THREE.Vector3(10.3,164.8,0.05));
      orbitControls.enableRotate = false;
      turn = true;
    }

}

function run()
{
    requestAnimationFrame(function() { run(); });

    //console.log(camera.position);
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();

    // Update the camera controller
    orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas)
{
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

    //cubemap
    var path = "images/cubemap/park/";
    var format = '.png';

    var urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ];

    // Create a new Three.js scene
    scene = new THREE.Scene();

    /*new THREE.CubeTextureLoader().load(urls, function(reflectionCube)
    {
      reflectionCube.format = THREE.RGBFormat;
      scene.background = reflectionCube;
      renderer.render( scene, camera );
    });*/

    loadTable();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(2, 50, 0);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(-50, 30, 0);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0xffffff );
    root.add(ambientLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;

    root.add(group);

    // Now add the group to our scene
    scene.add( root );
}
