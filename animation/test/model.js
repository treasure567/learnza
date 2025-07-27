// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// Camera setup
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 2.5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild(renderer.domElement);

// Lighting setup for portrait lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(1, 2, 2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 4096;
keyLight.shadow.mapSize.height = 4096;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 10;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-1, 1, 1);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
rimLight.position.set(0, 1, -2);
scene.add(rimLight);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.4, 0);

// Materials
const skinMaterial = new THREE.MeshLambertMaterial({
    color: 0xfdbcb4,
});

const hairMaterial = new THREE.MeshLambertMaterial({
    color: 0x8b6f47,
});

const shirtMaterial = new THREE.MeshLambertMaterial({
    color: 0x1a1a1a,
});

const eyeMaterial = new THREE.MeshLambertMaterial({
    color: 0x4a4a4a,
});

const eyebrowMaterial = new THREE.MeshLambertMaterial({
    color: 0x6b4423,
});

// Create main body group
const body = new THREE.Group();

// Enhanced head creation
function createHead() {
    const head = new THREE.Group();
    
    // Main head shape - more realistic proportions
    const headGeometry = new THREE.SphereGeometry(0.11, 64, 64);
    headGeometry.scale(1, 1.15, 0.85);
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.position.y = 1.65;
    head.add(headMesh);
    
    // Forehead definition
    const foreheadGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    foreheadGeometry.scale(1.2, 0.8, 1);
    const forehead = new THREE.Mesh(foreheadGeometry, skinMaterial);
    forehead.position.set(0, 1.72, 0.05);
    head.add(forehead);
    
    // Cheekbones
    const cheekGeometry = new THREE.SphereGeometry(0.03, 32, 32);
    const leftCheek = new THREE.Mesh(cheekGeometry, skinMaterial);
    leftCheek.position.set(-0.06, 1.63, 0.08);
    const rightCheek = new THREE.Mesh(cheekGeometry, skinMaterial);
    rightCheek.position.set(0.06, 1.63, 0.08);
    head.add(leftCheek);
    head.add(rightCheek);
    
    // Eyes - more detailed
    const eyeGeometry = new THREE.SphereGeometry(0.012, 32, 32);
    eyeGeometry.scale(1.2, 1, 0.8);
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.035, 1.67, 0.095);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.035, 1.67, 0.095);
    head.add(leftEye);
    head.add(rightEye);
    
    // Eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.025, 0.003, 0.008);
    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.035, 1.685, 0.1);
    leftEyebrow.rotation.z = 0.1;
    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.035, 1.685, 0.1);
    rightEyebrow.rotation.z = -0.1;
    head.add(leftEyebrow);
    head.add(rightEyebrow);
    
    // Nose - more defined
    const noseGeometry = new THREE.BoxGeometry(0.012, 0.025, 0.015);
    const nose = new THREE.Mesh(noseGeometry, skinMaterial);
    nose.position.set(0, 1.655, 0.105);
    head.add(nose);
    
    // Nostrils
    const nostrilGeometry = new THREE.SphereGeometry(0.003, 16, 16);
    const leftNostril = new THREE.Mesh(nostrilGeometry, eyeMaterial);
    leftNostril.position.set(-0.004, 1.645, 0.11);
    const rightNostril = new THREE.Mesh(nostrilGeometry, eyeMaterial);
    rightNostril.position.set(0.004, 1.645, 0.11);
    head.add(leftNostril);
    head.add(rightNostril);
    
    // Mouth
    const mouthGeometry = new THREE.BoxGeometry(0.025, 0.004, 0.008);
    const mouth = new THREE.Mesh(mouthGeometry, new THREE.MeshLambertMaterial({ color: 0xd4756b }));
    mouth.position.set(0, 1.62, 0.105);
    head.add(mouth);
    
    // Chin definition
    const chinGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    chinGeometry.scale(1, 0.8, 1.2);
    const chin = new THREE.Mesh(chinGeometry, skinMaterial);
    chin.position.set(0, 1.58, 0.08);
    head.add(chin);
    
    // Ears
    const earGeometry = new THREE.SphereGeometry(0.015, 32, 32);
    earGeometry.scale(0.7, 1, 0.5);
    const leftEar = new THREE.Mesh(earGeometry, skinMaterial);
    leftEar.position.set(-0.105, 1.66, 0);
    const rightEar = new THREE.Mesh(earGeometry, skinMaterial);
    rightEar.position.set(0.105, 1.66, 0);
    head.add(leftEar);
    head.add(rightEar);
    
    return head;
}

// Realistic hair creation
function createHair() {
    const hair = new THREE.Group();
    
    // Main hair volume
    const mainHairGeometry = new THREE.SphereGeometry(0.115, 64, 64);
    mainHairGeometry.scale(1, 1.1, 0.9);
    const mainHair = new THREE.Mesh(mainHairGeometry, hairMaterial);
    mainHair.position.y = 1.72;
    hair.add(mainHair);
    
    // Hair strands for more detail
    for (let i = 0; i < 20; i++) {
        const strandGeometry = new THREE.CylinderGeometry(0.002, 0.001, 0.05, 8);
        const strand = new THREE.Mesh(strandGeometry, hairMaterial);
        const angle = (i / 20) * Math.PI * 2;
        strand.position.set(
            Math.cos(angle) * 0.11,
            1.75 + Math.random() * 0.03,
            Math.sin(angle) * 0.11
        );
        strand.rotation.x = Math.random() * 0.3;
        strand.rotation.z = Math.random() * 0.3;
        hair.add(strand);
    }
    
    return hair;
}

// Enhanced neck
function createNeck() {
    const neckGeometry = new THREE.CylinderGeometry(0.045, 0.055, 0.15, 32);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 1.45;
    return neck;
}

// Detailed torso
function createTorso() {
    const torso = new THREE.Group();
    
    // Shoulders and upper chest
    const shoulderGeometry = new THREE.SphereGeometry(0.16, 32, 32);
    shoulderGeometry.scale(1.2, 0.8, 0.9);
    const shoulders = new THREE.Mesh(shoulderGeometry, skinMaterial);
    shoulders.position.y = 1.25;
    torso.add(shoulders);
    
    // Main torso
    const torsoGeometry = new THREE.CylinderGeometry(0.15, 0.13, 0.4, 32);
    const mainTorso = new THREE.Mesh(torsoGeometry, skinMaterial);
    mainTorso.position.y = 1.1;
    torso.add(mainTorso);
    
    // T-shirt
    const shirtGeometry = new THREE.CylinderGeometry(0.155, 0.135, 0.42, 32);
    const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
    shirt.position.y = 1.095;
    torso.add(shirt);
    
    // T-shirt sleeves
    const sleeveGeometry = new THREE.CylinderGeometry(0.045, 0.055, 0.12, 32);
    const leftSleeve = new THREE.Mesh(sleeveGeometry, shirtMaterial);
    leftSleeve.position.set(-0.17, 1.2, 0);
    leftSleeve.rotation.z = 0.3;
    const rightSleeve = new THREE.Mesh(sleeveGeometry, shirtMaterial);
    rightSleeve.position.set(0.17, 1.2, 0);
    rightSleeve.rotation.z = -0.3;
    torso.add(leftSleeve);
    torso.add(rightSleeve);
    
    // Create proper "Learnza" text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = 'white';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.fillText('Learnza', 256, 80);
    
    const textTexture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ 
        map: textTexture,
        transparent: true
    });
    
    const textGeometry = new THREE.PlaneGeometry(0.25, 0.06);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 1.15, 0.156);
    torso.add(textMesh);
    
    return torso;
}

// Detailed arm creation
function createArm(isLeft) {
    const arm = new THREE.Group();
    
    // Upper arm
    const upperArmGeometry = new THREE.CylinderGeometry(0.035, 0.03, 0.25, 32);
    const upperArm = new THREE.Mesh(upperArmGeometry, skinMaterial);
    upperArm.position.y = 1.05;
    arm.add(upperArm);
    
    // Elbow
    const elbowGeometry = new THREE.SphereGeometry(0.032, 32, 32);
    const elbow = new THREE.Mesh(elbowGeometry, skinMaterial);
    elbow.position.y = 0.925;
    arm.add(elbow);
    
    // Forearm
    const forearmGeometry = new THREE.CylinderGeometry(0.028, 0.024, 0.22, 32);
    const forearm = new THREE.Mesh(forearmGeometry, skinMaterial);
    forearm.position.y = 0.815;
    arm.add(forearm);
    
    // Wrist
    const wristGeometry = new THREE.SphereGeometry(0.022, 32, 32);
    const wrist = new THREE.Mesh(wristGeometry, skinMaterial);
    wrist.position.y = 0.705;
    arm.add(wrist);
    
    // Hand
    const handGeometry = new THREE.BoxGeometry(0.04, 0.08, 0.015);
    const hand = new THREE.Mesh(handGeometry, skinMaterial);
    hand.position.y = 0.65;
    arm.add(hand);
    
    // Fingers
    const fingerPositions = [-0.015, -0.005, 0.005, 0.015];
    fingerPositions.forEach((x, i) => {
        const fingerGeometry = new THREE.CylinderGeometry(0.004, 0.003, 0.035, 16);
        const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
        finger.position.set(x, 0.61, 0.008);
        arm.add(finger);
        
        // Finger joints
        const jointGeometry = new THREE.SphereGeometry(0.003, 16, 16);
        const joint1 = new THREE.Mesh(jointGeometry, skinMaterial);
        joint1.position.set(x, 0.625, 0.008);
        const joint2 = new THREE.Mesh(jointGeometry, skinMaterial);
        joint2.position.set(x, 0.605, 0.008);
        arm.add(joint1);
        arm.add(joint2);
    });
    
    // Thumb
    const thumbGeometry = new THREE.CylinderGeometry(0.005, 0.004, 0.03, 16);
    const thumb = new THREE.Mesh(thumbGeometry, skinMaterial);
    thumb.position.set(isLeft ? 0.025 : -0.025, 0.64, 0.01);
    thumb.rotation.z = isLeft ? -0.8 : 0.8;
    arm.add(thumb);
    
    // Position arm
    arm.position.x = isLeft ? -0.17 : 0.17;
    arm.position.y = 1.25;
    
    return arm;
}

// Assemble the complete model
const head = createHead();
const hair = createHair();
const neck = createNeck();
const torso = createTorso();
const leftArm = createArm(true);
const rightArm = createArm(false);

body.add(head);
body.add(hair);
body.add(neck);
body.add(torso);
body.add(leftArm);
body.add(rightArm);

scene.add(body);

// Wireframe toggle functionality
let isWireframe = false;
document.getElementById('toggleWireframe').addEventListener('click', () => {
    isWireframe = !isWireframe;
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.material.wireframe = isWireframe;
        }
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate(); 