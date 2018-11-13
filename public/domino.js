var renderer = null,
scene = null,
camera = null,
root = null,
gun = null,
monster = null,
group = null,
orbitControls = null;
var maxPuntos = 6;
var objLoader = null, mtlLoader = null;

var duration = 20000; // ms
var currentTime = Date.now();

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function loadDominoTiles(i,j){
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
        scene.add(object);
      });
    });
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

function createScene(canvas) {
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
		var path = "images/cubemap/";
		var format = '.png';

    var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

		var reflectionCube = new THREE.CubeTextureLoader().load( urls );

		reflectionCube.format = THREE.RGBFormat;

		var refractionCube = new THREE.CubeTextureLoader().load( urls );

    refractionCube.mapping = THREE.CubeRefractionMapping;

    refractionCube.format = THREE.RGBFormat;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    scene.background = reflectionCube;

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-2, 6, 12);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 0, 3);
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Now add the group to our scene
    scene.add( root );
}
