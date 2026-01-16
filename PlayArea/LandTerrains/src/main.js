import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Debug
const gui = new dat.GUI()

// texture Loader
const loader = new THREE.TextureLoader()
const height =loader.load('../height3.png')
const texture = loader.load('../texture.jpg')
const alpha = loader.load('../alpha 1.png')
// Canvas
const canvas = document.querySelector('canvas.world')

// Scene
const scene = new THREE.Scene()


// Objects
const geometry = new THREE.PlaneGeometry(3,3,100,100)

// Materials
const material = new THREE.MeshStandardMaterial({
  color: 'white',
  map: texture,
  displacementMap: height,
  displacementScale: 0.3,
  alphaMap: alpha,
  transparent : true,
  depthTest: true,
})


// Mesh
const plane = new THREE.Mesh(geometry,material);
plane.rotation.x = 5;
plane.position.y =-0.5 ;
scene.add(plane)

gui.add(plane.rotation,'x').min(0).max(20).name("PlaneRotation")

// Lights

const pointLight = new THREE.PointLight(0xffffff, 50)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
gui.add(pointLight.position,'x').min(0).max(20).name('positionLight-x')
gui.add(pointLight.position,'y').min(0).max(20).name('positionLight-y')
gui.add(pointLight.position,'z').min(0).max(20).name('positionLight-z')
const col = {color : '#00ff00'};
gui.addColor(col,'color').onChange(()=>{
  pointLight.color.set(col.color);
}).name("pointLightColor")

const bg = {color: "#123ff2"}
gui.addColor(bg,'color').onChange(()=>{
  scene.background = new THREE.Color(bg.color);
}).name('backgroundColor')

scene.add(pointLight)


// const dirLight = new THREE.DirectionalLight(0xffffff,1)
// scene.add(dirLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}




window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1.3
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const controls = new OrbitControls(camera, renderer.domElement);
/**
 * Animate
 */

const clock = new THREE.Clock()
let mouseY = 0;
const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    plane.rotation.z = elapsedTime *0.3;
    plane.material.displacementScale = mouseY *0.0005;

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
document.addEventListener('mousemove',animateTerrain);
function animateTerrain(event){
  mouseY = event.clientY;
}