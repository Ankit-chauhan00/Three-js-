
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib";
import GUI from "lil-gui";

// Init RectAreaLight uniforms
RectAreaLightUniformsLib.init();

// Scene, camera, renderer
const scene = new THREE.Scene();
const canvas = document.querySelector("canvas.world");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 2, 10);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lights config
const config = {
  wireframe: false,
  color: "#ffffff",
  roughness: 0.4,

  // Rect Light 1 - Green
  color1: "#37ff00",
  intensity1: 20,
  width1: 4,
  height1: 10,
  x1: -5,
  y1: 2,
  z1: -5,

  // Rect Light 2 - Red
  color2: "#ff0000",
  intensity2: 20,
  width2: 4,
  height2: 10,
  x2: 0,
  y2: 2,
  z2: -5,

  // Rect Light 3 - Blue
  color3: "#0008ff",
  intensity3: 20,
  width3: 4,
  height3: 10,
  x3: 5,
  y3: 2,
  z3: -5,
};

// GUI
const gui = new GUI();
gui.add(config, "wireframe");
gui.addColor(config, "color");
gui.add(config, "roughness", 0, 1, 0.01);

// Material
const material = new THREE.MeshPhysicalMaterial({
  color: config.color,
  roughness: config.roughness,
  metalness: 0.5,
});

// Geometry
const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
sphere1.position.x = -3;

const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
sphere2.position.x = 3;

const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16),
  material
);
scene.add(sphere1, sphere2, knot);

// Plane (floor)
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.3 })
);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2;
scene.add(plane);

// Ambient Light
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// === RectAreaLights ===
const rectLight1 = new THREE.RectAreaLight(
  config.color1,
  config.intensity1,
  config.width1,
  config.height1
);
rectLight1.position.set(config.x1, config.y1, config.z1);
rectLight1.rotation.y = Math.PI;
scene.add(rectLight1);
scene.add(new RectAreaLightHelper(rectLight1));

const rectLight2 = new THREE.RectAreaLight(
  config.color2,
  config.intensity2,
  config.width2,
  config.height2
);
rectLight2.position.set(config.x2, config.y2, config.z2);
rectLight2.rotation.y = Math.PI;
scene.add(rectLight2);
scene.add(new RectAreaLightHelper(rectLight2));

const rectLight3 = new THREE.RectAreaLight(
  config.color3,
  config.intensity3,
  config.width3,
  config.height3
);
rectLight3.position.set(config.x3, config.y3, config.z3);
rectLight3.rotation.y = Math.PI;
scene.add(rectLight3);
scene.add(new RectAreaLightHelper(rectLight3));

// === Light GUI folders ===
const f1 = gui.addFolder("Light 1 (Green)");
f1.addColor(config, "color1").onChange(() =>
  rectLight1.color.set(config.color1)
);
f1.add(config, "intensity1", 0, 50).onChange(
  () => (rectLight1.intensity = config.intensity1)
);
f1.add(config, "width1", 0, 20).onChange(
  () => (rectLight1.width = config.width1)
);
f1.add(config, "height1", 0, 20).onChange(
  () => (rectLight1.height = config.height1)
);
f1.add(config, "x1", -10, 10).onChange(
  () => (rectLight1.position.x = config.x1)
);
f1.add(config, "y1", -10, 10).onChange(
  () => (rectLight1.position.y = config.y1)
);
f1.add(config, "z1", -10, 10).onChange(
  () => (rectLight1.position.z = config.z1)
);

const f2 = gui.addFolder("Light 2 (Red)");
f2.addColor(config, "color2").onChange(() =>
  rectLight2.color.set(config.color2)
);
f2.add(config, "intensity2", 0, 50).onChange(
  () => (rectLight2.intensity = config.intensity2)
);
f2.add(config, "width2", 0, 20).onChange(
  () => (rectLight2.width = config.width2)
);
f2.add(config, "height2", 0, 20).onChange(
  () => (rectLight2.height = config.height2)
);
f2.add(config, "x2", -10, 10).onChange(
  () => (rectLight2.position.x = config.x2)
);
f2.add(config, "y2", -10, 10).onChange(
  () => (rectLight2.position.y = config.y2)
);
f2.add(config, "z2", -10, 10).onChange(
  () => (rectLight2.position.z = config.z2)
);

const f3 = gui.addFolder("Light 3 (Blue)");
f3.addColor(config, "color3").onChange(() =>
  rectLight3.color.set(config.color3)
);
f3.add(config, "intensity3", 0, 50).onChange(
  () => (rectLight3.intensity = config.intensity3)
);
f3.add(config, "width3", 0, 20).onChange(
  () => (rectLight3.width = config.width3)
);
f3.add(config, "height3", 0, 20).onChange(
  () => (rectLight3.height = config.height3)
);
f3.add(config, "x3", -10, 10).onChange(
  () => (rectLight3.position.x = config.x3)
);
f3.add(config, "y3", -10, 10).onChange(
  () => (rectLight3.position.y = config.y3)
);
f3.add(config, "z3", -10, 10).onChange(
  () => (rectLight3.position.z = config.z3)
);

// Animate
function animate() {
  requestAnimationFrame(animate);

  // GUI controls
  material.wireframe = config.wireframe;
  material.color.set(config.color);
  material.roughness = config.roughness;

  knot.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
}

animate();
