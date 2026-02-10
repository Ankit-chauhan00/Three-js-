// Core Three.js library
import * as THREE from 'three'

// Camera interaction (orbit, zoom, pan)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Loader for HDR environment maps
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js"

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// Loader for GLTF / GLB models
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
// GUI for live tweaking values
import GUI from 'lil-gui'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all';

import { MotionPathPlugin } from "gsap/MotionPathPlugin"

gsap.registerPlugin( MotionPathPlugin,ScrollTrigger)
// Canvas reference
const canvas = document.querySelector('canvas.world')

/* =========================================================
   SCENE
========================================================= */
const scene = new THREE.Scene()

/* =========================================================
   GUI
========================================================= */
const gui = new GUI()

/* =========================================================
   CAMERA
========================================================= */
const camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

// Initial cinematic camera position
camera.position.set(35, 10, 70)

// Camera GUI controls
const cameraFolder = gui.addFolder('Camera')

cameraFolder.add(camera.position, 'x', -50, 50, 0.01)
cameraFolder.add(camera.position, 'y', -50, 50, 0.01)
cameraFolder.add(camera.position, 'z', -50, 50, 0.01)

// Control camera field of view
cameraFolder.add(camera, 'fov', 20, 120, 1).onChange(() => {
  camera.updateProjectionMatrix()
})

cameraFolder.open()

scene.add(camera)

/* =========================================================
   RENDERER
========================================================= */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Enable shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap

// Filmic tone mapping for cinematic look
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 5.4

/* =========================================================
   HDRI ENVIRONMENT SETTINGS
========================================================= */
scene.environmentIntensity = 1.5
scene.backgroundIntensity = 0.8
scene.backgroundBlurriness = 0

// Initial HDR rotation (sun direction)
scene.environmentRotation = Math.PI * 0.35
scene.backgroundRotation = Math.PI * 0.35

/* =========================================================
  Fog
========================================================= */
scene.fog = new THREE.Fog(
  new THREE.Color('#1a1a2e'), // tint color
  5,
  30
)

/* =========================================================
   ORBIT CONTROLS
========================================================= */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Camera always looks at this point
controls.target.set(0, 1, 0)

// GUI for OrbitControls
const controlsFolder = gui.addFolder('OrbitControls')

controlsFolder.add(controls, 'enableDamping')
controlsFolder.add(controls, 'autoRotate')
controlsFolder.add(controls, 'autoRotateSpeed', -5, 5, 0.01)
controlsFolder.add(controls, 'enableZoom')
controlsFolder.add(controls, 'enablePan')

controlsFolder.open()

/* =========================================================
   HDRI GUI CONTROLS
========================================================= */
const envFolder = gui.addFolder('HDRI')

// Exposure control
envFolder.add(renderer, 'toneMappingExposure', 0, 10, 0.01)

// Lighting vs background brightness
envFolder.add(scene, 'environmentIntensity', 0, 5, 0.01)
envFolder.add(scene, 'backgroundIntensity', 0, 5, 0.01)

// Rotate HDR lighting and background
envFolder.add(scene, 'environmentRotation', -Math.PI, Math.PI, 0.001)
envFolder.add(scene, 'backgroundRotation', -Math.PI, Math.PI, 0.001)

envFolder.open()

/* =========================================================
   LOAD HDRI
========================================================= */
new HDRLoader().load("/hdri/background4.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture
})

console.log(THREE.REVISION)

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

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

/* =========================================================
   MODEL + ANIMATION
========================================================= */
let gltfModel = null

const colorParams = {
  color: '#ffffff'
}
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.6,   // strength
  0.4,   // radius
  0.85   // threshold
)

composer.addPass(bloomPass)

const loader = new GLTFLoader()

let mixer = null
const clock = new THREE.Clock()

loader.load("/models/scene.gltf", (gltf) => {
  gltfModel = gltf.scene

  // Model transform
  gltfModel.scale.set(2.25, 2.25, 2.25)
  gltfModel.position.set(0, -3, 0)
  gltfModel.rotation.y = 0.5

  scene.add(gltfModel)

  /* ===== MODEL GUI ===== */
  const colorFolder = gui.addFolder('Model Color')

colorFolder
  .addColor(colorParams, 'color')
  .name('Base Color')
  .onChange((value) => {
    gltfModel.traverse((child) => {
      if (child.isMesh && child.material) {
        // Handle both single and multi-material meshes
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.color) mat.color.set(value)
          })
        } else {
          if (child.material.color) {
            child.material.color.set(value)
          }
        }
      }
    })
  })

colorFolder.open()


  /* ===== MODEL GUI ===== */
  const modelFolder = gui.addFolder('Model')

  modelFolder.add(gltfModel.position, 'x', -10, 10, 0.01)
  modelFolder.add(gltfModel.position, 'y', -10, 10, 0.01)
  modelFolder.add(gltfModel.position, 'z', -10, 10, 0.01)

  modelFolder.add(gltfModel.rotation, 'y', -Math.PI, Math.PI, 0.001)

  modelFolder.add(gltfModel.scale, 'x', 0.1, 5, 0.01).name('scale')
  modelFolder.add(gltfModel.scale, 'y', 0.1, 5, 0.01)
  modelFolder.add(gltfModel.scale, 'z', 0.1, 5, 0.01)

  modelFolder.open()

  // Enable shadows & reflection tuning
  gltfModel.traverse((child) => {
    if (child.isMesh) {
      child.material.envMapIntensity = 0.2
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  // Animation system
  mixer = new THREE.AnimationMixer(gltfModel)

  const clips = gltf.animations

  // ⚠️ This index expression resolves to the last value (25)
  const walk = mixer.clipAction(gltf.animations[35])

  if (clips.length > 0) {
    const action = mixer.clipAction(clips[0])
    action.play()
    walk.play()
  }
})

/* =========================================================
   gsap
========================================================= */



const bokehPass = new BokehPass(scene, camera, {
  focus: 6,
  aperture: 0.00015,
  maxblur: 0.01,
})

composer.addPass(bokehPass)

const cameraPath = [
  // Very far – establishing shot
  { x: 4,  y: 8, z: 8 },

]

window.addEventListener("load", () => {

  gsap.to(camera.position, {
  motionPath: {
    path: cameraPath,
    curviness: 1.2,
  },
  ease: "none",
  scrollTrigger: {
    trigger: ".section-1",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  onUpdate: () => {
    camera.lookAt(0, 1, 0)
  }
})

gsap.to(camera, {
  fov: 24,
  scrollTrigger: {
    trigger: ".section-1",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  },
  onUpdate: () => camera.updateProjectionMatrix()

  
})
gsap.to(bloomPass, {
  strength: 1.5,
  scrollTrigger: {
    trigger: ".section-1",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  }
})

gsap.to(bokehPass.uniforms.focus, {
  value: 10,
  scrollTrigger: {
    trigger: ".section-1",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  }
})

gsap.to(sunLight.position, {
  x: -4,
  y: 10,
  z: 2,
  scrollTrigger: {
    trigger: ".section-1",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
  }
})
  setTimeout(() => {
    ScrollTrigger.refresh()
  }, 100)
})

/* =========================================================
   MATERIAL GUI
========================================================= */
const materialFolder = gui.addFolder('Material')

materialFolder
  .add({ env: 0.2 }, 'env', 0, 3, 0.01)
  .name('envMapIntensity')
  .onChange((v) => {
    if (!gltfModel) return
    gltfModel.traverse((child) => {
      if (child.isMesh) {
        child.material.envMapIntensity = v
      }
    })
  })

materialFolder.open()

/* =========================================================
   SUN LIGHT
========================================================= */
const sunLight = new THREE.DirectionalLight(0xffe1b0, 1.3)
sunLight.position.set(2.3, 7, 7)
sunLight.castShadow = true

sunLight.shadow.mapSize.set(1024, 1024)
sunLight.shadow.camera.near = 0.1
sunLight.shadow.camera.far = 20

scene.add(sunLight)

// GUI for sun light
const sunFolder = gui.addFolder('Sun Light')

sunFolder.add(sunLight.position, 'x', -10, 10, 0.01)
sunFolder.add(sunLight.position, 'y', -10, 10, 0.01)
sunFolder.add(sunLight.position, 'z', -10, 10, 0.01)
sunFolder.add(sunLight, 'intensity', 0, 5, 0.01)

sunFolder.open()

/* =========================================================
   SHADOW CATCHER GROUND
========================================================= */
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.35 })
)

ground.rotation.x = -Math.PI / 2
ground.position.y = -4.1
ground.receiveShadow = true

scene.add(ground)


/* =========================================================
   RENDER LOOP
========================================================= */

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  const delta = clock.getDelta()
  if (mixer) mixer.update(delta)

 composer.render();
}

animate()

/* =========================================================
   RESIZE HANDLER
========================================================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
