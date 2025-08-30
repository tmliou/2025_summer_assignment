import * as THREE from './lib/three.module.js';

let scene, camera, renderer;
let cube; // This will be the group holding all cubelets
const cubelets = [];
const cubeSize = 3; // 3x3x3 Rubik's Cube
const cubeletSize = 1;
const spacing = 0.05; // Small spacing between cubelets

const colors = {
    'right': 0xff0000, // Red
    'left': 0xffa500,  // Orange
    'up': 0x00ff00,    // Green
    'down': 0x0000ff,  // Blue
    'front': 0xffffff, // White
    'back': 0xffff00   // Yellow
};

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222); // Dark background

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, cubeSize * 2); // Position camera to see the cube

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Create the Rubik's Cube (group of cubelets)
    cube = new THREE.Group();
    scene.add(cube);

    createCubelets();

    // Add controls (keyboard and buttons)
    addControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createCubelets() {
    const offset = (cubeSize - 1) / 2 * (cubeletSize + spacing); // To center the cube

    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++) {
                const geometry = new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize);
                const materials = createCubeletMaterials(x, y, z);
                const cubelet = new THREE.Mesh(geometry, materials);

                cubelet.position.set(
                    x * (cubeletSize + spacing) - offset,
                    y * (cubeletSize + spacing) - offset,
                    z * (cubeletSize + spacing) - offset
                );
                cubelets.push(cubelet);
                cube.add(cubelet);
            }
        }
    }
}

function createCubeletMaterials(x, y, z) {
    const materialArray = [];
    // Order: Right, Left, Up, Down, Front, Back
    // x=2 (right face), x=0 (left face)
    // y=2 (up face), y=0 (down face)
    // z=2 (front face), z=0 (back face)

    // Right face (positive X)
    materialArray.push(new THREE.MeshLambertMaterial({ color: x === cubeSize - 1 ? colors.right : 0x111111 }));
    // Left face (negative X)
    materialArray.push(new THREE.MeshLambertMaterial({ color: x === 0 ? colors.left : 0x111111 }));
    // Up face (positive Y)
    materialArray.push(new THREE.MeshLambertMaterial({ color: y === cubeSize - 1 ? colors.up : 0x111111 }));
    // Down face (negative Y)
    materialArray.push(new THREE.MeshLambertMaterial({ color: y === 0 ? colors.down : 0x111111 }));
    // Front face (positive Z)
    materialArray.push(new THREE.MeshLambertMaterial({ color: z === cubeSize - 1 ? colors.front : 0x111111 }));
    // Back face (negative Z)
    materialArray.push(new THREE.MeshLambertMaterial({ color: z === 0 ? colors.back : 0x111111 }));

    return materialArray;
}

function addControls() {
    const controlsDiv = document.getElementById('controls');
    const buttonLabels = ['U', 'D', 'L', 'R', 'F', 'B', 'X', 'Y', 'Z']; // Basic moves and whole cube rotations

    buttonLabels.forEach(label => {
        const button = document.createElement('button');
        button.textContent = label;
        button.classList.add('control-button');
        button.addEventListener('click', () => rotateFace(label));
        controlsDiv.appendChild(button);
    });

    window.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        if (buttonLabels.includes(key)) {
            rotateFace(key);
        }
    });
}

function rotateFace(move) {
    // This is a placeholder. Actual Rubik's Cube rotation logic is complex.
    // For now, we'll just rotate the whole cube for demonstration.
    // In a real implementation, you'd identify the cubelets in the target face
    // and rotate them around the appropriate axis.

    let axis;
    let angle = Math.PI / 2; // 90 degrees

    switch (move) {
        case 'U': // Up face (Y axis)
            axis = new THREE.Vector3(0, 1, 0);
            break;
        case 'D': // Down face (Y axis, opposite direction)
            axis = new THREE.Vector3(0, -1, 0);
            break;
        case 'L': // Left face (X axis, opposite direction)
            axis = new THREE.Vector3(-1, 0, 0);
            break;
        case 'R': // Right face (X axis)
            axis = new THREE.Vector3(1, 0, 0);
            break;
        case 'F': // Front face (Z axis)
            axis = new THREE.Vector3(0, 0, 1);
            break;
        case 'B': // Back face (Z axis, opposite direction)
            axis = new THREE.Vector3(0, 0, -1);
            break;
        case 'X': // Rotate whole cube around X
            axis = new THREE.Vector3(1, 0, 0);
            rotateWholeCube(axis, angle);
            return;
        case 'Y': // Rotate whole cube around Y
            axis = new THREE.Vector3(0, 1, 0);
            rotateWholeCube(axis, angle);
            return;
        case 'Z': // Rotate whole cube around Z
            axis = new THREE.Vector3(0, 0, 1);
            rotateWholeCube(axis, angle);
            return;
        default:
            return;
    }

    // Placeholder for actual face rotation:
    // For a real Rubik's Cube, you'd select cubelets based on their position
    // and then rotate them. This is a simplified example.
    console.log(`Attempting to rotate face: ${move}`);

    // Example: Rotate the entire cube for now
    rotateWholeCube(axis, angle);
}

function rotateWholeCube(axis, angle) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis.normalize(), angle);
    cube.applyQuaternion(quaternion);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();