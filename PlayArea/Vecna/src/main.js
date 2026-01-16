import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import GUI from 'lil-gui'
import { Water } from "three/examples/jsm/objects/Water.js";

const canvas = document.querySelector("canvas.world");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);




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
cameraFolder.add(cameraConfig,"posZ",-10,10,0.1).onChange((value)=>{
  camera.position.z = value;
})



const positionFolder = gui.addFolder("Vecna Controls");
positionFolder.add(VecnaConfig,"posX",-4,4,0.1).onChange((value)=>{
  if(gltfModel) gltfModel.position.x = value;
});
positionFolder.add(VecnaConfig,"posY",-2,2,0.1).onChange((value)=>{
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
    gltfModel.scale.set(0.5, 0.5, 0.5);
    gltfModel.position.set(0, -1, 0);
    gltfModel.traverse((child) => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;

    var mat = child.material;
  
    
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




// Create a plane for a floor
const planeGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.y = -1.5;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
plane.receiveShadow = true;




// changing background
const bgConfig ={
  background: '#111111',
}
gui.addColor(bgConfig, "background").name("Background Color").onChange((value)=>{
  scene.background.set(value);
})

// Water Geometry
const waterGeometry = new THREE.PlaneGeometry(20, 20);

const water =new Water(waterGeometry,{
textureHeight:1024,
textureWidth: 1024,
waterNormals: new THREE.TextureLoader().load(
  "/textures/waternormals.jpg",
    (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
),
 sunDirection:  dirLight.position.clone().normalize(),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 3.7,
  fog: scene.fog !== undefined,
})
water.rotation.x = -Math.PI / 2;
water.position.y = -1.2;

scene.add(water);



water.material.uniforms.waterColor.value.setHSL(
  0.55,
  0.8,
  0.3 + Math.sin(Date.now() * 0.001) * 0.05
);

// Light Helpers
const helper= new THREE.DirectionalLightHelper(dirLight,5);
scene.add(helper)


function animate() {
  requestAnimationFrame(animate);

  gltfModel.rotation.y+= 0.01;
  water.material.uniforms.time.value += 1 / 60;
  
  controls.update();
  renderer.render(scene, camera);
}
animate()









window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});