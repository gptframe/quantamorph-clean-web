// Quantamorph Limited — Interactive 3D WebGL Mechanical Component Engine
// Renders CNC Turned Shaft, Helical Gear, and Multi-Flute Milling Tool Assembly

(function () {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Scene & Depth Fog
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
  keyLight.position.set(6, 6, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x2563eb, 2.0);
  rimLight.position.set(-6, -4, -3);
  scene.add(rimLight);

  const toolLight = new THREE.PointLight(0xffffff, 1.2, 10);
  toolLight.position.set(0, 2, 4);
  scene.add(toolLight);

  // 3D Machined Mechanical Component Assembly Group
  const mechAssembly = new THREE.Group();

  // Materials: Machined Steel, Ground Bronze, and Tool Carbide
  const turnedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x222836,
    metalness: 0.95,
    roughness: 0.2,
  });

  const bronzeWearMat = new THREE.MeshStandardMaterial({
    color: 0x966838,
    metalness: 0.85,
    roughness: 0.3,
  });

  const carbideToolMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    metalness: 0.9,
    roughness: 0.1,
  });

  const wireCyanMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });

  // 1. CNC Turned Stepped Shaft with Keyway Collar
  const shaftGeo1 = new THREE.CylinderGeometry(0.8, 0.8, 4.2, 32);
  const shaft1 = new THREE.Mesh(shaftGeo1, turnedSteelMat);
  shaft1.rotation.z = Math.PI / 2;
  mechAssembly.add(shaft1);

  const shaftCollarGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.9, 32);
  const collar = new THREE.Mesh(shaftCollarGeo, bronzeWearMat);
  collar.rotation.z = Math.PI / 2;
  mechAssembly.add(collar);

  // 2. Precision Helical Spur Gear with Teeth (Turning / Milling Output)
  const gearHubGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.6, 24);
  const gearHub = new THREE.Mesh(gearHubGeo, turnedSteelMat);
  mechAssembly.add(gearHub);

  const gearWire = new THREE.Mesh(gearHubGeo, wireCyanMat);
  mechAssembly.add(gearWire);

  // Individual Gear Teeth around Circumference
  const numTeeth = 16;
  const toothGeo = new THREE.BoxGeometry(0.35, 0.5, 0.6);
  for (let i = 0; i < numTeeth; i++) {
    const angle = (i / numTeeth) * Math.PI * 2;
    const tooth = new THREE.Mesh(toothGeo, turnedSteelMat);
    tooth.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 2.0, 0);
    tooth.rotation.z = angle;
    mechAssembly.add(tooth);
  }

  // 3. Multi-Flute CNC Milling Endmill Cutter (Tooling in Action)
  const endmillGeo = new THREE.CylinderGeometry(0.35, 0.35, 2.2, 16);
  const endmill = new THREE.Mesh(endmillGeo, carbideToolMat);
  endmill.position.set(2.4, 1.6, 0.8);
  endmill.rotation.x = Math.PI / 4;
  mechAssembly.add(endmill);

  // 4. Metrology Measurement Floor Grid
  const gridHelper = new THREE.GridHelper(30, 30, 0x00f0ff, 0x151c2d);
  gridHelper.position.y = -3.2;
  scene.add(gridHelper);

  scene.add(mechAssembly);

  // Dynamic Scroll & Mouse Tracking
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

    // Lerp scroll
    scrollY += (targetScrollY - scrollY) * 0.05;

    // Component dynamic rotation: Gear spins continuously like on a lathe / milling bed
    gearHub.rotation.z = elapsedTime * 0.5;
    for (let i = 0; i < numTeeth; i++) {
      const tooth = mechAssembly.children[3 + i];
      if (tooth) tooth.rotation.z = (i / numTeeth) * Math.PI * 2 + elapsedTime * 0.5;
    }

    // Assembly orbital rotation driven by user scroll
    mechAssembly.rotation.y = elapsedTime * 0.15 + scrollY * Math.PI * 2;
    mechAssembly.rotation.x = 0.4 + scrollY * 0.4 + mouseY * 0.1;
    mechAssembly.rotation.z = mouseX * 0.1;

    // High-speed Endmill Milling Tool Rotation
    endmill.rotation.y = elapsedTime * 12;

    // Scroll-based camera navigation
    const targetCamX = Math.sin(scrollY * Math.PI * 2) * 2.2 + mouseX * 0.4;
    const targetCamY = -scrollY * 2.2 + mouseY * 0.4;
    const targetCamZ = 8.5 - Math.sin(scrollY * Math.PI) * 2.2;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
