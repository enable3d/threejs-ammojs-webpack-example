// three.js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// physics
import { AmmoPhysics, ExtendedMesh, PhysicsLoader } from '@enable3d/ammo-physics'

// CSG
import { CSG } from '@enable3d/three-graphics/jsm/csg'

// Flat
import { TextTexture, TextSprite } from '@enable3d/three-graphics/jsm/flat'

console.log('Three.js version r' + THREE.REVISION)

const MainScene = () => {
  // sizes
  const width = window.innerWidth
  const height = window.innerHeight

  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // camera
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(10, 10, 20)
  camera.lookAt(0, 0, 0)

  // you can access Ammo directly if you want
  // new Ammo.btVector3(1, 2, 3).y()

  // 2d camera/2d scene
  const scene2d = new THREE.Scene()
  const camera2d = new THREE.OrthographicCamera(0, width, height, 0, 1, 1000)
  camera2d.position.setZ(10)

  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.autoClear = false
  document.body.appendChild(renderer.domElement)

  // csg
  const mat = new THREE.MeshNormalMaterial()
  const meshA = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1))
  const meshB = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16))
  meshA.position.set(3, 3, 0)
  meshB.position.set(3.25, 3.1, 0.4)
  const meshC_0 = CSG.intersect(meshA, meshB)
  const meshC_1 = CSG.subtract(meshA, meshB)
  const meshC_2 = CSG.union(meshA, meshB)
  meshC_0.material = mat
  meshC_1.material = mat
  meshC_2.material = mat
  meshC_0.position.setX(3)
  meshC_1.position.setX(5)
  meshC_2.position.setX(7)
  scene.add(meshC_0, meshC_1, meshC_2)

  // add 2d text
  const text = new TextTexture('some 2d text', { fontWeight: 'bold', fontSize: 48 })
  const sprite = new TextSprite(text)
  const scale = 0.5
  sprite.setScale(scale)
  sprite.setPosition(0 + (text.width * scale) / 2 + 12, height - (text.height * scale) / 2 - 12)
  scene2d.add(sprite)

  // dpr
  const DPR = window.devicePixelRatio
  renderer.setPixelRatio(Math.min(2, DPR))

  // orbit controls
  new OrbitControls(camera, renderer.domElement)

  // light
  scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 1))
  scene.add(new THREE.AmbientLight(0x666666))
  const light = new THREE.DirectionalLight(0xdfebff, 1)
  light.position.set(50, 200, 100)
  light.position.multiplyScalar(1.3)

  // physics
  const physics = new AmmoPhysics(scene as any)
  physics.debug?.enable()

  // extract the object factory from physics
  // the factory will make/add object without physics
  const { factory } = physics

  // blue box
  physics.add.box({ x: 0.05, y: 10 }, { lambert: { color: 0x2194ce } })

  // static ground
  physics.add.ground({ width: 20, height: 20 })

  // add a normal sphere using the object factory
  // (NOTE: This will be factory.add.sphere() in the future)
  // first parameter is the config for the geometry
  // second parameter is for the material
  // you could also add a custom material like so { custom: new THREE.MeshLambertMaterial({ color: 0x00ff00 }) }
  const greenSphere = factory.add.sphere({ y: 2, z: 5 }, { lambert: { color: 0x00ff00 } })
  // once the object is created, you can add physics to it
  physics.add.existing(greenSphere)

  // green box
  const geometry = new THREE.BoxBufferGeometry()
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
  const cube = new ExtendedMesh(geometry, material)
  cube.position.set(0, 5, 0)
  scene.add(cube)
  physics.add.existing(cube as any)
  cube.body.setCollisionFlags(2) // make it kinematic

  // merge children to compound shape
  const exclamationMark = () => {
    const material = new THREE.MeshLambertMaterial({ color: 0xffff00 })

    const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.25), material)
    sphere.position.set(0, -0.8, 0)

    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.4, 0.8, 0.4), material)
    cube.position.set(5, 2, 5)

    cube.add(sphere)
    scene.add(cube)

    cube.position.set(5, 5, 5)
    cube.rotation.set(0, 0.4, 0.2)

    physics.add.existing(cube as any)
  }
  exclamationMark()

  // clock
  const clock = new THREE.Clock()

  // loop
  const animate = () => {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    cube.body.needUpdate = true // this is how you update kinematic bodies

    physics.update(clock.getDelta() * 1000)
    physics.updateDebugger()

    // you have to clear and call render twice because there are 2 scenes
    // one 3d scene and one 2d scene
    renderer.clear()
    renderer.render(scene, camera)
    renderer.clearDepth()
    renderer.render(scene2d, camera2d)

    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}

// '/ammo' is the folder where all ammo file are
PhysicsLoader('/ammo', () => MainScene())
