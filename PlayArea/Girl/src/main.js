import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import GUI from 'lil-gui'
import { gsap } from "gsap";

const RimLightShader = {
  uniforms: {
    rimColor: { value: new THREE.Color(0xffffff) },
    rimStrength: { value: 0.8 },
    rimPower: { value: 2.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-worldPos.xyz);
      gl_Position = projectionMatrix * worldPos;
    }
  `,
  fragmentShader: `
    uniform vec3 rimColor;
    uniform float rimStrength;
    uniform float rimPower;

    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float rim = 1.0 - max(dot(vNormal, vViewDir), 0.0);
      rim = pow(rim, rimPower);

      vec3 color = rimColor * rim * rimStrength;
      gl_FragColor = vec4(color, rim);
    }
  `,
  transparent: true,
  depthWrite: false,
};


/* =========================================================
   CANVAS
========================================================= */
const canvas = document.querySelector("canvas.world");

/* =========================================================
   SCENE
========================================================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color("#003c66");

/* =========================================================
   SCENE
========================================================= */
const gui = new GUI()
/* =========================================================
   CAMERA
========================================================= */


const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3.2, 2.8);

/* =========================================================
   CONTROLS
========================================================= */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.enabled = false;

gsap.from(camera.position, {
  z: 10,
  duration: 3,
  ease: "power3.out",
  onComplete: () => {
    controls.enabled = true;
  }
});

/* =========================================================
   RENDERER
========================================================= */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Color & tone mapping (important for character rendering)
import { ScrollTrigger } from '../../Vecna Moon/node_modules/gsap/ScrollTrigger';

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

/* =========================================================
   LIGHTING SETUP (CHARACTER FRIENDLY)
========================================================= */

// Soft ambient base
const ambientLight = new THREE.AmbientLight(0xffffff, 0.04);
scene.add(ambientLight);

// Key light (main direction)
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);

// Fill light (reduces harsh shadows)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-3, 2, 3);
scene.add(fillLight);

// Rim light (hair & silhouette highlight)
const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);



/* =========================================================
   FACE SPOT LIGHT (ACCENT)
========================================================= */

const faceSpotLight = new THREE.SpotLight(
  0xffffff,   // color
  50.6,        // intensity (keep low!)
  20,         // distance
  Math.PI / 6, // angle
  0.6,        // penumbra (soft edge)
  1           // decay
);

// Position slightly above and in front
faceSpotLight.position.set(0, 8.2, -7.5);
faceSpotLight.color.set('#e008fd')

// Aim at face / upper torso
faceSpotLight.target.position.set(0, 1.6, 0);

scene.add(faceSpotLight);
scene.add(faceSpotLight.target);
/* =========================================================
   GUI — FACE SPOT LIGHT
========================================================= */

const spotFolder = gui.addFolder("Face SpotLight");

spotFolder.add(faceSpotLight, "intensity", 0, 50, 0.01)
  .name("Intensity");

spotFolder.add(faceSpotLight, "distance", 1, 20, 0.1)
  .name("Distance");

spotFolder.add(faceSpotLight, "angle", 0.1, Math.PI / 2, 0.01)
  .name("Angle");

spotFolder.add(faceSpotLight, "penumbra", 0, 1, 0.01)
  .name("Penumbra");

spotFolder.add(faceSpotLight.position, "x", -5, 5, 0.01)
  .name("Pos X");

spotFolder.add(faceSpotLight.position, "y", 0, 10, 0.01)
  .name("Pos Y");

spotFolder.add(faceSpotLight.position, "z", -20, 5, 0.01)
  .name("Pos Z");

spotFolder.add(faceSpotLight.target.position, "y", 0, 3, 0.01)
  .name("Target Y");

spotFolder.addColor(
  { color: "#ffffff" },
  "color"
).name("Color").onChange((value) => {
  faceSpotLight.color.set(value);
});

spotFolder.open();

/* =========================================================
   SPOT LIGHT HELPER
========================================================= */

// const faceSpotHelper = new THREE.SpotLightHelper(faceSpotLight);
// scene.add(faceSpotHelper);

/* =========================================================
   GLTF MODEL LOADING
========================================================= */
let characterRoot = null;
const hairMeshes = [];


const loader = new GLTFLoader();

loader.load(
  "/models/scene.gltf",
  (gltf) => {
    const model = gltf.scene;
    characterRoot = model; 
    // Scale character
    model.scale.set(1.8, 1.8, 1.8);

    // Enable shadows for meshes
   
    model.traverse((child) => {
  if (!child.isMesh) return;


    // Detect hair meshes (adjust names if needed)
      if (
        child.name.toLowerCase().includes("hair") ||
        child.name.toLowerCase().includes("bang") ||
        child.name.toLowerCase().includes("tail")
      ) {
        hairMeshes.push(child);
      }
  /* ---------------------------------------
     Material sanity (ALL meshes)
  ---------------------------------------- */
  child.material.metalness = Math.min(
    child.material.metalness ?? 0,
    0.4
  );

  child.material.roughness = Math.max(
    child.material.roughness ?? 0.5,
    0.35
  );

  child.castShadow = true;
  child.receiveShadow = true;

  /* ---------------------------------------
     Rim light (SELECTIVE meshes only)
  ---------------------------------------- */
  const name = child.name.toLowerCase();

  const shouldHaveRim =
    name.includes("hair") ||
    name.includes("head") ||
    name.includes("face") ||
    name.includes("arm");

  if (!shouldHaveRim) return;

  const rimMesh = child.clone();

  rimMesh.material = new THREE.ShaderMaterial({
    ...RimLightShader,
    uniforms: THREE.UniformsUtils.clone(RimLightShader.uniforms),
    transparent: true,
    depthWrite: false,
  });

  // ✨ Stylized purple rim (controlled)
  rimMesh.material.uniforms.rimColor.value.set("#9908a4");
  rimMesh.material.uniforms.rimStrength.value = 0.9; //  NOT 3.8
  rimMesh.material.uniforms.rimPower.value = 3.2;    //  NOT 8.2

  rimMesh.scale.multiplyScalar(1.01); // prevents z-fighting
  child.parent.add(rimMesh);
});

    scene.add(model);

    // Focus camera on upper body / face
    controls.target.set(0, 1.5, 0);
    controls.update();
  },
  undefined,
  (error) => {
    console.error("GLTF Load Error:", error);
  }
);

/* =========================================================
   FLOOR
========================================================= */

const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load("../models/textures/highheel_baseColor.png");
const heightMap = textureLoader.load("../models/textures/Rurune_Tights_baseColor.png");

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50, 100, 100),
  new THREE.MeshStandardMaterial({
    map: floorTexture,
    displacementMap: heightMap,
    displacementScale: 0.4,
    color: new THREE.Color(0.28, 0.38, 0.45), // 🔽 darkersetRGB(0.28, 0.38, 0.45);
    roughness: 0.8, // 🔼 kills glare
    metalness: 0.1
  })
);


floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const floor1 = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50, 100, 100),
  new THREE.MeshStandardMaterial({
    map: floorTexture,
    displacementMap: heightMap,
    displacementScale: 0.4,
    color: new THREE.Color(0.28, 0.38, 0.45), // 🔽 darkersetRGB(0.28, 0.38, 0.45);
    roughness: 0.8, // 🔼 kills glare
    metalness: 0.1
  })
);
floor1.rotation.x = -Math.PI / 4;
floor1.position.x = -1
floor1.position.y = 2;
floor1.position.z = -5;
floor1.receiveShadow = true;
scene.add(floor1);
/* =========================================================
   Shader pass
========================================================= */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.12,   // strength
  0.25,   // radius
  0.9   // threshold
);

// composer.addPass(bloomPass);

const filmPass = new FilmPass(
  0.08,   // noise intensity
  0.015,  // scanlines intensity
  512,    // scanlines count
  false   // grayscale
);

composer.addPass(filmPass);

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.1 },
    darkness: { value: 1.0 },
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
  uniform float offset;
  uniform float darkness;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    float dist = distance(vUv, vec2(0.5));
    float vignette = smoothstep(offset, offset - 0.5, dist * darkness);
    color.rgb *= vignette;
    gl_FragColor = color;
  }
`
};


renderer.toneMappingExposure = 0.8;

keyLight.intensity = 1.2;
fillLight.intensity = 0.6;
rimLight.intensity = 0.7;
ambientLight.intensity = 0.05;

const vignettePass = new ShaderPass(VignetteShader);
// composer.addPass(vignettePass);
/* =========================================================
   ANIMATION LOOP
========================================================= */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

   const t = clock.getElapsedTime();

    if (characterRoot) {
    // 🫁 Breathing
    const breath = Math.sin(t * 1.6) * 0.055;

    characterRoot.position.y = breath ;
    characterRoot.scale.y = 2 + breath * 0.6;

    // 🌬 Hair sway
    hairMeshes.forEach((hair, i) => {
      hair.rotation.z = Math.sin(t * 0.9 + i) * 0.1;
    
    });
  }

    // 🔹 Update spotlight helper
  // faceSpotHelper.update();
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
  composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", (e) => {
  if (e.key === "b") {
    bloomPass.enabled = !bloomPass.enabled;
  }
});

/* =========================================================
   Gsap Animation
========================================================= */
