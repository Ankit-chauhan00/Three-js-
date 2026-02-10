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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
gsap.registerPlugin(ScrollTrigger,MotionPathPlugin);

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
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);


// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Controls

// Smooth motion
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;


controls.autoRotate = true;
controls.enabled = true;
camera.position.set(0.22, 1.55, 1.85);


// Pan control
controls.enablePan = true;

// Target (what camera looks at)
controls.target.set(0, 1.6, 0);
controls.update();

controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;

// Pause auto-rotate on user input
controls.addEventListener("start", () => {
  controls.autoRotate = false;
});





// Disable controls during intro
const camFolder = gui.addFolder("Camera Position");

camFolder.add(camera.position, "x", -50, 50, 0.01);
camFolder.add(camera.position, "y", -50, 50, 0.01);
camFolder.add(camera.position, "z", -50, 50, 0.01);
camFolder.open();

const rotFolder = gui.addFolder("Camera Rotation");

rotFolder.add(camera.rotation, "x", -Math.PI, Math.PI, 0.001);
rotFolder.add(camera.rotation, "y", -Math.PI, Math.PI, 0.001);
rotFolder.add(camera.rotation, "z", -Math.PI, Math.PI, 0.001);

const lensFolder = gui.addFolder("Camera Lens");
lensFolder.add(camera, "fov", 20, 100, 1).onChange(() => {
  camera.updateProjectionMatrix();
});



// Camera intro animation
const pathPoints = [
  // 🎬 Establishing shot (high & far)
  new THREE.Vector3(0, 30, 80),

  // Very slow descent
  new THREE.Vector3(0, 28, 72),
  new THREE.Vector3(0, 26, 64),

  // Gentle glide
  new THREE.Vector3(0, 23, 56),
  new THREE.Vector3(0, 20, 48),

  // Mid approach
  new THREE.Vector3(0, 17, 40),
  new THREE.Vector3(0, 14, 32),

  // Slightly faster drop
  new THREE.Vector3(0, 11, 24),
  new THREE.Vector3(0, 8, 18),

  // Final cinematic settle
  new THREE.Vector3(0, 5, 12),
  new THREE.Vector3(0, 3, 6),
  new THREE.Vector3(0, 1.5, 2),

  // 🎯 End
  new THREE.Vector3(0, -2, -8),


];
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
    end: "+=10000",
    scrub: 1,
    markers: true,
  },

  onUpdate: () => {
    const position = cameraPath.getPointAt(motionState.t);
    const lookAhead = cameraPath.getPointAt(
      Math.min(motionState.t + 0.02, 1)
    );

    camera.position.copy(position);
    camera.lookAt(
      lookAhead.x,
      lookAhead.y + 0.3,
      lookAhead.z
    );
  }
});

   // delay refresh slightly so layout + WebGL are stable
  setTimeout(() => {
    ScrollTrigger.refresh()
  }, 100)
})


/* =========================================================
   MODEL STATE & CONTROLS
========================================================= */
let gltfModel = null;

const vecnaControls = {
  posX: 0,
  posY: -2,
  posZ: 0,
  scale: 1.2
};

const vecnaFolder = gui.addFolder("Vecna Controls");
vecnaFolder.add(vecnaControls, "posX", -4, 4, 0.1)
  .onChange(v => gltfModel && (gltfModel.position.x = v));
vecnaFolder.add(vecnaControls, "posY", -2, 10, 0.1)
  .onChange(v => gltfModel && (gltfModel.position.y = v));
vecnaFolder.add(vecnaControls, "posZ", -2, 2, 0.1)
  .onChange(v => gltfModel && (gltfModel.position.z = v));
vecnaFolder.add(vecnaControls, "scale", 0.2, 2, 0.1)
  .onChange(v => gltfModel && gltfModel.scale.set(v, v, v));

/* =========================================================
   LIGHTING
========================================================= */

// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.03);
scene.add(ambientLight);
gui.add(ambientLight, "intensity", 0, 10, 0);

// Directional
const dirLight = new THREE.DirectionalLight(0xffffff, 6.40);
dirLight.position.set(5.6, 6.2, 5.4);
dirLight.castShadow = true;
scene.add(dirLight);

dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 20;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;

// Under-face light
const underLight = new THREE.PointLight(0x223344, 0.8, 3, 2);
underLight.position.set(0.1, 1.2, 1.3);
scene.add(underLight);

// Spot light
const spotLight = new THREE.SpotLight(
  0x66ccff,
  6,
  15,
  Math.PI / 8,
  0.5,
  2
);
spotLight.position.set(1.2, 4.5, 2);
spotLight.target.position.set(0, 1.8, 0);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(2048, 2048);
spotLight.shadow.bias = -0.0005;
scene.add(spotLight);
scene.add(spotLight.target);

// Hemisphere
const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x222222, 0.03);
hemiLight.position.set(0, 10, 0);
scene.add(hemiLight);

// Rim
const rimLight = new THREE.DirectionalLight(0x66ccff, 0);
rimLight.position.set(-5, 4, -6);
scene.add(rimLight);

const rimFolder = gui.addFolder("Rim Light");
rimFolder.add(rimLight.position, "x", -10, 10, 0.1);
rimFolder.add(rimLight.position, "y", -10, 10, 0.1);
rimFolder.add(rimLight.position, "z", -10, 10, 0.1);
rimFolder.add(rimLight, "intensity", 0, 5, 0.1);

/* =========================================================
   CAMERA TARGET (HEAD LOCK)
========================================================= */
const vecnaHead = new THREE.Vector3();
let vecnaHeadObject = null;

const targetDebug = new THREE.Mesh(
  new THREE.SphereGeometry(0.05),
  new THREE.MeshBasicMaterial({ color: "red" })
);
scene.add(targetDebug);

/* =========================================================
   MODEL LOADING
========================================================= */
const loader = new GLTFLoader();
const vecnaMaterialConfig = { color: "#1ad9ff" };

loader.load("/models/scene.gltf", (gltf) => {
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
      child.material.color.set(vecnaMaterialConfig.color);
    }
  });

  gui.addColor(vecnaMaterialConfig, "color")
    .onChange(v => {
      gltfModel.traverse(c => c.isMesh && c.material.color.set(v));
    });

  scene.add(gltfModel);
});

/* =========================================================
   ENVIRONMENT (FLOOR + CONE)
========================================================= */
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load("../models/textures/watertexture.png");
const heightMap = textureLoader.load("../models/textures/water1.jpg");

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200, 100, 100),
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
   STARS
========================================================= */

const starCount = 5000;
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  starPositions[i * 3]     = THREE.MathUtils.randFloatSpread(40);
  starPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(50);
  starPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-10, 10);
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.13,
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
   POST PROCESSING
========================================================= */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.95,
  0.65,
  0.65
);
composer.addPass(bloomPass);

const colorGradePass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    tint: { value: new THREE.Vector3(0.85, 0.95, 1.1) },
    contrast: { value: 1.08 }
  },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform vec3 tint; uniform float contrast; varying vec2 vUv;
    void main(){vec4 c=texture2D(tDiffuse,vUv);c.rgb*=tint;c.rgb=(c.rgb-0.5)*contrast+0.5;gl_FragColor=c;}`
});
composer.addPass(colorGradePass);

let bloomEnabled = false;
let colorGradeEnabled = false;

window.addEventListener("keydown", (e) => {
  if (e.key === "b" || e.key === "B") {
    bloomEnabled = !bloomEnabled;
    bloomPass.enabled = bloomEnabled;
    console.log("Bloom:", bloomEnabled ? "ON" : "OFF");
  }

  if (e.key === "s" || e.key === "S") {
    colorGradeEnabled = !colorGradeEnabled;
    colorGradePass.enabled = colorGradeEnabled;
    console.log("Color Grade:", colorGradeEnabled ? "ON" : "OFF");
  }
});
/* =========================================================
   Light ning and Sound
========================================================= */
let soundEnabled = false;
let audioUnlocked = false;
let audioReady = false;

const listener = new THREE.AudioListener();
camera.add(listener);

const thunderSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load("/sounds/thunder.mp3", (buffer) => {
  thunderSound.setBuffer(buffer);
  thunderSound.setLoop(false);
  thunderSound.setVolume(0.9);
  audioReady = true;
});



// lightning
// Material (THIS was missing)
const lightningMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0
});

function generateLightningPoints(
  start,
  segments,
  spreadX = 2,
  spreadZ = 2
) {
  const points = [];
  let current = start.clone();

  points.push(current.clone());

  for (let i = 0; i < segments; i++) {
    current = current.clone();
    current.x += (Math.random() - 0.5) * spreadX;
    current.y -= Math.random() * 1.2 + 0.7;
    current.z += (Math.random() - 0.5) * spreadZ;

    points.push(current.clone());
  }

  return points;
}

function createBranchingLightning() {
  const group = new THREE.Group();

  // MAIN BOLT
  const mainPoints = generateLightningPoints(
    new THREE.Vector3(0, 12, 0),
    10,
    2,
    2
  );

  const mainGeometry = new THREE.BufferGeometry().setFromPoints(mainPoints);
  const mainBolt = new THREE.Line(mainGeometry, lightningMaterial);
  group.add(mainBolt);

  // BRANCHES
  const branchCount = THREE.MathUtils.randInt(2, 4);

  for (let i = 0; i < branchCount; i++) {
    const branchStartIndex = THREE.MathUtils.randInt(2, mainPoints.length - 3);
    const branchStart = mainPoints[branchStartIndex];

    const branchPoints = generateLightningPoints(
      branchStart.clone(),
      THREE.MathUtils.randInt(3, 5),
      1.5,
      1.5
    );

    const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
    const branch = new THREE.Line(branchGeometry, lightningMaterial);
    group.add(branch);
  }

  return group;
}




let lightning = createBranchingLightning();
scene.add(lightning);

const LIGHTNING_COUNT_MIN = 4;
const LIGHTNING_COUNT_MAX = 8;

let lightningGroup = new THREE.Group();
scene.add(lightningGroup);

const lightningLight = new THREE.DirectionalLight(0xffffff, 0);
lightningLight.position.set(5, 10, 5);
scene.add(lightningLight);

function triggerLightning() {
  // cleanup old lightning
  lightningGroup.children.forEach(bolt => {
    bolt.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
    });
  });
  lightningGroup.clear();

  // number of bolts this strike
  const boltCount = THREE.MathUtils.randInt(
    LIGHTNING_COUNT_MIN,
    LIGHTNING_COUNT_MAX
  );

  for (let i = 0; i < boltCount; i++) {
    const bolt = createBranchingLightning();

    // random horizontal offset
    bolt.position.x = (Math.random() - 0.5) * 6;
    bolt.position.z = (Math.random() - 0.5) * 6;

    lightningGroup.add(bolt);
  }

  // flash
  lightningMaterial.opacity = 1;
  lightningLight.intensity = 8;

  // flicker off
  setTimeout(() => {
    lightningMaterial.opacity = 0;
    lightningLight.intensity = 0;
  }, 90);
}

function lightningLoop() {
  const delay = THREE.MathUtils.randInt(2500, 6000);

  setTimeout(() => {
    triggerLightning();
    lightningLoop();
  }, delay);
}

lightningLoop();



/* =========================================================
   ANIMATION
========================================================= */
function animateModel(time) {
  if (!gltfModel) return;
  const t = time * 0.001;
  gltfModel.position.y = vecnaControls.posY + Math.sin(t * 1.5) * 0.08;
  gltfModel.rotation.y = Math.sin(t * 0.4) * 0.08;
}

function animate() {
  requestAnimationFrame(animate);
  animateStars(performance.now()); // ⭐ particle animation
  animateModel(performance.now());

  
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
