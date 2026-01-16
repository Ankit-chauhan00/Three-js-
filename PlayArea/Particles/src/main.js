import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.querySelector("canvas.world");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ------------------ SATURN PLANET ------------------ */

const saturnParticleCount = 5000; // adjust for performance
const saturnPositions = new Float32Array(saturnParticleCount * 3);
const saturnColors = new Float32Array(saturnParticleCount * 3);

const radius = 1;

for (let i = 0; i < saturnParticleCount; i++) {
  // random point inside sphere (uniform distribution)
  let x, y, z;
  do {
    x = THREE.MathUtils.randFloatSpread(2);
    y = THREE.MathUtils.randFloatSpread(2);
    z = THREE.MathUtils.randFloatSpread(2);
  } while (x * x + y * y + z * z > 1);

  saturnPositions[i * 3]     = x * radius;
  saturnPositions[i * 3 + 1] = y * radius;
  saturnPositions[i * 3 + 2] = z * radius;

  // 🎨 random color (pink / purple / orange vibes)
  const color = new THREE.Color();
  color.setHSL(
    THREE.MathUtils.randFloat(0.9, 1.0), // hue range
    0.8,                                 // saturation
    THREE.MathUtils.randFloat(0.5, 0.7)  // lightness
  );

  saturnColors[i * 3]     = color.r;
  saturnColors[i * 3 + 1] = color.g;
  saturnColors[i * 3 + 2] = color.b;
}
const saturnParticleGeometry = new THREE.BufferGeometry();
saturnParticleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(saturnPositions, 3)
);


saturnParticleGeometry.setAttribute(
  "color",
  new THREE.BufferAttribute(saturnColors, 3)
);
const saturnParticleMaterial = new THREE.PointsMaterial({
  size: 0.009,
  map: createGlowTexture(),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true, // 🔥 IMPORTANT
});
const saturnParticles = new THREE.Points(
  saturnParticleGeometry,
  saturnParticleMaterial
);

scene.add(saturnParticles);

/* ------------------ SATURN RINGS (PARTICLES) ------------------ */



const ringCount = 200000;
const positions = new Float32Array(ringCount * 3);

for (let i = 0; i < ringCount; i++) {
  const radius = THREE.MathUtils.randFloat(1.3, 2.5);
  const angle = Math.random() * Math.PI * 2;

  positions[i * 3] = Math.cos(angle) * radius;
  positions[i * 3 + 1] = THREE.MathUtils.randFloat(-0.02, 0.02);
  positions[i * 3 + 2] = Math.sin(angle) * radius;
}

const ringGeometry = new THREE.BufferGeometry();
ringGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);


const ringMaterial = new THREE.PointsMaterial({
  size: 0.009,
  map: createGlowTexture(),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: "#ff477e",
});

const ringParticles = new THREE.Points(ringGeometry, ringMaterial);
ringParticles.rotation.x = Math.PI * 150;
scene.add(ringParticles);

/* ------------------ LIGHTS ------------------ */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/* ------------------ ANIMATION ------------------ */

const clock = new THREE.Clock();
const positionss = ringGeometry.attributes.position.array;
const originalPositions = positions.slice();
const saturnOriginalPositions = saturnPositions.slice();
// const saturnPositions =
//   saturnParticleGeometry.attributes.position.array;
// const saturnOriginalPositions = saturnPositions.slice();

function animate() {
  requestAnimationFrame(animate);
   const time = clock.getElapsedTime();

   for (let i = 0; i < ringCount; i++) {
    const i3 = i * 3;

    positionss[i3 + 1] =
      originalPositions[i3 + 1] +
      Math.sin(time * 3 + i) * 0.015;

      const wave =
  Math.sin(time * 1.5 + originalPositions[i3] * 2) * 0.099;

positionss[i3 + 1] = originalPositions[i3 + 1] + wave;
  }
    for (let i = 0; i < saturnPositions.length; i += 3) {
  const ox = saturnOriginalPositions[i];
  const oy = saturnOriginalPositions[i + 1];
  const oz = saturnOriginalPositions[i + 2];

  const bandWave = Math.sin(time * 1.5 + oy * 6) * 0.015;

  saturnPositions[i]     = ox + bandWave;
  saturnPositions[i + 1] = oy;
  saturnPositions[i + 2] = oz + bandWave;
}

ringParticles.rotation.y +=0.0005

saturnParticleGeometry.attributes.position.needsUpdate = true;

  ringGeometry.attributes.position.needsUpdate = true;




  controls.update();
  renderer.render(scene, camera);
}

animate();

/* ------------------ RESIZE ------------------ */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, "rgb(255, 9, 9)");
  gradient.addColorStop(0.4, "rgba(0, 0, 0, 0.6)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");



  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}