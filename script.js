var textureURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg"; 
var displacementURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg"; 
var worldURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg"

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = false;


renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.SphereGeometry( 2,60,60 );

var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load( textureURL );
var displacementMap = textureLoader.load( displacementURL );
var worldTexture = textureLoader.load( worldURL );

var material = new THREE.MeshPhongMaterial ( 
  { color: 0xffffff ,
  map: texture ,
     displacementMap: displacementMap,
  displacementScale: 0.06,
  bumpMap: displacementMap,
  bumpScale: 0.04,
   reflectivity:0, 
   shininess :0
  } 

);

var moon = new THREE.Mesh( geometry, material );

const light = new THREE.DirectionalLight(0xFFFFFF, 1);

scene.add(light);

hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );

var worldGeometry = new THREE.SphereGeometry( 1000,60,60 );
var worldMaterial = new THREE.MeshBasicMaterial ( 
  { color: 0xffffff ,
  map: worldTexture ,
  side: THREE.BackSide
  } 
);
var world = new THREE.Mesh( worldGeometry, worldMaterial );
scene.add( world );

scene.add( moon );
camera.position.z = 5;

moon.rotation.x = 3.1415*0.02;
moon.rotation.y = 3.1415*1.54;

function getMoonPhasePosition(date = new Date()) {
  // Known new moon reference date (J2000.0 epoch) - January 6, 2000
  const referenceDate = new Date('2000-01-06T00:00:00Z');
  
  // Convert dates to Julian Day Numbers
  const julianDate = date.getTime() / (1000 * 60 * 60 * 24) + 2440587.5;
  const referenceJulianDate = referenceDate.getTime() / (1000 * 60 * 60 * 24) + 2440587.5;
  
  // Number of days since the reference new moon
  const daysSinceNewMoon = julianDate - referenceJulianDate;
  
  // Length of the lunar cycle (synodic month)
  const lunarCycle = 29.53058867;
  
  // Calculate the phase of the moon
  const phaseIndex = (daysSinceNewMoon % lunarCycle) / lunarCycle;
  console.log(phaseIndex);
  // Return 3D position based on the moon phase
  return getMoonPhasePositionFromIndex(phaseIndex);
}

function getMoonPhasePositionFromIndex(phaseIndex) {
  // Define phase boundaries
  const boundaries = [0, 0.03, 0.25, 0.37, 0.50, 0.53, 0.65, 0.99, 1];
  // Define positions for each phase
  const positions = [
    [0, 0, -50],    // New Moon
    [35, 0, -35],  // Waxing Crescent
    [50, 0, 0],    // First Quarter
    [35, 0, 35],   // Waxing Gibbous
    [0, 0, 50],     // Full Moon
    [-35, 0, 35],    // Waning Gibbous
    [-50, 0, 0],     // Last Quarter
    [-35, 0, -35]    // Waning Crescent
  ];

  // Find the appropriate segment
  for (let i = 0; i < boundaries.length - 1; i++) {
    if (phaseIndex >= boundaries[i] && phaseIndex < boundaries[i + 1]) {
      const t = (phaseIndex - boundaries[i]) / (boundaries[i + 1] - boundaries[i]);
      const pos1 = positions[i];
      const pos2 = positions[i + 1];
      return [
        pos1[0] + t * (pos2[0] - pos1[0]),
        pos1[1] + t * (pos2[1] - pos1[1]),
        pos1[2] + t * (pos2[2] - pos1[2])
      ];
    }
  }

  // Fallback position (shouldn't be reached with valid phaseIndex)
  return [35, 0, -35];
}


function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onResize, false);



function animate() {
	requestAnimationFrame( animate );
  const moonPosition = getMoonPhasePosition(new Date(today));
  const targetPosition = new THREE.Vector3(moonPosition[0],moonPosition[1],moonPosition[2]); 
  light.position.lerp(targetPosition, 0.1);
  moon.rotation.y += 0.0002;
  moon.rotation.x += 0.0001;
  world.rotation.y += 0.0001;
  world.rotation.x += 0.0001;
	renderer.render( scene, camera );
}
animate();


var today = new Date().toISOString().split('T')[0];

document.getElementById('datePicker').value = today;
document.getElementById('datePicker').addEventListener('change', (event) => {
  today = document.getElementById('datePicker').value;
  
});