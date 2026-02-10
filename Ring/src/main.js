import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/* =========================
   Gui
========================= */
const gui = new GUI();
/* =========================
   SCENE
========================= */
const scene = new THREE.Scene();

/* =========================
   CAMERA
========================= */
const camera = new THREE.PerspectiveCamera(
  45,                               // FOV
  window.innerWidth / window.innerHeight, // Aspect
  0.1,                              // Near
  100                               // Far
);
camera.position.set(0, 0, 8);
scene.add(camera);

/* =========================
   RENDERER
========================= */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false, // set true only if you want transparent background
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// background color (luxury pink example)
renderer.setClearColor("#f2c6c3", 1);

// color management (IMPORTANT)
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.physicallyCorrectLights = true;

document.body.appendChild(renderer.domElement);

/* =========================
  Controls
========================= */
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enableZoom = true;
controls.enablePan = false;

// luxury product style
controls.minDistance = 4;
controls.maxDistance = 12;
controls.maxPolarAngle = Math.PI * 0.48;
/* =========================
  Light
========================= */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
keyLight.position.set(5, 8, 6);
renderer.shadowMap.enabled = true
keyLight.castShadow = true

scene.add(keyLight);

// Helper
const keyLightHelper = new THREE.DirectionalLightHelper(keyLight, 1)
scene.add(keyLightHelper)

/* =========================================================
   GUI CONTROLS
========================================================= */

const keyLightFolder = gui.addFolder("Key Light")

keyLightFolder
  .add(keyLight, "intensity")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Intensity")

keyLightFolder
  .addColor({ color: "#ffffff" }, "color")
  .name("Color")
  .onChange((value) => {
    keyLight.color.set(value)
  })

keyLightFolder
  .add(keyLight.position, "x")
  .min(-20)
  .max(20)
  .step(0.1)
  .name("Position X")
  .onChange(() => keyLightHelper.update())

keyLightFolder
  .add(keyLight.position, "y")
  .min(-20)
  .max(20)
  .step(0.1)
  .name("Position Y")
  .onChange(() => keyLightHelper.update())

keyLightFolder
  .add(keyLight.position, "z")
  .min(-20)
  .max(20)
  .step(0.1)
  .name("Position Z")
  .onChange(() => keyLightHelper.update())

keyLightFolder
  .add(keyLightHelper, "visible")
  .name("Show Helper")

keyLightFolder.open()

/* =========================================================
   SPOT LIGHT
========================================================= */

const spotLight = new THREE.SpotLight(
  0xffffff,   // color
  3.5,        // intensity
  30,         // distance
  Math.PI / 6, // angle
  0.35,       // penumbra
  1           // decay
)

spotLight.position.set(0, 6, 6)
spotLight.target.position.set(0, 0, 0)

spotLight.castShadow = true
spotLight.shadow.mapSize.set(1024, 1024)
spotLight.shadow.bias = -0.0001

scene.add(spotLight)
scene.add(spotLight.target)

// Helper
const spotLightHelper = new THREE.SpotLightHelper(spotLight)
scene.add(spotLightHelper)


/* =========================================================
   GUI CONTROLS — SPOT LIGHT
========================================================= */

const spotLightFolder = gui.addFolder("Spot Light")

// Intensity
spotLightFolder
  .add(spotLight, "intensity", 0, 100, 0.1)
  .name("Intensity")

// Color
spotLightFolder
  .addColor({ color: "#ffffff" }, "color")
  .name("Color")
  .onChange((value) => {
    spotLight.color.set(value)
  })

// Position
spotLightFolder.add(spotLight.position, "x", -20, 20, 0.1)
  .name("Position X")
  .onChange(() => spotLightHelper.update())

spotLightFolder.add(spotLight.position, "y", -20, 20, 0.1)
  .name("Position Y")
  .onChange(() => spotLightHelper.update())

spotLightFolder.add(spotLight.position, "z", -20, 20, 0.1)
  .name("Position Z")
  .onChange(() => spotLightHelper.update())

// Target
spotLightFolder.add(spotLight.target.position, "x", -5, 5, 0.1)
  .name("Target X")
  .onChange(() => spotLightHelper.update())

spotLightFolder.add(spotLight.target.position, "y", -5, 5, 0.1)
  .name("Target Y")
  .onChange(() => spotLightHelper.update())

spotLightFolder.add(spotLight.target.position, "z", -5, 5, 0.1)
  .name("Target Z")
  .onChange(() => spotLightHelper.update())

// Cone controls
spotLightFolder
  .add(spotLight, "angle", 0.1, Math.PI / 2, 0.01)
  .name("Angle")
  .onChange(() => spotLightHelper.update())

spotLightFolder
  .add(spotLight, "penumbra", 0, 1, 0.01)
  .name("Penumbra")

// Helper toggle
spotLightFolder
  .add(spotLightHelper, "visible")
  .name("Show Helper")

spotLightFolder.open()


/* =========================
   LOADER
========================= */



const gltfLoader = new GLTFLoader();


/* =========================
   MODEL
========================= */
let model = null;

gltfLoader.load(
  "/models/ring.glb",
  (gltf) => {
    model = gltf.scene;

    /* =========================
       TRANSFORM
    ========================= */
    model.scale.set(1.85, 1.85, 1.85);
    model.position.set(-3.5, 0, -2);
    model.rotation .x = 1.5
    model.rotation.y = 0.75
    /* =========================
       MATERIAL DEFAULTS
    ========================= */
    const materialsFolder = gui.addFolder("Ring Materials")
model.traverse((child) => {
  if (!child.isMesh || !child.material) return

  const meshName = child.name || `Mesh_${child.id}`
  const meshFolder = materialsFolder.addFolder(meshName)

  // Ensure MeshStandardMaterial properties
  if (child.material.isMeshStandardMaterial) {

    // Color
    const colorParams = {
      color: `#${child.material.color.getHexString()}`
    }

    meshFolder
      .addColor(colorParams, "color")
      .name("Color")
      .onChange((value) => {
        child.material.color.set(value)
      })

    // Metalness
    meshFolder
      .add(child.material, "metalness", 0, 1, 0.01)
      .name("Metalness")

    // Roughness
    meshFolder
      .add(child.material, "roughness", 0, 1, 0.01)
      .name("Roughness")

    // Env Map Intensity (VERY important for jewelry)
    if ("envMapIntensity" in child.material) {
      meshFolder
        .add(child.material, "envMapIntensity", 0, 5, 0.01)
        .name("Env Intensity")
    }
  }

  // Visibility toggle
  meshFolder
    .add(child, "visible")
    .name("Visible")

  meshFolder.close()
})

materialsFolder.open()
    /* =========================
       GUI — MODEL CONTROLS
    ========================= */
    const modelFolder = gui.addFolder("Ring Model");

    // Position
    modelFolder.add(model.position, "x", -5, 5, 0.01);
    modelFolder.add(model.position, "y", -5, 5, 0.01);
    modelFolder.add(model.position, "z", -5, 5, 0.01);

    // Rotation
    modelFolder.add(model.rotation, "x", -Math.PI, Math.PI, 0.01);
    modelFolder.add(model.rotation, "y", -Math.PI, Math.PI, 0.01);
    modelFolder.add(model.rotation, "z", -Math.PI, Math.PI, 0.01);

    // Scale (uniform)
    const scale = { value: 1.5 };
    modelFolder.add(scale, "value", 0.2, 4, 0.01).onChange((v) => {
      model.scale.set(v, v, v);
    });

    modelFolder.open();


    scene.add(model);
  },
  (progress) => {
    console.log(
      `Loading: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`
    );
  },
  (error) => {
    console.error("Error loading model", error);
  }
);

/* =========================
   RESIZE HANDLER
========================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();


  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* =========================
   ANIMATION LOOP
========================= */
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // update stuff here
  spotLightHelper.update()
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
