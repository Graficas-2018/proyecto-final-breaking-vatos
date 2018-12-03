

function initControls()
{
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.minDistance = 0;
    orbitControls.maxDistance = 300;
    orbitControls.enablePan = false;
    orbitControls.enableKeys = false;
    orbitControls.target.set(0,-4,0);
}
