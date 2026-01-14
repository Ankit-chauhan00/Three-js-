import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI  from 'lil-gui';


const gui = new GUI();
const config = {
  wireframe: false,
  visibleToggle: function () {
    sphere.visible = !sphere.visible; // only sphere 1 wil be effected
  },
  meshColor: "#00ffe1",
  roughness: 1,
  lightColor: "#00ff33",
  intensity: 100,
  distance: 10,
  angle: 1.57,
  penumbra: 0.2,
  decay: 2,
  posX: 0, // Add a number property
  posY: 5, // Add a number property
  posZ: 3, // Add a number property
  // we will add rotation properties bec we want to show that lights are not effected by rotation
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  // spotLight2
  lightColor2: "#9d4edd",
  intensity2: 100,
  distance2: 0,
  angle2: 0.59,
  penumbra2: 0.2,
  decay2: 2,
  power2: 1700,
  posX2: -2, // Add a number property
  posY2: 5, // Add a number property
  posZ2: -3, // Add a number property
  // we will add rotation properties bec we want to show that lights are not effected by rotation
  rotationX2: 0,
  rotationY2: 0,
  rotationZ2: 0,
};


gui.add(config, "wireframe");
gui.add(config, "visibleToggle");
gui.addColor(config, "meshColor");
gui.add(config, "roughness", 0, 1, 0.01);
const spotLightFolder = gui.addFolder("Spot Light 1");
spotLightFolder.addColor(config, "lightColor");
spotLightFolder.add(config, "intensity", 10, 100, 0.1);
spotLightFolder.add(config, "distance", 0, 10, 0.1);
spotLightFolder.add(config, "angle", 0, Math.PI, 0.01);
spotLightFolder.add(config, "penumbra", 0, 1, 0.01);
spotLightFolder.add(config, "decay", 1, 10, 0.01);
const folder = gui.addFolder("Position");
folder.add(config, "posX", -10, 10, 0.01);
folder.add(config, "posY", -10, 10, 0.01);
folder.add(config, "posZ", -10, 10, 0.01);
const rotationfolder = gui.addFolder("Rotation");
rotationfolder.add(config, "rotationX", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationY", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationZ", -Math.PI, Math.PI, 0.01);

// spotlight 2
const spotLightFolder2 = gui.addFolder("Spot Light 2");
spotLightFolder2.addColor(config, "lightColor2");
spotLightFolder2.add(config, "intensity2", 0, 100, 0.1);
spotLightFolder2.add(config, "distance2", 0, 10, 0.1);
spotLightFolder2.add(config, "angle2", 0, Math.PI, 0.01);
spotLightFolder2.add(config, "penumbra2", 0, 1, 0.01);
spotLightFolder2.add(config, "decay2", 1, 10, 0.01);
spotLightFolder2.add(config, "power2", 0, 2000, 1);
const folder2 = gui.addFolder("Position");
folder2.add(config, "posX2", -10, 10, 0.01);
folder2.add(config, "posY2", -10, 10, 0.01);
folder2.add(config, "posZ2", -10, 10, 0.01);
const rotationfolder2 = gui.addFolder("Rotation");
rotationfolder2.add(config, "rotationX2", -Math.PI, Math.PI, 0.01);
rotationfolder2.add(config, "rotationY2", -Math.PI, Math.PI, 0.01);
rotationfolder2.add(config, "rotationZ2", -Math.PI, Math.PI, 0.01);


// Canvas
const canvas = document.querySelector("canvas.world");

// Create a scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 10;
camera.position.y = 5;
scene.add(camera);

// Create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
document.body.appendChild(renderer.domElement);


// Add OrbitControls to the camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;

// Create various geometries and materials
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const icosahedronGeometry = new THREE.IcosahedronGeometry(1, 0);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const coneGeometry = new THREE.ConeGeometry(1, 2, 32);


const sphereMaterial = new THREE.MeshStandardMaterial({
  color: "#00b8a2",
  roughness: 0,
  wireframe: false,
});
const icosahedronMaterial = new THREE.MeshStandardMaterial({
  color: "#fffa00",
  roughness: 0,
  wireframe: false,
});
const boxMaterial = new THREE.MeshStandardMaterial({
  color: "#ff5733",
  roughness: 0,
  wireframe: false,
});
const coneMaterial = new THREE.MeshStandardMaterial({
  color: "#4a00e0",
  roughness: 0,
  wireframe: false,
});

// Create meshes with different geometries
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(-3, 0, 0);

const ico = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
ico.position.set(3, 0, 2);

const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0, -3);

const cone = new THREE.Mesh(coneGeometry, coneMaterial);
cone.position.set(0, 0, 3);

// Add all objects to the scene
scene.add(sphere, ico, box, cone);

// Create a plane for a floor
const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -2;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


// Spotlight with properties
const spotlight = new THREE.SpotLight("#ffd60a", 10, 10, Math.PI / 2, 0.2, 2); // Color, intensity, distance, angle, penumbra, decay
spotlight.position.set(0, 5, 3);
scene.add(spotlight);

// spotlight 2
const spotLight2 = new THREE.SpotLight("#9d4edd", 1, 10, Math.PI / 2, 0.2, 2); // Color, intensity, distance, angle, penumbra, decay
spotLight2.position.set(-2, 5, -3);
scene.add(spotLight2);


// helpers
// const spotLightHelper = new THREE.SpotLightHelper(spotlight);
// scene.add(spotLightHelper);
// const spotLight2Helper = new THREE.SpotLightHelper(spotLight2);
// scene.add(spotLight2Helper);

// 1️⃣ Enable renderer shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

spotlight.castShadow = true;
spotLight2.castShadow = true;

// Shadow quality
spotlight.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;

sphere.castShadow = true;
ico.castShadow = true;
box.castShadow = true;
cone.castShadow = true;
plane.receiveShadow = true;



// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // change with lil-gui
  sphere.material.wireframe = config.wireframe;
  sphere.material.color.set(config.meshColor);
  sphere.material.roughness = config.roughness;
  spotlight.color.set(config.lightColor);
  spotlight.intensity = config.intensity;
  spotlight.distance = config.distance;
  spotlight.angle = config.angle;
  spotlight.penumbra = config.penumbra;
  spotlight.decay = config.decay;
  spotlight.position.x = config.posX;
  spotlight.position.y = config.posY;
  spotlight.position.z = config.posZ;
  spotlight.rotation.x = config.rotationX;
  spotlight.rotation.y = config.rotationY;
  spotlight.rotation.z = config.rotationZ;
  // spotLight2
  spotLight2.color.set(config.lightColor2);
  spotLight2.intensity = config.intensity2;
  spotLight2.distance = config.distance2;
  spotLight2.angle = config.angle2;
  spotLight2.penumbra = config.penumbra2;
  spotLight2.decay = config.decay2;
  // spotLight2.power = config.power2;
  spotLight2.position.x = config.posX2;
  spotLight2.position.y = config.posY2;
  spotLight2.position.z = config.posZ2;
  spotLight2.rotation.x = config.rotationX2;
  spotLight2.rotation.y = config.rotationY2;
  spotLight2.rotation.z = config.rotationZ2;

  // helpers update
  // spotLightHelper.update();
  // spotLight2Helper.update();

  controls.update(); // Update the controls

  cone.rotation.x += 0.01;
  cone.rotation.y += 0.01;
  cone.rotation.z += 0.01;
  ico.rotation.x += 0.01;
  ico.rotation.y += 0.01;
  box.rotation.y +=0.01;
  sphere.rotation.y += 0.01;
  plane.rotation.z += 0.01;

  // Render the scene
  renderer.render(scene, camera);
}


// Start the animation loop
animate();