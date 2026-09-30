// Quantamorph Limited — Interactive 3D WebGL Engine
// Implements scroll-driven 3D camera transitions, precision mechanical assembly rendering, and lighting

(function () {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Scene & Camera
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080c, 0.04);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 10);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x2563eb, 2.0);
  rimLight.position.set(-5, -5, -2);
  scene.add(rimLight);

  // Precision Engineering 3D Group (Geometric Mechanical Assembly)
  const assemblyGroup = new THREE.Group();

  // Materials: Metallic machined finish with cyan edge wireframe
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x181c28,
    metalness: 0.9,
    roughness: 0.25,
  });

  const bronzeMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a6230,
    metalness: 0.85,
    roughness: 0.3,
  });

  const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });

  // 1. Central Precision Machined Spindle / Fixture Core
  const cylinderGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.8, 32);
  const coreMesh = new THREE.Mesh(cylinderGeo, steelMaterial);
  assemblyGroup.add(coreMesh);

  const coreWire = new THREE.Mesh(cylinderGeo, wireframeMaterial);
  assemblyGroup.add(coreWire);

  // 2. Outer Multi-Axis Planetary Tooling Ring
  const ringGeo = new THREE.TorusGeometry(2.4, 0.2, 16, 64);
  const ringMesh = new THREE.Mesh(ringGeo, bronzeMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  assemblyGroup.add(ringMesh);

  // 3. Orbiting Precision Machined Retainer Blocks (Misumi-Style Spool Geometries)
  const blockGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const numBlocks = 6;
  const blocks = [];

  for (let i = 0; i < numBlocks; i++) {
    const angle = (i / numBlocks) * Math.PI * 2;
    const block = new THREE.Mesh(blockGeo, steelMaterial);
    block.position.set(Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4);
    block.rotation.y = -angle;
    assemblyGroup.add(block);
    blocks.push(block);
  }

  // 4. Precision Measurement Wireframe Grid Floor
  const gridHelper = new THREE.GridHelper(30, 30, 0x00f0ff, 0x151c2d);
  gridHelper.position.y = -3;
  scene.add(gridHelper);

  scene.add(assemblyGroup);

  // Scroll Tracking & Camera Dynamics
  let scrollY = 0;
  let targetScrollY = 0;
  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Responsive Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth scroll interpolation (Lerp)
    scrollY += (targetScrollY - scrollY) * 0.05;

    // 3D Assembly Rotation & Scroll-driven Transformation
    assemblyGroup.rotation.y = elapsedTime * 0.2 + scrollY * Math.PI * 2;
    assemblyGroup.rotation.x = 0.3 + scrollY * 0.5 + mouseY * 0.1;
    assemblyGroup.rotation.z = mouseX * 0.1;

    // Camera positions based on scroll stage
    // Stage 1 (Hero): Centered right
    // Stage 2 (Design): Shifts left, zooms into assembly
    // Stage 3 (Manufacturing): Shifts right, tilts down
    // Stage 4 (Matrix): Exploded top-down view
    const targetCamX = Math.sin(scrollY * Math.PI * 2) * 2.5 + mouseX * 0.5;
    const targetCamY = -scrollY * 2 + mouseY * 0.5;
    const targetCamZ = 8 - Math.sin(scrollY * Math.PI) * 2;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);

    // Dynamic Block Oscillation
    blocks.forEach((block, idx) => {
      block.position.y = Math.sin(elapsedTime * 2 + idx) * 0.15;
    });

    renderer.render(scene, camera);
  }

  animate();
})();
