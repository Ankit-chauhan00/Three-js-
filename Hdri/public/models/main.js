import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


const canvas = document.querySelector('canvas.world')

// Scene
const scene = new THREE.Scene()
scene.background = null

const camera = new THREE.PerspectiveCamera(75,window.innerWidth/ window.innerHeight, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0
scene.add(camera)

const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;



new HDRLoader()
  .load("/hdri/background.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    scene.background = texture
  })

  console.log(THREE.REVISION)

  let gltfModel = null;


const loader = new GLTFLoader();

loader.load(
  "/models/scene.gltf",   // ✅ correct path for your setup
  (gltf) => {
    gltfModel = gltf.scene;

    // DEBUG SAFE VALUES
    gltfModel.scale.set(1.2, 1.2, 1.2);
    gltfModel.position.set(0, -2, 0);

});

/* =========================================================
   Animation
========================================================= */
function animate() {
  requestAnimationFrame(animate)

  controls.update()

 if (scene.environment) {
  const azimuth = controls.getAzimuthalAngle()
  scene.environmentRotation = azimuth
  scene.backgroundRotation = azimuth
}

  renderer.render(scene, camera)
}
animate();

/* =========================================================
   RESIZE
========================================================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});