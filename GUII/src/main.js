// Import core THREE.js library
import * as THREE from "three";

// Import OrbitControls for camera interaction (rotate, zoom, pan)
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Import lil-gui for UI controls
import GUI from "lil-gui";

/* -------------------- SCENE -------------------- */

// Create the main scene
const scene = new THREE.Scene();

// Add fog to the scene (color, near distance, far distance)
scene.fog = new THREE.Fog(0xcccccc, 10, 15);

// Set scene background color (should match fog for realism)
scene.background = new THREE.Color(0xcccccc);

/* -------------------- CAMERA -------------------- */

// Perspective camera (FOV, aspect ratio, near, far)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Move camera backward so we can see objects
camera.position.z = 5;

/* -------------------- RENDERER -------------------- */

// WebGL renderer
const renderer = new THREE.WebGLRenderer();

// Set renderer size to full window
renderer.setSize(window.innerWidth, window.innerHeight);

// Add canvas to the DOM
document.body.appendChild(renderer.domElement);

/* -------------------- CONTROLS -------------------- */

// Enable mouse controls for camera
const controls = new OrbitControls(camera, renderer.domElement);

/* -------------------- GEOMETRY & MESH -------------------- */

// Create box geometry (width, height, depth, segments)
const geometry = new THREE.BoxGeometry(1, 1, 1, 20, 10, 10);

// Standard material (supports fog + lighting)
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: true,
});

// Create mesh using geometry and material
let cube = new THREE.Mesh(geometry, material);

// Add cube to the scene
scene.add(cube);

/* -------------------- LIGHT -------------------- */

// Directional light (acts like sunlight)
const light = new THREE.DirectionalLight(0xffffff, 1);

// Position the light
light.position.set(5, 5, 5);

// Add light to the scene
scene.add(light);

/* -------------------- GUI -------------------- */

// Create GUI instance
const gui = new GUI();

// Settings object connected to GUI
const settings = {
  size: 1,
  posX: 0,
  posY: 0,
  posZ: 0,
  color: "#00ff00",
  background: "#030659",
  visible: true,
  wireframe: true,
  shape: "cube",
  animation: 'none',
};

/* -------------------- SIZE CONTROLS -------------------- */

const sizeFolder = gui.addFolder("Size Controls");

// Scale cube uniformly
sizeFolder.add(settings, "size", 0.1, 1.5, 0.1).onChange((value) => {
  cube.scale.set(value, value, value);
});

/* -------------------- POSITION CONTROLS -------------------- */

const positionFolder = gui.addFolder("Position Folder");

// Move cube on X axis
positionFolder.add(settings, "posX", -5, 5, 0.01).onChange((value) => {
  cube.position.x = value;
});

// Move cube on Y axis
positionFolder.add(settings, "posY", -5, 5, 0.01).onChange((value) => {
  cube.position.y = value;
});

// Move cube on Z axis (important for fog visibility)
positionFolder.add(settings, "posZ", -5, 5, 0.01).onChange((value) => {
  cube.position.z = value;
});

/* -------------------- VISIBILITY CONTROLS -------------------- */

const visibleFolder = gui.addFolder("Visibility");

// Toggle cube visibility
visibleFolder.add(settings, "visible").onChange((value) => {
  cube.visible = value;
});

// Toggle wireframe mode
visibleFolder.add(settings, "wireframe").onChange((value) => {
  cube.material.wireframe = value;
});

/* -------------------- COLOR CONTROLS -------------------- */

const colourFolder = gui.addFolder("Color Settings");

// Change cube color
colourFolder.addColor(settings, "color").onChange((value) => {
  cube.material.color.set(value);
});

// Change background color
colourFolder.addColor(settings, "background").onChange((value) => {
  scene.background = new THREE.Color(value);
});

// dropdown folers 
const dropdownFolder = gui.addFolder('Dropdown Controls');



// adding different geomertries
const shapeOption = {Cube: 'cube', Sphere: 'sphere', Cylender: 'cylender', Torus : 'torus'};

dropdownFolder.add(settings, 'shape', shapeOption).onChange((value)=>{
// remove previous cube

scene.remove(cube);
  cube.geometry.dispose();

  let geometry;
  if(value === 'cube') geometry = new THREE.BoxGeometry(1,1,1,10,10,10);
  if (value === "sphere") geometry = new THREE.SphereGeometry(0.7, 32, 32);
  if (value === "cylender") geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
  if(value === 'torus') geometry = new THREE.TorusGeometry(2,0.8,16,200)

  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

})

// adding different animations
const animationsOptions ={
  None : 'none',
  Rotate: 'rotate',
  Bounce: 'bounce',
}

drop.add(settings, 'animation', animationsOptions);



/* -------------------- ANIMATION LOOP -------------------- */

// Animation loop (runs every frame)
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if(settings.animation === 'rotate'){
    cube.rotation.x+= 0.01;
    cube.rotation.y += 0.01;
  }

  if(settings.animation === 'bounce'){
    cube.position.y = Math.sin(Date.now() * 0.002)*2;
  }



  // Render scene from camera perspective
  renderer.render(scene, camera);
}

// Start animation
animate();
