import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// canvas 
const canvas = document.querySelector('canvas.world');

//Scene

const scene = new THREE.Scene();

// camera (fov,Aspect Ratio,min distance, max distance )

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// by default camera is at center so nothing visible 
camera.position.set(0,5,5);
camera.lookAt(0,0,0);

// create renderer and append it in html
const renderer = new THREE.WebGLRenderer({canvas: canvas});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene,camera);
document.body.appendChild(renderer.domElement);

// add orbit controls

const controls = new OrbitControls(camera, renderer.domElement);

// create a geometry 
const geometry = new THREE.PlaneGeometry(5,3,32,32);

// create material
const material  = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
})

const cube1 = new THREE.Mesh(geometry, material);
const cube2 = new THREE.Mesh(geometry, material);
const cube3 = new THREE.Mesh(geometry, material);
//  Animation Variables
let angle1= 0;
let angle2 = 0;
 
const radius = 2;
const speed1 = 0.005;
const speed2 = 0.004;


// cube.rotation.x = Math.PI/4; // 180/4 = 45
// cube.rotation.y = Math.PI / 2; // Rotate 90 degrees around the y-axis
// cube.rotation.z = Math.PI; // Rotate 180 degrees around the z-axis

// instead of the above we can use both are same

scene.add(cube1, cube2, cube3);

// function animate(){
//   requestAnimationFrame(animate);
//   controls.update();
//   // rotate  cube2 around cube1
//   angle += speed;
//   cube2.position.x = Math.cos(angle) * radius;
//   cube2.position.z = Math.sin(angle) * radius;
//   cube3.position.x = Math.cos(angle) * 2 *radius
//   cube3.position.z = Math.sin(angle) * 2 * radius;


//   // cube1.rotation.y+= degreesToRadians(1);
//   // cube1.position.y = Math.tan(Date.now() * 0.001) * 1 
// //Date.now() is NOT human time
// //It is a continuously increasing counter, perfect for animation
//   renderer.render(scene,camera)
//}
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  angle1 += speed1;
  angle2 += speed2;
  // ORBIT motion
  cube2.position.x = Math.cos(angle1) * 1.25 *radius;
  cube2.position.z = Math.sin(angle1) * radius;

  cube3.position.x = Math.cos(angle2) * 2 * radius;
  cube3.position.z = Math.sin(angle2) * 2 * radius;

// scaling the cube3
// const scalingFactor = 1 + Math.sin(Date.now() * 0.0009) * 0.5;
// cube3.scale.set(2*scalingFactor, 2* scalingFactor , 2 *scalingFactor);

  // SELF rotation (own axis)
  cube1.rotation.y += 0.01;
  cube2.rotation.y += 0.02;
  cube3.rotation.y += 0.03;

  renderer.render(scene, camera);
}
animate()


// function from degree to radians
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

//cube.scale.multiplyScalar(1.5); // Grows 50%