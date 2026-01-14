import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import GUI from "lil-gui";

// PointLight
// doc - https://threejs.org/docs/index.html?q=light#api/en/lights/PointLight
// A light that gets emitted from a single point in all directions. A common use case for this is to replicate the light emitted from a bare lightbulb.

const gui = new GUI();

const config = {
  wireframe: false,
  visibleToggle: function () {
    sphere.visible = !sphere.visible;
  },
  meshColor: "#00ff00",
  roughness: 0.5,
  lightColor: "#8338ec",
  intensity: 100,
  distance: 0,
  power: 1700,
  posX: 5, // Add a number property
  posY: 2, // Add a number property
  posZ: 3, // Add a number property
  // we will add rotation properties bec we want to show that lights are not effected by rotation
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  // pointLight2
  lightColor2: "#c1121f",
  intensity2: 100,
  distance2: 0,
  power2: 1700,
  posX2: -5, // Add a number property
  posY2: 2, // Add a number property
  posZ2: 3, // Add a number property
  // we will add rotation properties bec we want to show that lights are not effected by rotation
  rotationX2: 0,
  rotationY2: 0,
  rotationZ2: 0,
};

gui.add(config, "wireframe");
gui.add(config, "visibleToggle");
gui.addColor(config, "meshColor");
gui.add(config, "roughness", 0, 1, 0.01);
const pointLightFolder = gui.addFolder("Point Light 1");
pointLightFolder.addColor(config, "lightColor");
pointLightFolder.add(config, "intensity", 0, 100, 0.1);
pointLightFolder.add(config, "distance", 0, 10, 0.1);
pointLightFolder.add(config, "power", 0, 2000, 1);
const folder = gui.addFolder("Position");
folder.add(config, "posX", -10, 10, 0.01);
folder.add(config, "posY", -10, 10, 0.01);
folder.add(config, "posZ", -10, 10, 0.01);
const rotationfolder = gui.addFolder("Rotation");
rotationfolder.add(config, "rotationX", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationY", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationZ", -Math.PI, Math.PI, 0.01);
const pointLightFolder2 = gui.addFolder("Point Light 2");
pointLightFolder2.addColor(config, "lightColor2");
pointLightFolder2.add(config, "intensity2", 0, 100, 0.1);
pointLightFolder2.add(config, "distance2", 0, 10, 0.1);
pointLightFolder2.add(config, "power2", 0, 2000, 1);
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

// Create a camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
scene.add(camera);

// Create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// 1️⃣ Enable renderer shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
document.body.appendChild(renderer.domElement);

// Add OrbitControls to the camera
const controls = new OrbitControls(camera, renderer.domElement);

// Create an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Color, intensity
scene.add(ambientLight);

// Create a point light
const pointLight = new THREE.PointLight("#8338ec", 1, 5); // Color, intensity, distance
// color: The color of the light.
// intensity: strength of the light (higher values create brighter lights).
// distance: maximum distance from the point light source where objects are affected by the light -> Float -> default: 0, (infinite range).
// decay: The amount the light dims along the distance of the light -> Float -> Default 2
// The light's power.
// Power is the luminous power of the light measured in lumens (lm).
// Changing the power will also change the light's intensity. So it's the same with intensity.
// uncomment this and line 176
// pointLight.power = 1000;
pointLight.position.set(5, 2, 3); // Set position
pointLight.castShadow = true
scene.add(pointLight);

const pointLight2 = new THREE.PointLight("#c1121f", 1); // Color, intensity, distance
pointLight2.position.set(-5, 2, 3); // Set position
pointLight2.castShadow = true;
scene.add(pointLight2);

// Shadow quality
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;



// you have to update helpers in animate loop to work prperly
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

const pointLightHelper2 = new THREE.PointLightHelper(pointLight2);
scene.add(pointLightHelper2);

// Create a geometry
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({
  color: "#0d4f0d",
  wireframe: false,
  visible: true,
  roughness: 0.5,
});
const sphere = new THREE.Mesh(geometry, material);
sphere.position.x = 2;
scene.add(sphere);

// MeshBasicMaterial - does not respond to lighting
const geometry2 = new THREE.SphereGeometry(1, 32, 32);
const material2 = new THREE.MeshStandardMaterial({
  color: "violet",
});
const sphere2 = new THREE.Mesh(geometry2, material2);
sphere2.position.x = -2;
scene.add(sphere2);

sphere.castShadow = true
sphere2.castShadow = true


// Create a plane for a floor
const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -2;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

plane.receiveShadow = true

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update the helpers
  pointLightHelper.update();
  pointLightHelper2.update();

  controls.update(); // Update the controls

  // change with lil-gui
  sphere.material.wireframe = config.wireframe;
  sphere.material.color.set(config.meshColor);
  sphere.material.roughness = config.roughness;
  pointLight.color.set(config.lightColor);
  pointLight.intensity = config.intensity;
  pointLight.distance = config.distance;
  // pointLight.power = config.power;
  pointLight.position.x = config.posX;
  pointLight.position.y = config.posY;
  pointLight.position.z = config.posZ;
  pointLight.rotation.x = config.rotationX;
  pointLight.rotation.y = config.rotationY;
  pointLight.rotation.z = config.rotationZ;
  // pointLight2
  pointLight2.color.set(config.lightColor2);
  pointLight2.intensity = config.intensity2;
  pointLight2.distance = config.distance2;
  // pointLight2.power = config.power2;
  pointLight2.position.x = config.posX2;
  pointLight2.position.y = config.posY2;
  pointLight2.position.z = config.posZ2;
  pointLight2.rotation.x = config.rotationX2;
  pointLight2.rotation.y = config.rotationY2;
  pointLight2.rotation.z = config.rotationZ2;

  // Render the scene
  renderer.render(scene, camera);
}

// Start the animation loop
animate();