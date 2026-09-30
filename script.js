// Quantamorph Limited — Simple 3D Rod Machining Animation
// Simulates a 100 mm cylindrical bar undergoing:
// 1. Raw Billet (Solid 100 mm bar)
// 2. Lathe Turning (Stepped diameter cut)
// 3. Central Hole Drilling & Milling
// 4. Threading (Helical thread rings generated on front step)
// 5. Inspection (Clean measurement datum pass)
// 6. Boxed Packaging for Dispatch

(function () {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.03);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(5, 7, 5);
  scene.add(keyLight);

  const softRim = new THREE.DirectionalLight(0x2997ff, 1.8);
  softRim.position.set(-6, -4, -3);
  scene.add(softRim);

  // Master Transformation Group
  const transformGroup = new THREE.Group();

  // Materials
  const rawMetalMat = new THREE.MeshStandardMaterial({
    color: 0x474d5a,
    metalness: 0.6,
    roughness: 0.45,
  });

  const machinedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x242833,
    metalness: 0.95,
    roughness: 0.2,
  });

  const threadMat = new THREE.MeshStandardMaterial({
    color: 0x2997ff,
    metalness: 0.85,
    roughness: 0.25,
  });

  const toolMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    metalness: 0.9,
    roughness: 0.1,
  });

  const crateMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    metalness: 0.3,
    roughness: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  // 1. Raw Cylindrical Rod (100 mm proportional length: length 4.4, radius 0.8)
  const rodGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.4, 32);
  const mainRodMesh = new THREE.Mesh(rodGeo, rawMetalMat);
  mainRodMesh.rotation.z = Math.PI / 2;
  transformGroup.add(mainRodMesh);

  // 2. Turned Stepped Front Diameter (Appears during turning)
  const stepGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
  const turnedStepMesh = new THREE.Mesh(stepGeo, machinedSteelMat);
  turnedStepMesh.position.set(1.3, 0, 0);
  turnedStepMesh.rotation.z = Math.PI / 2;
  turnedStepMesh.scale.set(0.001, 0.001, 0.001);
  transformGroup.add(turnedStepMesh);

  // 3. Drilled Central Hole Feature
  const boreGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 24);
  const drilledHoleMesh = new THREE.Mesh(boreGeo, machinedSteelMat);
  drilledHoleMesh.position.set(2.0, 0, 0);
  drilledHoleMesh.rotation.z = Math.PI / 2;
  drilledHoleMesh.scale.set(0.001, 0.001, 0.001);
  transformGroup.add(drilledHoleMesh);

  // 4. Helical Thread Rings (Appear during threading)
  const threadRings = [];
  const numRings = 7;
  for (let i = 0; i < numRings; i++) {
    const ringGeo = new THREE.TorusGeometry(0.52, 0.035, 12, 32);
    const ring = new THREE.Mesh(ringGeo, threadMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0.6 + i * 0.2, 0, 0);
    ring.visible = false;
    transformGroup.add(ring);
    threadRings.push(ring);
  }

  // 5. Lathe / Milling Cutter Tool
  const toolMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 1.2),
    toolMat
  );
  toolMesh.position.set(1.4, 1.3, 0.8);
  toolMesh.visible = false;
  transformGroup.add(toolMesh);

  // 6. Packaging Box
  const crateMesh = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 2.0, 2.0),
    crateMat
  );
  crateMesh.visible = false;
  transformGroup.add(crateMesh);

  scene.add(transformGroup);

  // Scroll Tracking
  let scrollProgress = 0;
  let targetProgress = 0;
  let mouseX = 0;
  let mouseY = 0;

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

    // Lerp scroll
    scrollProgress += (targetProgress - scrollProgress) * 0.06;

    // Spin component along cylinder axis like in a lathe spindle
    mainRodMesh.rotation.y = elapsedTime * 1.5;
    turnedStepMesh.rotation.y = elapsedTime * 1.5;

    // 6-STAGE SIMPLE TRANSFORMATION LOGIC
    // 0.00 - 0.16: Raw 100mm Rod
    // 0.16 - 0.33: Turning (Stepped cut forms, tool active)
    // 0.33 - 0.50: Drilling (Center bore forms)
    // 0.50 - 0.66: Threading (Thread rings appear)
    // 0.66 - 0.83: Quality Inspection
    // 0.83 - 1.00: Packaging & Dispatch (Box closes)

    if (scrollProgress < 0.16) {
      // Raw Rod
      mainRodMesh.material = rawMetalMat;
      turnedStepMesh.scale.set(0.001, 0.001, 0.001);
      drilledHoleMesh.scale.set(0.001, 0.001, 0.001);
      threadRings.forEach((r) => (r.visible = false));
      toolMesh.visible = false;
      crateMesh.visible = false;
    } else if (scrollProgress >= 0.16 && scrollProgress < 0.33) {
      // Turning
      const p = (scrollProgress - 0.16) / 0.17;
      mainRodMesh.material = machinedSteelMat;
      turnedStepMesh.scale.set(p, p, p);
      toolMesh.visible = true;
      toolMesh.position.x = 0.6 + p * 1.2;
      toolMesh.position.y = 1.0 + Math.sin(elapsedTime * 6) * 0.1;
      drilledHoleMesh.scale.set(0.001, 0.001, 0.001);
      threadRings.forEach((r) => (r.visible = false));
      crateMesh.visible = false;
    } else if (scrollProgress >= 0.33 && scrollProgress < 0.5) {
      // Drilling
      const p = (scrollProgress - 0.33) / 0.17;
      turnedStepMesh.scale.set(1, 1, 1);
      drilledHoleMesh.scale.set(p, p, p);
      toolMesh.visible = true;
      toolMesh.position.set(2.2 - p * 0.4, 0, 0);
      threadRings.forEach((r) => (r.visible = false));
      crateMesh.visible = false;
    } else if (scrollProgress >= 0.5 && scrollProgress < 0.66) {
      // Threading
      turnedStepMesh.scale.set(1, 1, 1);
      drilledHoleMesh.scale.set(1, 1, 1);
      toolMesh.visible = true;
      toolMesh.position.set(1.2, 0.8, 0.6);
      threadRings.forEach((r) => (r.visible = true));
      crateMesh.visible = false;
    } else if (scrollProgress >= 0.66 && scrollProgress < 0.83) {
      // Quality Inspection
      toolMesh.visible = false;
      threadRings.forEach((r) => (r.visible = true));
      crateMesh.visible = false;
    } else {
      // Packing & Delivery
      toolMesh.visible = false;
      threadRings.forEach((r) => (r.visible = true));
      crateMesh.visible = true;
    }

    // Dynamic Camera Tracking (Shifts Left/Right naturally)
    const stageSign = Math.sin(scrollProgress * Math.PI * 4);
    const targetCamX = stageSign * 1.6 + mouseX * 0.25;
    const targetCamY = -scrollProgress * 1.2 + mouseY * 0.25;
    const targetCamZ = 8.5 - Math.sin(scrollProgress * Math.PI) * 1.2;

    camera.position.x += (targetCamX - camera.position.x) * 0.05;
    camera.position.y += (targetCamY - camera.position.y) * 0.05;
    camera.position.z += (targetCamZ - camera.position.z) * 0.05;

    // Component Orbital Angles
    transformGroup.rotation.y = elapsedTime * 0.12 + scrollProgress * Math.PI * 1.5;
    transformGroup.rotation.x = 0.25 + mouseY * 0.1;

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  animate();
})();
