import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 400 })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */

// Parameters
const parameters = {
    count: 1000,
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 0,
    randomness: 0.2,
    randomnessPower: 2,
    insideColor: '#ffffff',
    outsideColor: '#ffffff',
}

// galaxy parameters declared beforehand in order to be able to destroy the old galaxy
let galaxyGeometry = null
let galaxyMaterials = null
let galaxyPoints = null

// Geometry
const generateGalaxy = () => {

    // Destroying the old galaxy
    if (galaxyPoints !== null) {
        galaxyGeometry.dispose()
        galaxyMaterials.dispose()
        scene.remove(galaxyPoints)
    }

    // Geometry
    galaxyGeometry = new THREE.BufferGeometry()
    let galaxyPositions = new Float32Array(parameters.count * 3)
    let galaxyColors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {

        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

        galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        galaxyPositions[i3 + 1] = randomY
        galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        galaxyColors[i3] = mixedColor.r
        galaxyColors[i3 + 1] = mixedColor.g
        galaxyColors[i3 + 2] = mixedColor.b

    }
    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3))
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3))

    // Materials
    galaxyMaterials = new THREE.PointsMaterial({ 
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Points
    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterials)
    scene.add(galaxyPoints)
}
generateGalaxy()

// controls for count and size
gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(1).max(30).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-6).max(6).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.01).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/8.png')

/**
 * Particles
 */
// Geometry
// const particlesGeometry = new THREE.BufferGeometry()
// const count = 200000
// const positions = new Float32Array(count * 3);
// const colors = new Float32Array(count * 3)
// for (let i = 0; i < count; i++) {
//     positions[i] = (Math.random() - 0.5) * 10
//     colors[i] = Math.random()
// }
// particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// Materials
// const particlesMaterial = new THREE.PointsMaterial()
// particlesMaterial.size = 0.01
// particlesMaterial.sizeAttenuation = true
// // particlesMaterial.color = new THREE.Color('green')
// particlesMaterial.alphaMap = particleTexture
// particlesMaterial.transparent = true
// // particlesMaterial.alphaTest = 0.001
// // particleTexture.depthText = false
// particlesMaterial.depthWrite = false
// particlesMaterial.blending = THREE.AdditiveBlending
// particlesMaterial.vertexColors = true

// Points
// const particles = new THREE.Points(particlesGeometry, particlesMaterial)
// scene.add(particles)

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
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update particles to spin
    // particles.rotation.y = elapsedTime * 0.2

    // To create a wavelike effect with all the particles
    // for (let i = 0; i < count; i++) {
    //     let i3 = i * 3
    //     let x = particlesGeometry.attributes.position.array[i3]
    //     particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    // }
    // particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()