import { Project, Scene3D, PhysicsLoader, THREE, ExtendedObject3D } from 'enable3d'

class MainScene extends Scene3D {
  box!: ExtendedObject3D

  constructor() {
    super({ key: 'MainScene' })
  }

  init() {
    console.log('init')

    this.renderer.setPixelRatio(1)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  preload() {
    console.log('preload')
  }

  create() {
    console.log('create')

    // set up scene (light, ground, grid, sky, orbitControls)
    this.warpSpeed()

    // enable physics debug
    this.physics.debug?.enable()

    // position camera
    this.camera.position.set(10, 10, 20)

    // blue box
    this.box = this.add.box({ y: 2 }, { lambert: { color: 'deepskyblue' } })

    // pink box
    this.physics.add.box({ y: 10 }, { lambert: { color: 'hotpink' } })

    // green sphere
    const geometry = new THREE.SphereGeometry(0.8, 16, 16)
    const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(0.2, 3, 0)
    this.scene.add(cube)
    // add physics to an existing object
    this.physics.add.existing(cube as any)
  }

  update() {
    this.box.rotation.x += 0.01
    this.box.rotation.y += 0.01
  }
}

PhysicsLoader('/ammo', () => new Project({ scenes: [MainScene], antialias: true }))
