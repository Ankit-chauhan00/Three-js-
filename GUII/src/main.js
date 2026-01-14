import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcccccc,10, 15);
scene.background = new THREE.Color(0xcccccc);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.BoxGeometry(1,1,1,20,10,10);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00,
  wireframe: true,
 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const gui = new GUI();
const settings = { size:1 ,posX: 0, posY: 0, posZ: 0, color: "#00ff00", background: "#030659", visible : true , wireframe: true };

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);


// Size Folder
const sizeFolder = gui.addFolder("Size Controls");
sizeFolder.add(settings, "size", 0.1, 1.5, 0.1).onChange((value)=>{
  cube.scale.set(value,value,value);
})
// Position Folder

const positionFolder = gui.addFolder("Position Folder");

positionFolder.add(settings, "posX",-5,5,0.01).onChange((value)=>{
  cube.position.x = value;
})

positionFolder.add(settings, "posY",-5,5,0.01).onChange((value)=>{
  cube.position.y = value;
})

positionFolder.add(settings, "posZ",-5,5,0.01).onChange((value)=>{
  cube.position.z = value;
})

// visiblity folder

const visibleFolder = gui.addFolder("Visiblity")

visibleFolder.add(settings, "visible").onChange((value)=>{
  cube.visible = value
})

visibleFolder.add(settings,"wireframe").onChange((value)=>{
  cube.material.wireframe = value;
})

// colour settings
const colourFolder = gui.addFolder("Color Settings")

colourFolder.addColor(settings,"color").onChange((value)=>{
  cube.material.color.set(value);
})
colourFolder.addColor(settings,"background").onChange((value)=>{
  scene.background = new THREE.Color(value);
})

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y+= 0.01
  renderer.render(scene, camera);
}

animate();