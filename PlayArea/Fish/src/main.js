/* =========================================================
   IMPORTS
========================================================= */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";


/* =========================================================
   GUI
========================================================= */
const gui = new GUI();
/* =========================================================
   CORE SETUP
========================================================= */

// Canvas
const canvas = document.querySelector("canvas.world");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.Fog(0x000000, 0.06, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0,0,5);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Smooth motion
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = true;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));




const UnderwaterShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uStrength: { value: 0.02 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uStrength;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // 🌊 screen-space distortion ONLY
      float waveX = sin(uv.y * 12.0 + uTime) * uStrength;
      float waveY = cos(uv.x * 12.0 + uTime) * uStrength;

      vec4 color = texture2D(tDiffuse, uv + vec2(waveX, waveY));
      gl_FragColor = color;
    }
  `
};


const underwaterPass = new ShaderPass(UnderwaterShader);
composer.addPass(underwaterPass);



/* =========================================================
   LIGHTING
========================================================= */

// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 10.03);
scene.add(ambientLight);

// Directional
const dirLight = new THREE.DirectionalLight(0xffffff, 6.40);
dirLight.position.set(5.6, 6.2, 5.4);
dirLight.castShadow = true;
scene.add(dirLight);


/* =========================================================
   MODEL LOADING
========================================================= */
const loader = new GLTFLoader();
let mixer = null;
const clock = new THREE.Clock();



let gltfModel = null;
loader.load("/models/fish.glb", (gltf) => {
  gltfModel = gltf.scene;
  gltfModel.scale.set(1, 1, 1);
  gltfModel.position.set(0, -2, 0);

  // 🎬 Animation
  mixer = new THREE.AnimationMixer(gltfModel);

  const action = mixer.clipAction(gltf.animations[0]);
  action.setLoop(THREE.LoopRepeat);
  action.timeScale = 1.5; // faster
  action.play();

  scene.add(gltfModel);
});

/* =========================================================
   ANIMATION
========================================================= */


function animate() {

  requestAnimationFrame(animate);

 const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  underwaterPass.uniforms.uTime.value += delta;
  
  composer.render();
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
