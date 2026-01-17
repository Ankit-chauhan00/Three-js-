import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from 'lil-gui'
import { Water } from "three/examples/jsm/objects/Water.js";
import { fog } from "three/src/nodes/TSL.js";

const canvas = document.querySelector("canvas.world");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

scene.fog = new THREE.Fog(
  0x000000, // color
  6,        // near
  18        // far
);
scene.add(fog);


const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1, 3);


const gui = new GUI();



const VecnaConfig = {
  posX: 5, // Add a number property
  posY: 2, // Add a number property
  posZ: 3, // Add a number property
  scale : 0.5,
  // we will add rotation properties bec we want to show that lights are not effected by rotation
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
}
const cameraConfig = {
  posX: 5, // Add a number property
  posY: 2, // Add a number property
  posZ: 3, // Add a number property
}
const cameraFolder = gui.addFolder("Camera Position");
cameraFolder.add(cameraConfig,"posX",-10,10,0.1).onChange((value)=>{
  camera.position.x = value;
})
cameraFolder.add(cameraConfig,"posY",-10,10,0.1).onChange((value)=>{
  camera.position.y = value;
})
cameraFolder.add(cameraConfig,"posZ",-10,20,0.1).onChange((value)=>{
  camera.position.z = value;
})



const positionFolder = gui.addFolder("Vecna Controls");
positionFolder.add(VecnaConfig,"posX",-4,4,0.1).onChange((value)=>{
  if(gltfModel) gltfModel.position.x = value;
});
positionFolder.add(VecnaConfig,"posY",-2,10,0.1).onChange((value)=>{
  if(gltfModel) gltfModel.position.y = value;
});
positionFolder.add(VecnaConfig,"posZ",-2,2,0.1).onChange((value)=>{
  if(gltfModel) gltfModel.position.z = value;
});
positionFolder.add(VecnaConfig,"scale",0.2,2,0.1).onChange((value)=>{
  if(gltfModel) gltfModel.scale.set(value,value,value);
})

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// render Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.zoom = true;


const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
gui.add(ambientLight,'intensity',0,10,0.1).name("Ambinent Light")


const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 20;

dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;

const directionLightConfig = {
  posX: 5, // Add a number property
  posY: 2, // Add a number property
  posZ: 3, // Add a number property
  intensity : 10,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
}

const directionLightFolder = gui.addFolder("Direction Light");
directionLightFolder.add(directionLightConfig,"posX",-10,10,0.1).onChange((value)=>{
  dirLight.position.x = value
})
directionLightFolder.add(directionLightConfig,"posY",-10,10,0.1).onChange((value)=>{
  dirLight.position.y = value
})
directionLightFolder.add(directionLightConfig,"posZ",-10,10,0.1).onChange((value)=>{
  dirLight.position.z = value
})
directionLightFolder.add(directionLightConfig,"intensity",0,50,0.1).onChange((value)=>{
  dirLight.intensity = value;
})
directionLightFolder.add(directionLightConfig,"rotateX",-Math.PI,Math.PI,0.01).onChange((value)=>{
  dirLight.rotation.x = value;
})
directionLightFolder.add(directionLightConfig,"rotateY",-Math.PI,Math.PI,0.01).onChange((value)=>{
  dirLight.rotation.y = value;
})
directionLightFolder.add(directionLightConfig,"rotateZ",-Math.PI,Math.PI,0.01).onChange((value)=>{
  dirLight.rotation.z = value;
})


  
let gltfModel = null;


const loader = new GLTFLoader();
const vecnaConfig =  { color :"#378f3e",}
loader.load(
  "/models/scene.gltf",   // ✅ correct path for your setup
  (gltf) => {
    gltfModel = gltf.scene;

    // DEBUG SAFE VALUES
    gltfModel.scale.set(1.2, 1.2, 1.2);
    gltfModel.position.set(0, -2, 0);
    gltfModel.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;

    let mat = child.material;
  
    
    // Blend color with texture
    mat.color.set("#378f3e"); 
    mat.needsUpdate = true;
  }
});

gui.addColor(vecnaConfig, "color")
  .name("Vecna Color")
  .onChange((value) => {
    if (!gltfModel) return;

    gltfModel.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(value);
        child.material.needsUpdate = true;
      }
    });
  });


    scene.add(gltfModel);
   
    console.log("Model loaded", gltfModel);
  },
  undefined,
  (error) => {
    console.error("GLTF load error:", error);
  }
);

// texture Loader for Plane
const textureLoader = new THREE.TextureLoader();
const height = textureLoader.load('../models/textures/height1.png');
const texture = textureLoader.load('../models/textures/moon2.jpg');
const alpha = textureLoader.load('../models/textures/alpha 1.png')




// Create a plane for a floor
const planeGeometry = new THREE.PlaneGeometry(50, 50, 100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ 
  color : 'grey',
  map: texture,
  displacementMap: height,
  displacementScale: 4,
  alphaMap: alpha,

  depthTest: true,

 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -6;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
plane.receiveShadow = true;

// parile acting like starts

const starCount = 20000;
const starSizes = new Float32Array(starCount);
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const x = THREE.MathUtils.randFloatSpread(40); // width
  const y = THREE.MathUtils.randFloatSpread(50); // height
  const z = THREE.MathUtils.randFloat(-10, 10);   // depth (important!)

  starPositions[i * 3] = x;
  starPositions[i * 3 + 1] = y;
  starPositions[i * 3 + 2] = z;
  starSizes[i] = Math.random() * 1.5 + 0.3;
}

const starGeometry = new THREE.BufferGeometry();

starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starPositions, 3)
);
starGeometry.setAttribute(
  "size",
  new THREE.BufferAttribute(starSizes, 1)
);
const starMaterial = new THREE.PointsMaterial({
  size: 0.022,
  map: createGlowTexture(), // your existing glow texture 🔥
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: "#ffffff",
  

});

starMaterial.opacity = 0.5;
const starPlane = new THREE.Points(starGeometry, starMaterial);
starPlane.position.z = -2;   // behind Vecna
starPlane.position.y = 1;    // center it
starPlane.rotation.x = Math.PI/2;
scene.add(starPlane);


const positions = starGeometry.attributes.position.array;
const starBaseY = new Float32Array(starCount);

function animateStars(time) {
  const t = time * 0.001;

 for (let i = 0; i < starCount; i++) {
    const index = i * 3;

    positions[index + 1] =
      starBaseY[i] + Math.sin(t + i * 0.1) * 0.03;
  }

  starGeometry.attributes.position.needsUpdate = true;
}

function createGlowTexture() {
  const size = 64;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}






// changing background
const bgConfig ={
  background: '#111111',
}
gui.addColor(bgConfig, "background").name("Background Color").onChange((value)=>{
  scene.background.set(value);
})

// Water Geometry
// const waterGeometry = new THREE.PlaneGeometry(20, 20);

// const water =new Water(waterGeometry,{
// textureHeight:1024,
// textureWidth: 1024,
// waterNormals: new THREE.TextureLoader().load(
//   "/textures/waternormals.jpg",
//     (texture) => {
//       texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//     }
// ),
//  sunDirection:  dirLight.position.clone().normalize(),
//   sunColor: 0xffffff,
//   waterColor: 0x001e0f,
//   distortionScale: 3.7,
//   fog: scene.fog !== undefined,
// })
// water.rotation.x = -Math.PI / 2;
// water.position.y = -1.2;

// scene.add(water);



// water.material.uniforms.waterColor.value.setHSL(
//   0.55,
//   0.8,
//   0.3 + Math.sin(Date.now() * 0.001) * 0.05
// );

// Light Helpers
// const helper= new THREE.DirectionalLightHelper(dirLight,5);
// scene.add(helper)


function animate() {
  requestAnimationFrame(animate);

  // gltfModel.rotation.y+= 0.01;
  // water.material.uniforms.time.value += 1 / 60;

  animateStars(performance.now());
  
  controls.update();
  renderer.render(scene, camera);
}
animate()









window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});