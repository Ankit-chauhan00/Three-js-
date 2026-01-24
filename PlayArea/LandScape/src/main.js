import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GUI } from 'lil-gui'
import gsap from 'gsap'

/* =========================================================
   BASIC SETUP
========================================================= */

const gui = new GUI()
const canvas = document.querySelector('canvas.world')
const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.outputColorSpace = THREE.SRGBColorSpace

/* =========================================================
   CAMERA (PERSPECTIVE)
========================================================= */

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  500
)

camera.position.set(120, 60, 120)
scene.add(camera)

/* =========================================================
   CONTROLS
========================================================= */

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)
controls.update()

function lockControls(lock = true) {
  controls.enabled = !lock
}

/* =========================================================
   CAMERA GUI
========================================================= */

const camFolder = gui.addFolder('📷 Camera')

camFolder.add(camera.position, 'x', -300, 300, 0.1)
camFolder.add(camera.position, 'y', -300, 300, 0.1)
camFolder.add(camera.position, 'z', -300, 300, 0.1)

camFolder
  .add(camera, 'fov', 10, 120, 0.1)
  .onChange(() => camera.updateProjectionMatrix())

camFolder.open()

/* =========================================================
   LIGHTS
========================================================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.15))

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(5, 10, 7)
dirLight.castShadow = true
scene.add(dirLight)

const spotLight = new THREE.SpotLight(0xffffff, 2000, 300, 0.5, 1, 1)
spotLight.position.set(13, 60, -30)
spotLight.castShadow = true
spotLight.target.position.set(0, 30, 0)

scene.add(spotLight)
scene.add(spotLight.target)

/* =========================================================
   BACKGROUND
========================================================= */

const textureLoader = new THREE.TextureLoader()
scene.background = textureLoader.load('/textures/background.png', t => {
  t.colorSpace = THREE.SRGBColorSpace
})

/* =========================================================
   CAMERA PATH
========================================================= */

const cameraPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(120, 60, 120),
    new THREE.Vector3(30, 30, 40),
    new THREE.Vector3(12, -1, 18),
    new THREE.Vector3(6, -1, 12),
     new THREE.Vector3(0.66 ,-1.73, 8.45),

   new THREE.Vector3(-3.15 ,-1.54, 0.00)

],false,           // closed
  'centripetal',   // 🔥 THIS FIXES POINT ISSUES
  0.5)

  cameraPath.points.forEach((p, i) => {
  markPoint(p, i === 0 ? 0x00ff00 : 0xff0000)
})

// Debug line
const pathPoints = cameraPath.getPoints(100)
const pathLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(pathPoints),
  new THREE.LineBasicMaterial({ color: 0xff0000 })
)
scene.add(pathLine)

/* =========================================================
   CAMERA PATH PLAYER
========================================================= */
function markPoint(pos, color = 0x00ff00) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 12, 12),
    new THREE.MeshBasicMaterial({ color })
  )
  m.position.copy(pos)
  scene.add(m)
}

function playCameraPath({
  curve,
  duration = 6.5,
  
}) {
  const STOP_T = 0.72
  const BRIDGE_FOCUS = new THREE.Vector3(0, -1, 10)
  const state = { t: 0 }
  lockControls(true)

  gsap.to(state, {
    t: STOP_T,
    duration,
    repeat: 1,
    yoyo:true,
    ease: 'none',

  onUpdate: () => {
  const t = state.t

  const position = curve.getPointAt(t)
  camera.position.copy(position)

  const tangent = curve.getTangentAt(t)
  tangent.y *= 0.3
  tangent.normalize()


const forward = new THREE.Vector3()
camera.getWorldDirection(forward)
forward.normalize()
  const targetQuat = new THREE.Quaternion().setFromUnitVectors(
    forward,
    tangent
  )

  camera.quaternion.rotateTowards(targetQuat, 0.04)

  camera.rotation.z = THREE.MathUtils.lerp(
  camera.rotation.z,
  -tangent.x * 0.12,
  0.06
)
},
    onComplete: () => {
      lockControls(false)
    }
  })

  // TRUE dolly zoom
  gsap.to(camera, {
    fov: 28,
    duration: 5,
    ease: 'power2.inOut',
     repeat: 1,   // 🔥 REQUIRED
     yoyo: true,
    onUpdate: () => camera.updateProjectionMatrix()
  })
}

// ▶ Play once on load
playCameraPath({ curve: cameraPath })


/* =========================================================
   MODEL + INTERACTION
========================================================= */

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const originalEmissiveMap = new WeakMap()
let hoveredType = null

const GROUPS = {
  house: [],
  bridge: [],
  gazebo: [],
  lanterns: [],
  characters: [],
  water: []
}

const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/house.glb', gltf => {
  const model = gltf.scene
  model.position.y = -13

  model.traverse(child => {
    if (!child.isMesh) return

    child.castShadow = true
    child.receiveShadow = true

    const mat = child.material.clone()
    originalEmissiveMap.set(
      mat,
      mat.emissive?.clone() || new THREE.Color(0)
    )
    child.material = mat

    const n = child.name.toLowerCase()
    if (n.includes('house')) GROUPS.house.push(child)
    else if (n.includes('bridge')) GROUPS.bridge.push(child)
    else if (n.includes('gazebo')) GROUPS.gazebo.push(child)
    else if (n.includes('lantern')) GROUPS.lanterns.push(child)
    else if (n.includes('cat') || n.includes('sheep')) GROUPS.characters.push(child)
    else if (n.includes('water')) GROUPS.water.push(child)
  })

  scene.add(model)
})

function highlightGroup(type, on) {
  GROUPS[type]?.forEach(mesh => {
    const mat = mesh.material
    const original = originalEmissiveMap.get(mat)
    if (!original) return

    on ? mat.emissive.setHex(0x222222) : mat.emissive.copy(original)
  })
}

function getTypeFromName(name) {
  name = name.toLowerCase()
  if (name.includes('house')) return 'house'
  if (name.includes('bridge')) return 'bridge'
  if (name.includes('gazebo')) return 'gazebo'
  if (name.includes('lantern')) return 'lanterns'
  if (name.includes('cat') || name.includes('sheep')) return 'characters'
  if (name.includes('water')) return 'water'
  return null
}

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const meshes = Object.values(GROUPS).flat()
  const hits = raycaster.intersectObjects(meshes)

  if (!hits.length) {
    if (hoveredType) highlightGroup(hoveredType, false)
    hoveredType = null
    document.body.style.cursor = 'default'
    return
  }

  const type = getTypeFromName(hits[0].object.name)
  if (type && type !== hoveredType) {
    if (hoveredType) highlightGroup(hoveredType, false)
    hoveredType = type
    highlightGroup(type, true)
    document.body.style.cursor = 'pointer'
  }
})

/* =========================================================
   RENDER LOOP
========================================================= */
let frame = 0
function animate() {
  requestAnimationFrame(animate)

    frame++
  if (frame % 30 === 0) { // ~2 times per second
    console.log(
      '📷 Camera:',
      camera.position.x.toFixed(2),
      camera.position.y.toFixed(2),
      camera.position.z.toFixed(2),
      'FOV:',
      camera.fov.toFixed(1)
    )
  }
  controls.update()
  renderer.render(scene, camera)
}
animate()

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
