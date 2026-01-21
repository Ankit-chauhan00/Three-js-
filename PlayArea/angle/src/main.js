
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from 'lil-gui';
import {gsap} from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
/* =========================================================
   CORE SETUP
========================================================= */
// canvas
const canvas = document.querySelector('canvas.world');

// scene
const scene = new THREE.Scene();

// camera 
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
)
camera.position.set(0,0,5)
// renderer 
// antialias provide smooth edges
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// const gui
// const gui = new GUI();
/* =========================================================
 Background setup
========================================================= */
const textureLoader = new THREE.TextureLoader();

const textures = {
  blue: textureLoader.load("/themes/blue.png"),
  yellow: textureLoader.load("/themes/yellow.png"),
  green:  textureLoader.load("/themes/green.png")
};
Object.values(textures).forEach((t) => {
  t.colorSpace = THREE.SRGBColorSpace;
});

const bgMaterial1 = new THREE.MeshBasicMaterial({
    map: textures.blue,
  transparent: true,
  opacity: 1,
  depthWrite: false,
});

const bgPlane1 = new THREE.Mesh(
  new THREE.PlaneGeometry(55, 50),
  bgMaterial1
);

bgPlane1.position.z = -15;
scene.add(bgPlane1);

const bgMaterial2 = new THREE.MeshBasicMaterial({
  map: textures.yellow,
  transparent: true,
  opacity: 1, // starts visible
  depthWrite: false,
});

const bgPlane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(55, 50),
  bgMaterial2
)
bgPlane2.position.z = -14.9
scene.add(bgPlane2)

const bgMaterial3 = new THREE.MeshBasicMaterial({
  map: textures.green,
  transparent: true,
  opacity: 1, // starts visible
  depthWrite: false,
});

const bgPlane3 = new THREE.Mesh(
  new THREE.PlaneGeometry(55, 50),
  bgMaterial3
)
bgPlane3.position.z = -15.1
scene.add(bgPlane3);

/* =========================================================
 Rim Light
========================================================= */
const rimLight = new THREE.DirectionalLight("#b6b6e2", 15.6);
rimLight.position.set(7, 7, 4.1);
rimLight.color.set("#b6b6e2")
scene.add(rimLight);

// const rimFolder = gui.addFolder("Rim Light");

// // intensity
// rimFolder.add(rimLight, "intensity", 0, 5, 0.01);

// // color
// const rimParams = {
//   color: "#b6b6e2"
// };

// rimFolder.addColor(rimParams, "color").onChange((value) => {
//   rimLight.color.set(value);
// });

// // position
// rimFolder.add(rimLight.position, "x", -10, 10, 0.1);
// rimFolder.add(rimLight.position, "y", -10, 10, 0.1);
// rimFolder.add(rimLight.position, "z", -10, 10, 0.1);

// rimFolder.open();

/* =========================================================
  Gsap Animation
========================================================= */
window.addEventListener("load", () => {
  gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-section",
      start: "top 50%",
      end: "30% top",
      scrub: true,
    },
  })
  .to(bgMaterial2, { opacity: 0, ease: "power3.inOut", duration: 10 }, 0)
  .to(rimLight.color,{
    r: 0x38 / 255,
  g: 0x7a / 255,
  b: 0xff / 255,
  duration: 1.2,
  ease: "power2.out"
  })

   gsap.to(camera.position, {
    z: 2.2, // 👈 closer to model
    ease: "none",
    scrollTrigger: {
      trigger: ".scroll-section",
       id: "cam-in", 
      start: "top bottom",
      end: "top top",
      scrub: true,
    }
  })


  gsap.timeline({
    scrollTrigger:{
      trigger: ".scroll-section2",
      start: "top bottom",
      end: "30% bottom",
      scrub: true,
    }
  })
  .to(bgMaterial1,{opacity :  0, ease: "power2.inOut", duration: 10},0)
  
  .to(rimLight.color, {
  r: 0x54 / 255,
  g: 0xa6 / 255,
  b: 0x6c / 255,
  duration: 1.2,
  ease: "power2.out"
},0)

let bodyStartZ = null;
let wingsStartZ = null;


  setTimeout(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, 100);
});



/* =========================================================
  Orbit Controls
========================================================= */

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

scene.fog = new THREE.FogExp2(0x000000, .003);
/* =========================================================
  LODING THE MODEL
========================================================= */
const gltfLoader = new GLTFLoader();

let bodyModel = null;
gltfLoader.load(
  "/models/angle.glb",
  (gltf) => {
  bodyModel = gltf.scene;
  bodyModel.scale.set(2.5, 2.5, 2.5);
  bodyModel.rotation.y = 249.8
  bodyModel.position.x = -0.1
  bodyModel.position.z = -0.2
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


let wingsModel = null;
gltfLoader.load(
  "/models/angel_wings.glb",
  (gltf)=>{
     
    wingsModel = gltf.scene;
    wingsModel.scale.set(2.5,1.2,0.7);
    wingsModel.rotation.y = 25
    wingsModel.position.y = -1.9
    wingsModel.position.x = -0.06


     wingsModel.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set("#ffffff"); // any color
      child.material.needsUpdate = true;
    }
  });

    scene.add(wingsModel);
  },(progress) => {
    console.log(
      (progress.loaded / progress.total) * 100 + "% loaded"
    );
  },
  (error) => {
    console.error("Error loading model", error);
  }
)

/* =========================================================
  Spot Light
========================================================= */
// Spotlight
const spotLight = new THREE.SpotLight(
  0xffffff, // color
  2.5,      // intensity
  30,       // distance
  Math.PI / 6, // angle (cone size)
  0.4,      // penumbra (soft edge)
  1         // decay
);

spotLight.position.set(0, 6, 5);
spotLight.castShadow = true;

// Shadow quality
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.near = 0.5;
spotLight.shadow.camera.far = 20;

// Target (VERY IMPORTANT)
spotLight.target.position.set(0, 1.5, 0);
scene.add(spotLight.target);

// Add to scene
scene.add(spotLight);

// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

// const spotFolder = gui.addFolder("Spot Light");

// // intensity
// spotFolder.add(spotLight, "intensity", 0, 10, 0.01);

// // distance
// spotFolder.add(spotLight, "distance", 0, 50, 0.1);

// // angle (cone)
// spotFolder
//   .add(spotLight, "angle", 0.1, Math.PI / 2, 0.01)
//   .onChange(() => spotLightHelper.update());

// // penumbra (soft edge)
// spotFolder.add(spotLight, "penumbra", 0, 1, 0.01);

// // decay (realistic falloff)
// spotFolder.add(spotLight, "decay", 0, 2, 0.01);

// // position controls
// spotFolder.add(spotLight.position, "x", -10, 10, 0.1);
// spotFolder.add(spotLight.position, "y", 0, 10, 0.1);
// spotFolder.add(spotLight.position, "z", -10, 10, 0.1);

// // target controls
// spotFolder.add(spotLight.target.position, "x", -5, 5, 0.1);
// spotFolder.add(spotLight.target.position, "y", 0, 5, 0.1);
// spotFolder.add(spotLight.target.position, "z", -5, 5, 0.1);

// spotFolder.open();





function animate() {
  requestAnimationFrame(animate);
  
const time = performance.now() * 0.001;

  if (bodyModel) {
    bodyModel.position.y = Math.sin(time * 1.29) * 0.2;
  }

  if (wingsModel) {
    wingsModel.position.y = bodyModel.position.y - 0.55;
  }

 
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

let isInteractive = false;
const inspectBtn = document.querySelector('#intraction');

inspectBtn.addEventListener("click",()=>{
  console.log('button is clicked')
if (isInteractive) return;

isInteractive = true;
canvas.classList.add("interactive");
// Stop scroll-driven animations
  ScrollTrigger.getAll().forEach(st => st.disable());

    // Enable user control
  controls.enabled = true;

  // Smooth camera settle
  gsap.to(camera.position, {
    x: 0,
    y: 0.6,
    z: 2.5,
    duration: 1.2,
    ease: "power3.inOut"
  });

})
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !isInteractive) return;

  isInteractive = false;

  canvas.classList.remove("interactive");

  // Re-enable scroll animations
  ScrollTrigger.getAll().forEach(st => st.enable());

  controls.enabled = false;

  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 5,
    duration: 1.2,
    ease: "power3.inOut"
  });
});