// Quantamorph Limited — Scroll-Driven Mechanical Part Lifecycle Engine
// Transforms 3D geometry across 5 stages:
// Stage 0: Solid Raw Rectangle Billet
// Stage 1: Holes Plunged & Pocket Roughing (Endmill Cutter Active)
// Stage 2: Outer Profile Finishing, Chamfers & Fine Surface
// Stage 3: Metrology Inspection Probe & Laser Surface Scan
// Stage 4: Finished Protective Packaging Box & Dispatch Crate

(function () {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.035);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const blueRim = new THREE.DirectionalLight(0x2997ff, 2.5);
  blueRim.position.set(-6, -4, -3);
  scene.add(blueRim);

  const cyanLight = new THREE.PointLight(0x00f0ff, 1.5, 12);
  cyanLight.position.set(0, 3, 3);
  scene.add(cyanLight);

  // Master Transformation Group
  const transformGroup = new THREE.Group();

  // Materials
  const rawStockMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f4d,
    metalness: 0.6,
    roughness: 0.5,
  });

  const machinedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x2b313d,
    metalness: 0.95,
    roughness: 0.22,
  });

  const bronzeBushingMat = new THREE.MeshStandardMaterial({
    color: 0xa87932,
    metalness: 0.9,
    roughness: 0.25,
  });

  const cutterMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    metalness: 0.9,
    roughness: 0.1,
  });

  const probeMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // Ruby CMM stylus tip
    metalness: 0.2,
    roughness: 0.1,
  });

  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    metalness: 0.4,
    roughness: 0.8,
    transparent: true,
    opacity: 0.85,
  });

  // 1. Core Component Geometry Hierarchy
  // Main Base Body
  const baseGeo = new THREE.BoxGeometry(3.6, 2.2, 1.2);
  const mainPartMesh = new THREE.Mesh(baseGeo, rawStockMat);
  transformGroup.add(mainPartMesh);

  // Internal Pocket (Appears during roughing)
  const pocketGeo = new THREE.BoxGeometry(1.8, 1.1, 0.7);
  const pocketMesh = new THREE.Mesh(pocketGeo, machinedSteelMat);
  pocketMesh.position.set(0, 0, 0.35);
  pocketMesh.scale.set(0.001, 0.001, 0.001);
  transformGroup.add(pocketMesh);

  // Drilled Hole Features (Hole cylinders appear during roughing)
  const holeGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.3, 24);
  const holes = [];
  const holePositions = [
    [-1.2, 0.6, 0],
    [1.2, 0.6, 0],
    [-1.2, -0.6, 0],
    [1.2, -0.6, 0],
  ];

  holePositions.forEach((pos) => {
    const hole = new THREE.Mesh(holeGeo, bronzeBushingMat);
    hole.position.set(pos[0], pos[1], pos[2]);
    hole.scale.set(0.001, 0.001, 0.001);
    transformGroup.add(hole);
    holes.push(hole);
  });

  // Wireframe Datum Overlay
  const wireOverlay = new THREE.Mesh(baseGeo, wireframeMat);
  wireOverlay.scale.set(1.02, 1.02, 1.02);
  wireOverlay.visible = false;
  transformGroup.add(wireOverlay);

  // 2. Active CNC Endmill Tooling (Stage 1-2)
  const toolGroup = new THREE.Group();
  const cutterGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.6, 16);
  const cutterMesh = new THREE.Mesh(cutterGeo, cutterMat);
  toolGroup.add(cutterMesh);
  toolGroup.position.set(1.4, 1.8, 1.2);
  transformGroup.add(toolGroup);

  // 3. CMM Quality Inspection Ruby Probe (Stage 3)
  const probeGroup = new THREE.Group();
  const probeStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16);
  const probeStem = new THREE.Mesh(probeStemGeo, machinedSteelMat);
  const rubyTipGeo = new THREE.SphereGeometry(0.18, 24, 24);
  const rubyTip = new THREE.Mesh(rubyTipGeo, probeMat);
  rubyTip.position.y = -0.9;
  probeGroup.add(probeStem);
  probeGroup.add(rubyTip);
  probeGroup.position.set(0, 2.5, 0.8);
  probeGroup.visible = false;
  transformGroup.add(probeGroup);

  // 4. Protective Packaging Crate (Stage 4)
  const crateGeo = new THREE.BoxGeometry(4.2, 2.8, 1.8);
  const crateMesh = new THREE.Mesh(crateGeo, crateMat);
  crateMesh.visible = false;
  transformGroup.add(crateMesh);

  // Metrology Inspection Floor Grid
  const gridHelper = new THREE.GridHelper(30, 30, 0x2997ff, 0x161820);
  gridHelper.position.y = -2.6;
  scene.add(gridHelper);

  scene.add(transformGroup);

  // Scroll Tracking & Camera Dynamics
  let scrollProgress = 0;
  let targetProgress = 0;
  let mouseX = 0;
  let mouseY = 0;

  const hudStageName = document.getElementById('hud-stage-name');

  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
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

    // Lerp scroll progress
    scrollProgress += (targetProgress - scrollProgress) * 0.06;

    // High-speed Tool Spinning
    cutterMesh.rotation.y = elapsedTime * 18;

    // 5-STAGE PHYSICAL TRANSFORMATION LOGIC
    // Stage 0 -> 1: Raw Stock Billet (0.0 to 0.20)
    // Stage 1 -> 2: Drilling & Roughing (0.20 to 0.40)
    // Stage 2 -> 3: Precision Finishing (0.40 to 0.60)
    // Stage 3 -> 4: Quality & CMM Inspection (0.60 to 0.80)
    // Stage 4 -> 5: Dispatch Packaging (0.80 to 1.00)

    if (scrollProgress < 0.2) {
      // RAW STOCK
      mainPartMesh.material = rawStockMat;
      pocketMesh.scale.set(0.001, 0.001, 0.001);
      holes.forEach((h) => h.scale.set(0.001, 0.001, 0.001));
      toolGroup.visible = false;
      probeGroup.visible = false;
      wireOverlay.visible = false;
      crateMesh.visible = false;
      if (hudStageName) hudStageName.innerText = 'STAGE 01 // RAW CERTIFIED BILLET';
    } else if (scrollProgress >= 0.2 && scrollProgress < 0.4) {
      // CNC DRILLING & ROUGHING
      const p = (scrollProgress - 0.2) / 0.2;
      mainPartMesh.material = machinedSteelMat;
      pocketMesh.scale.set(p, p, p);
      holes.forEach((h) => h.scale.set(p, p, p));
      toolGroup.visible = true;
      toolGroup.position.x = Math.sin(elapsedTime * 4) * 1.2;
      toolGroup.position.y = 1.0 + Math.cos(elapsedTime * 3) * 0.3;
      probeGroup.visible = false;
      wireOverlay.visible = false;
      crateMesh.visible = false;
      if (hudStageName) hudStageName.innerText = 'STAGE 02 // CNC ROUGHING & DRILLING';
    } else if (scrollProgress >= 0.4 && scrollProgress < 0.6) {
      // PRECISION FINISHING
      pocketMesh.scale.set(1, 1, 1);
      holes.forEach((h) => h.scale.set(1, 1, 1));
      toolGroup.visible = true;
      toolGroup.position.x = Math.cos(elapsedTime * 6) * 1.6;
      toolGroup.position.y = 0.8;
      probeGroup.visible = false;
      wireOverlay.visible = true;
      crateMesh.visible = false;
      if (hudStageName) hudStageName.innerText = 'STAGE 03 // 5-AXIS FINISHING & CHAMFERS';
    } else if (scrollProgress >= 0.6 && scrollProgress < 0.8) {
      // QUALITY CMM INSPECTION
      toolGroup.visible = false;
      probeGroup.visible = true;
      probeGroup.position.x = Math.sin(elapsedTime * 2) * 1.2;
      probeGroup.position.z = Math.cos(elapsedTime * 2) * 0.6 + 0.6;
      probeGroup.position.y = 1.2 + Math.abs(Math.sin(elapsedTime * 4)) * 0.4;
      wireOverlay.visible = true;
      crateMesh.visible = false;
      if (hudStageName) hudStageName.innerText = 'STAGE 04 // 100% CMM METROLOGY INSPECTION';
    } else {
      // DISPATCH & PACKAGING
      toolGroup.visible = false;
      probeGroup.visible = false;
      wireOverlay.visible = false;
      crateMesh.visible = true;
      crateMesh.scale.set(1, 1, 1);
      if (hudStageName) hudStageName.innerText = 'STAGE 05 // PROTECTIVE PACKING & DISPATCH';
    }

    // Dynamic Camera Tracking (Shifts Left/Right as user scrolls past cards)
    const stageSign = Math.sin(scrollProgress * Math.PI * 4);
    const targetCamX = stageSign * 1.8 + mouseX * 0.3;
    const targetCamY = -scrollProgress * 1.5 + mouseY * 0.3;
    const targetCamZ = 8.5 - Math.sin(scrollProgress * Math.PI) * 1.5;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;

    // Part Rotational Dynamics
    transformGroup.rotation.y = elapsedTime * 0.15 + scrollProgress * Math.PI * 2;
    transformGroup.rotation.x = 0.35 + mouseY * 0.1;
    transformGroup.rotation.z = mouseX * 0.05;

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  animate();
})();
