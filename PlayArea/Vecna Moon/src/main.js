/* =========================================================
   IMPORTS
========================================================= */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from "lil-gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
/* =========================================================
   BASIC SETUP
========================================================= */

// Canvas
const canvas = document.querySelector("canvas.world");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Fog
scene.fog = new THREE.Fog(0x000000, 6, 18);

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0.22, 1.55, 1.85);
// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minPolarAngle = Math.PI * 0.35;
controls.maxPolarAngle = Math.PI * 0.55;
controls.minDistance = 1.7;
controls.maxDistance = 2.0;
 // slight off-center

controls.enablePan = false; // optional but recommended
/* =========================================================
  Bloom composer make the Vecna Glow
========================================================= */
// const composer = new EffectComposer(renderer);
// composer.addPass(new RenderPass(scene, camera));

// const bloomPass = new UnrealBloomPass(
//   new THREE.Vector2(window.innerWidth, window.innerHeight),
//   0,   // strength
//   0,   // radius
//   0    // threshold
// );
// composer.addPass(bloomPass);
/* =========================================================
   GUI SETUP
========================================================= */

const gui = new GUI();

/* ---------------- Camera Controls ---------------- */

// const cameraConfig = { posX: 5, posY: 6, posZ: 3 };

// const cameraFolder = gui.addFolder("Camera Position");
// cameraFolder.add(cameraConfig, "posX", -10, 10, 0.1).onChange(v => camera.position.x = v);
// cameraFolder.add(cameraConfig, "posY", -10, 10, 0.1).onChange(v => camera.position.y = v);
// cameraFolder.add(cameraConfig, "posZ", -10, 20, 0.1).onChange(v => camera.position.z = v);

/* ---------------- Model Controls ---------------- */

let gltfModel = null;

const vecnaControls = {
  posX: 0,
  posY: -2,
  posZ: 0,
  scale: 1.2
};
const vecnaFolder = gui.addFolder("Vecna Controls");
vecnaFolder.add(vecnaControls, "posX", -4, 4, 0.1).onChange(v => gltfModel && (gltfModel.position.x = v));
vecnaFolder.add(vecnaControls, "posY", -2, 10, 0.1).onChange(v => gltfModel && (gltfModel.position.y = v));
vecnaFolder.add(vecnaControls, "posZ", -2, 2, 0.1).onChange(v => gltfModel && (gltfModel.position.z = v));
vecnaFolder.add(vecnaControls, "scale", 0.2, 2, 0.1).onChange(v => {
  if (gltfModel) gltfModel.scale.set(v, v, v);
});

/* =========================================================
   LIGHTING
========================================================= */

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.03);
scene.add(ambientLight);
gui.add(ambientLight, "intensity", 0, 10, 0).name("Ambient Light");

// Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff, 6.40);
dirLight.position.set(5.6, 6.2, 5.4);
dirLight.castShadow = true;
scene.add(dirLight);

// Shadow settings
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 20;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;

// Directional Light GUI
const lightConfig = {
  posX: 5,
  posY: 10,
  posZ: 5,
  intensity: 0
};

const lightFolder = gui.addFolder("Directional Light");
lightFolder.add(lightConfig, "posX", -10, 10, 0.1).onChange(v => dirLight.position.x = v);
lightFolder.add(lightConfig, "posY", -10, 10, 0.1).onChange(v => dirLight.position.y = v);
lightFolder.add(lightConfig, "posZ", -10, 20, 0.1).onChange(v => dirLight.position.z = v);
lightFolder.add(lightConfig, "intensity", 0, 50, 0.1).onChange(v => dirLight.intensity = v);

/* =========================================================
   making camera look at head
========================================================= */
const vecnaHead = new THREE.Vector3();
let vecnaHeadObject = null; // optional bone

const targetDebug = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: "red" })
);
scene.add(targetDebug);

/* =========================================================
   GLTF MODEL LOADING
========================================================= */

const loader = new GLTFLoader();
const vecnaMaterialConfig = { color: "#1ad9ff" };

loader.load(
  "/models/scene.gltf",
  (gltf) => {
    gltfModel = gltf.scene;

    gltfModel.scale.set(1.2, 1.2, 1.2);
    gltfModel.position.set(0, 2, 0);

    vecnaHeadObject =
    gltfModel.getObjectByName("Head") ||
    gltfModel.getObjectByName("mixamorigHead") ||
    null;

    gltfModel.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // child.material.emissive = new THREE.Color("#1ad9ff");
        // child.material.emissiveIntensity = 0.8;
//         bloomPass.strength = 1.0;
// bloomPass.radius = 0.7;
// bloomPass.threshold = 0.25;
        child.material.color.set(vecnaMaterialConfig.color);
      }
    });

    gui.addColor(vecnaMaterialConfig, "color")
      .name("Vecna Color")
      .onChange(value => {
        gltfModel.traverse(child => {
          if (child.isMesh) child.material.color.set(value);
        });
      });

    scene.add(gltfModel);
  },
  undefined,
  error => console.error("GLTF Load Error:", error)
);
/* =========================================================
   Point Light
========================================================= */

// 👁️ Under-face horror light
const underLight = new THREE.PointLight(
  0x223344, // cold blue-gray
  0.8,      // intensity
  3,        // distance
  2         // decay
);

// Slightly below face, close to camera
underLight.position.set(0.1, 1.2, 1.3);

scene.add(underLight);

/* =========================================================
  Fake VOLUMETRIC CONE (light beam)
========================================================= */
const coneGeo = new THREE.ConeGeometry(1.2, 4, 32, 1, true);
const coneMat = new THREE.MeshBasicMaterial({
  color: 0x66ccff,
  transparent: true,
  opacity: 0.6,
  depthWrite: false,
  side: THREE.DoubleSide
});

const lightCone = new THREE.Mesh(coneGeo, coneMat);

// Match spotlight direction
lightCone.position.set(1.2, 4.2, 2);
lightCone.rotation.x = Math.PI;
scene.add(lightCone);

/* =========================================================
   FLOOR
========================================================= */

const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load("../models/textures/watertexture.png");
const heightMap = textureLoader.load("../models/textures/water1.jpg");

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50, 100, 100),
  new THREE.MeshStandardMaterial({
    map: floorTexture,
    displacementMap: heightMap,
    displacementScale: 1.1,
    color: "skyblue"
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.5;
floor.receiveShadow = true;
scene.add(floor);

/* =========================================================
   STAR PARTICLES
========================================================= */

const starCount = 20000;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPositions[i * 3]     = THREE.MathUtils.randFloatSpread(40);
  starPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(50);
  starPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-10, 10);
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.042,
  map: createGlowTexture(),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  opacity: 0.5
});

const stars = new THREE.Points(starGeometry, starMaterial);
stars.position.set(0, 1, -2);
stars.rotation.x = Math.PI / 2;
scene.add(stars);

/* =========================================================
   HELPERS
========================================================= */

function createGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

/* =========================================================
   ANIMATION LOOP
========================================================= */
const starPositionsArray = starGeometry.attributes.position.array;
const starBasePositions = new Float32Array(starPositionsArray.length);

starBasePositions.set(starPositionsArray);

function animateStars(time) {
  const t = time * 0.001;

  for (let i = 0; i < starCount; i++) {
    const index = i * 3;

    // Subtle floating motion on Y-axis
    starPositionsArray[index + 1] =
      starBasePositions[index + 1] +
      Math.sin(t + i * 0.1) * 0.3;

    // Optional slight Z drift (depth feel)
    starPositionsArray[index + 2] =
      starBasePositions[index + 2] +
      Math.cos(t + i * 0.05) * 0.15;
  }

  starGeometry.attributes.position.needsUpdate = true;
}
/* =========================================================
 Spot light
========================================================= */
const spotLight = new THREE.SpotLight(
  0x66ccff,   // cold cyan (horror)
  6,          // intensity
  15,         // distance
  Math.PI / 8,// tight cone
  0.5,        // soft edge
  2           // decay
);

// Horror angle: top + side
spotLight.position.set(1.2, 4.5, 2);

// Aim at face
spotLight.target.position.set(0, 1.8, 0);

spotLight.castShadow = true;
spotLight.shadow.mapSize.set(2048, 2048);
spotLight.shadow.bias = -0.0005;

scene.add(spotLight);
scene.add(spotLight.target);





/* =========================================================
 Hemisphere Light
========================================================= */

const hemiLight = new THREE.HemisphereLight(
  0x88ccff, // sky color
  0x222222, // ground color
  0.03      // intensity
);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

/* =========================================================
Rim Light
========================================================= */
// Rim Light (back light to separate model)
const rimLight = new THREE.DirectionalLight(0x66ccff, 0);
rimLight.position.set(-5, 4, -6); // behind the model
scene.add(rimLight);

// GUI controls
const rimFolder = gui.addFolder("Rim Light");
rimFolder.add(rimLight.position, "x", -10, 10, 0.1);
rimFolder.add(rimLight.position, "y", -10, 10, 0.1);
rimFolder.add(rimLight.position, "z", -10, 10, 0.1);
rimFolder.add(rimLight, "intensity", 0, 5, 0.1);

/* =========================================================
 Background Control
========================================================= */

const bgConfig ={
  background: '#000000',
}
scene.background.set('#000000')

gui.addColor(bgConfig, "background").name("Background Color").onChange((value)=>{
  scene.background.set(value);
})





/* =========================================================
   Animate Model
========================================================= */
function animateModel(time) {
   if (!gltfModel) return;

  const t = time * 0.001;

  // const pulse = 0.6 + Math.sin(t * 2) * 0.25;

  // gltfModel.traverse(child => {
  //   if (child.isMesh && child.material.emissive) {
  //     child.material.emissiveIntensity = pulse;
  //   }
  // });

  gltfModel.position.y =
    vecnaControls.posY + Math.sin(t * 1.5) * 0.08;

  gltfModel.rotation.y = Math.sin(t * 0.4) * 0.08;
}

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.35, // strength
  0.25, // radius
  0.4 // threshold
);

composer.addPass(bloomPass);

/* =========================================================
 color shader
========================================================= */
const ColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tint: { value: new THREE.Vector3(0.85, 0.95, 1.1) },
    contrast: { value: 1.08 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 tint;
    uniform float contrast;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb *= tint;
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;
      gl_FragColor = color;
    }
  `
};

const colorGradePass = new ShaderPass(ColorGradeShader);
composer.addPass(colorGradePass);



function animate() {
  requestAnimationFrame(animate);
   animateStars(performance.now()); // ⭐ particle animation
   animateModel(performance.now()); 

   if (gltfModel) {
    if (vecnaHeadObject) {
      // 🎯 Exact face lock
      vecnaHeadObject.getWorldPosition(vecnaHead);
    } else {
      // Fallback: approximate face height
      gltfModel.getWorldPosition(vecnaHead);
      vecnaHead.y += 2.4;
    }

    controls.target.lerp(vecnaHead, 0.08); // smooth look
  }
  targetDebug.position.copy(controls.target);

  const t = performance.now() * 0.001;



// camera.position.x += Math.sin(t * 0.6) * 0.001;
// camera.position.y += Math.sin(t * 0.8) * 0.0008;
// spotLight.intensity = 5.5 + Math.sin(t * 6.5) * 0.4 + Math.random() * 0.15;

  controls.update();
 composer.render();
}
animate();

/* =========================================================
   RESIZE HANDLER
========================================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
