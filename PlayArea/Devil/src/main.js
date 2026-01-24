import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from 'lil-gui';
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/* =========================================================
   CORE SETUP
========================================================= */
// gui
const gui = new GUI()

// canvas
const canvas = document.querySelector('canvas.world');

// scene
const scene = new THREE.Scene();

// camera 
const camera = new THREE.PerspectiveCamera(
  100,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
)
camera.position.set(12,13,0.5)

const camFolder = gui.addFolder('Camera Position')

camFolder.add(camera.position, 'x', -50, 50, 0.01)
camFolder.add(camera.position, 'y', -50, 50, 0.01)
camFolder.add(camera.position, 'z', -50, 50, 0.01)

camFolder.open()

const rotFolder = gui.addFolder('Camera Rotation')

rotFolder.add(camera.rotation, 'x', -Math.PI, Math.PI, 0.001)
rotFolder.add(camera.rotation, 'y', -Math.PI, Math.PI, 0.001)
rotFolder.add(camera.rotation, 'z', -Math.PI, Math.PI, 0.001)

const fovFolder = gui.addFolder('Camera Lens')

fovFolder.add(camera, 'fov', 20, 100, 1).onChange(() => {
  camera.updateProjectionMatrix()
})
// renderer 
// antialias provide smooth edges
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
/* =========================================================
  Texture Loader
========================================================= */

const textureLoader = new THREE.TextureLoader()

/* =========================================================
  Orbit Controls
========================================================= */

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
/* =========================================================
  Ambient Light
========================================================= */
// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
/* =========================================================
  Hemisphere Light Light
========================================================= */
// const hemiLight = new THREE.HemisphereLight(
//   '#00ff88', // sky color
//  '#2e2eff', // ground color
//   2      // intensity
// )

// scene.add(hemiLight)

/* =========================================================
  SpotLight
========================================================= */
const spotLight = new THREE.SpotLight(
  '#114a8f', // color
  35.62,       // intensity
  23,        // distance
  0.85, // angle
  0.55,      // penumbra
  0.60          // decay
)

spotLight.position.set(0, 10, 8)
spotLight.castShadow = true

spotLight.shadow.mapSize.set(1024, 1024)
spotLight.shadow.bias = -0.0005

scene.add(spotLight)
scene.add(spotLight.target)

// Aim it at the tree (important)
spotLight.target.position.set(0, 3, 0)
/* =========================================================
  Fog
========================================================= */
scene.fog = new THREE.FogExp2(
  0x000000, // color
  0.035      // density
)

const fogFolder = gui.addFolder("Fog")

const fogParams = {
  color: `#${scene.fog.color.getHexString()}`,
  density: scene.fog.density
}

fogFolder
  .addColor(fogParams, "color")
  .onChange(v => scene.fog.color.set(v))

fogFolder
  .add(fogParams, "density", 0.001, 0.15, 0.001)
  .onChange(v => scene.fog.density = v)

fogFolder.open()


/* =========================================================
  ground
========================================================= */
const colorMap = textureLoader.load('/textures/floor1.jpg')
const heightMap = textureLoader.load('/height/height3.png')
const planeGeo = new THREE.PlaneGeometry(100, 150, 256, 256)
const planeMat = new THREE.MeshStandardMaterial({
  map: colorMap,
  displacementMap: heightMap,
  displacementScale:10,
  roughness: 1,
  metalness: 0.0
})

const ground = new THREE.Mesh(planeGeo, planeMat)
ground.rotation.x = -Math.PI / 2
ground.position.y = -8.5
ground.receiveShadow = true

scene.add(ground)



const bgTexture = textureLoader.load('/textures/grung1.jpg')
bgTexture.colorSpace = THREE.SRGBColorSpace
bgTexture.minFilter = THREE.LinearFilter
bgTexture.magFilter = THREE.LinearFilter
bgTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

const bgGeo = new THREE.SphereGeometry(50, 34, 64)
const bgMat = new THREE.MeshBasicMaterial({
  map: bgTexture,
  side: THREE.BackSide,
})


const backgroundSphere = new THREE.Mesh(bgGeo, bgMat)
backgroundSphere.rotation.y = 5;
scene.add(backgroundSphere)
/* =========================================================
  gsap
========================================================= */
const pathPoints = [
  new THREE.Vector3(35, 30, 5),
  new THREE.Vector3(25, 15, 0),
  new THREE.Vector3(15, 12, 0),
  new THREE.Vector3(5, 3, 0),
  new THREE.Vector3(2, 0, 0),
  new THREE.Vector3(0.1, -2, 0),
  new THREE.Vector3(-2,-2, 0),
  new THREE.Vector3(-5,3.5, 0),
  new THREE.Vector3(-5,10, 0),
  new THREE.Vector3(-10,15, -5),
  new THREE.Vector3(-20,15, -20),
  new THREE.Vector3(-25,15, -5),
  new THREE.Vector3(-25,15, 15),
  new THREE.Vector3(0,5, 10),
  new THREE.Vector3(0.1, -2,2),
  new THREE.Vector3(2, 0, 0),
  new THREE.Vector3(5, 3, 0),
  new THREE.Vector3(15, 12, 0),
  new THREE.Vector3(25, 15, 0),
  new THREE.Vector3(35, 30, 5),
]

const cameraPath = new THREE.CatmullRomCurve3(pathPoints)
cameraPath.curveType = "catmullrom"
cameraPath.tension = 0.5

const pathGeo = new THREE.BufferGeometry().setFromPoints(
  cameraPath.getPoints(100)
)
const pathMat = new THREE.LineBasicMaterial({ color: 0xff0000 })
const pathLine = new THREE.Line(pathGeo, pathMat)
scene.add(pathLine)

const motionState = { t: 0 }


window.addEventListener("load", () => {
  // any initial gsap setup
  gsap.set(".scroll-section", { opacity: 1 })

  gsap.to(motionState, {
  t: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".scroll-section",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    invalidateOnRefresh: true,
    markers: true
  },
  onUpdate: () => {
    const position = cameraPath.getPointAt(motionState.t)
    const lookAhead = cameraPath.getPointAt(
      Math.min(motionState.t + 0.02, 1)
    )

    camera.position.copy(position)
    camera.lookAt(
      lookAhead.x,
      lookAhead.y + 0.3,
      lookAhead.z
    )
  }
})
   // delay refresh slightly so layout + WebGL are stable
  setTimeout(() => {
    ScrollTrigger.refresh()
  }, 100)
})
/* =========================================================
  Devil Model Loading...
========================================================= */

const gltfLoader = new GLTFLoader();

let bodyModel = null;
gltfLoader.load(
  "/models/devil.glb",
  (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(1.5, 1.5, 1.5);
  bodyModel.position.y = -0.8
    scene.add(bodyModel);
  },
  (progress) => {
    console.log(
      (progress.loaded / progress.total) * 100 + "% loaded"
    );
  },
  (error) => {
    console.error("Error loading model", error);
  }
);

/* =========================================================
  Devil Tree Model Loading...
========================================================= */
let treeModel = null;

gltfLoader.load(
  "/models/devilTree.glb",
  (gltf) => {
  treeModel = gltf.scene;
  treeModel.scale.set(20.5, 20.5, 20.5);
  treeModel.position.set(-11.5,-2.0, 0)
  treeModel.rotation.y = 1.5
    scene.add(treeModel);

  },
  (progress) => {
    console.log(
      (progress.loaded / progress.total) * 100 + "% loaded"
    );
  },
  (error) => {
    console.error("Error loading model", error);
  }
);

/* =========================================================
   Animation
========================================================= */
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
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
