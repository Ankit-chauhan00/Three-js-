import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from "lil-gui";

const gui = new GUI();

const config = {
  wireframe: false,
  visibleToggle : function () {
    sphere.visible = !sphere.visible;
  },
  meshColor: '#003049',
  lightColor : '#312dfb',
  intensity: 16.81,
  posX : 2,
  posY : 1,
  posZ : 4,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
}

gui.add(config, "wireframe");
gui.add(config, "visibleToggle");
gui.addColor(config, "meshColor");
gui.addColor(config, "lightColor");
gui.add(config, "intensity", 0, 50, 0.01);
const folder = gui.addFolder("Position");
folder.add(config, "posX", -10, 10, 0.01);
folder.add(config, "posY", -10, 10, 0.01);
folder.add(config, "posZ", -10, 10, 0.01);
const rotationfolder = gui.addFolder("Rotation");
rotationfolder.add(config, "rotationX", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationY", -Math.PI, Math.PI, 0.01);
rotationfolder.add(config, "rotationZ", -Math.PI, Math.PI, 0.01);

// canvas
const canvas = document.querySelector("canvas.world");

//create a scene 
const scene = new THREE.Scene();

//create a camera

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

camera.position.x = 2;
camera.position.y = 3;
camera.position.z = 5;

scene.add(camera);

//create a renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);


const controls = new OrbitControls(camera, renderer.domElement);

// create a ambinenet light
const ambientLight = new THREE.AmbientLight(0xffffff,1);
scene.add(ambientLight);

// create a direction light
const directionalLight =  new THREE.DirectionalLight("#caf0f8",0.8);
directionalLight.position.set(2,1,4);
scene.add(directionalLight);

//Create different  geometries
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x003049,
});
const sphere = new THREE.Mesh(geometry, material);
sphere.position.x = -4.5;
scene.add(sphere);

const geometryBox = new THREE.BoxGeometry(1, 1, 1);
const materialBox = new THREE.MeshStandardMaterial({
  color: 0xff0054,
});
const box = new THREE.Mesh(geometryBox, materialBox);
box.position.x = -2;
scene.add(box);

const geometryCylinder = new THREE.CylinderGeometry(1, 1, 1, 32);
const materialCylinder = new THREE.MeshStandardMaterial({
  color: 0x3a0ca3,
});
const cylinder = new THREE.Mesh(geometryCylinder, materialCylinder);
cylinder.position.x = 0.5;
scene.add(cylinder);

const geometry2 = new THREE.SphereGeometry(1, 32, 32);
const material2 = new THREE.MeshStandardMaterial({
  color: 0xff0000,
});
const sphere2 = new THREE.Mesh(geometry2, material2);
sphere2.position.x = 3;
scene.add(sphere2);

// Create a plane for a floor
const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: "#333d29" });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -2;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);


// helpers 

const helper1 = new THREE.DirectionalLightHelper(directionalLight,2)
scene.add(helper1);
const helper2 = new THREE.DirectionalLightHelper(dirLignt2,2)
scene.add(helper2);

//Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // change with lil-gui
  sphere.material.wireframe = config.wireframe;
  sphere.material.color.set(config.meshColor);
  directionalLight.color.set(config.lightColor);
  directionalLight.intensity = config.intensity;
  directionalLight.position.x = config.posX;
  directionalLight.position.y = config.posY;
  directionalLight.position.z = config.posZ;
  directionalLight.rotation.x = config.rotationX;
  directionalLight.rotation.y = config.rotationY;
  directionalLight.rotation.z = config.rotationZ;

  //animate diirection ligt while rotating in a circle
  directionalLight.position.x+= Math.sin(Date.now()* 0.0001) * 10
  directionalLight.position.z+= Math.cos(Date.now()* 0.0001) * 10

  controls.update(); // Update the controls

  // Render the scene
  renderer.render(scene, camera);
}
animate();