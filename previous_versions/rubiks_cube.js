import * as THREE from './lib/three.module.js';
//import { OrbitControls } from 'https://unpkg.com/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { OrbitControls } from './lib/OrbitControls.js?v=4';

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

let controls;
let raycaster;
let mouse = new THREE.Vector2();
let INTERSECTED; // To store the currently intersected object
let isDragging = false;
let dragStartPoint = new THREE.Vector2();
let clickedCubelet = null;
let clickedFaceNormal = null;

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

    // OrbitControls for camera movement
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // An animation loop is required when damping is enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = cubeSize * 1.5;
    controls.maxDistance = cubeSize * 5;
    controls.enablePan = false; // Disable panning to keep the cube centered
    controls.target.set(0, 0, 0); // Look at the center of the cube

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();

    // Add controls (keyboard and buttons)
    addControls();

    // Add mouse event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown, false);
    renderer.domElement.addEventListener('mousemove', onMouseMove, false);
    renderer.domElement.addEventListener('mouseup', onMouseUp, false);

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

let isAnimating = false;

async function rotateFace(move) {
    if (isAnimating) return;
    isAnimating = true;

    let axis = new THREE.Vector3();
    let targetValue;
    let angle = Math.PI / 2; // 90 degrees

    const rotatingGroup = new THREE.Group();
    scene.add(rotatingGroup);

    // Determine which cubelets to rotate and the axis/direction
    switch (move) {
        case 'U': // Up face (Y axis)
            axis.set(0, 1, 0);
            targetValue = (cubeSize - 1) * (cubeletSize + spacing) / 2; // Top layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.y - targetValue) < 0.1) { // Check if it's on the top layer
                    rotatingGroup.attach(cubelet); // Move cubelet to rotating group
                }
            });
            break;
        case 'D': // Down face (Y axis)
            axis.set(0, -1, 0);
            targetValue = -(cubeSize - 1) * (cubeletSize + spacing) / 2; // Bottom layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.y - targetValue) < 0.1) {
                    rotatingGroup.attach(cubelet);
                }
            });
            break;
        case 'L': // Left face (X axis)
            axis.set(-1, 0, 0);
            targetValue = -(cubeSize - 1) * (cubeletSize + spacing) / 2; // Left layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.x - targetValue) < 0.1) {
                    rotatingGroup.attach(cubelet);
                }
            });
            break;
        case 'R': // Right face (X axis)
            axis.set(1, 0, 0);
            targetValue = (cubeSize - 1) * (cubeletSize + spacing) / 2; // Right layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.x - targetValue) < 0.1) {
                    rotatingGroup.attach(cubelet);
                }
            });
            break;
        case 'F': // Front face (Z axis)
            axis.set(0, 0, 1);
            targetValue = (cubeSize - 1) * (cubeletSize + spacing) / 2; // Front layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.z - targetValue) < 0.1) {
                    rotatingGroup.attach(cubelet);
                }
            });
            break;
        case 'B': // Back face (Z axis)
            axis.set(0, 0, -1);
            targetValue = -(cubeSize - 1) * (cubeletSize + spacing) / 2; // Back layer
            cubelets.forEach(cubelet => {
                if (Math.abs(cubelet.position.z - targetValue) < 0.1) {
                    rotatingGroup.attach(cubelet);
                }
            });
            break;
        case 'X': // Rotate whole cube around X
            axis.set(1, 0, 0);
            rotateWholeCube(axis, angle);
            isAnimating = false;
            return;
        case 'Y': // Rotate whole cube around Y
            axis.set(0, 1, 0);
            rotateWholeCube(axis, angle);
            isAnimating = false;
            return;
        case 'Z': // Rotate whole cube around Z
            axis.set(0, 0, 1);
            rotateWholeCube(axis, angle);
            isAnimating = false;
            return;
        default:
            isAnimating = false;
            return;
    }

    // Perform the rotation animation
    const startQuaternion = rotatingGroup.quaternion.clone();
    const endQuaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle).multiply(startQuaternion);

    const animationDuration = 200; // milliseconds
    const startTime = performance.now();

    function animateRotation() {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        rotatingGroup.quaternion.slerpQuaternions(startQuaternion, endQuaternion, progress);

        if (progress < 1) {
            requestAnimationFrame(animateRotation);
        } else {
            // After animation, update cubelet positions and re-parent
            rotatingGroup.updateMatrixWorld(true); // Ensure world matrix is updated

            rotatingGroup.children.forEach(cubelet => {
                cubelet.applyMatrix4(rotatingGroup.matrixWorld); // Apply rotation to cubelet's own matrix
                cube.attach(cubelet); // Re-attach to main cube
            });

            rotatingGroup.quaternion.identity(); // Reset rotating group's rotation
            rotatingGroup.position.set(0, 0, 0); // Reset rotating group's position
            scene.remove(rotatingGroup); // Remove temporary group

            isAnimating = false;
        }
    }
    requestAnimationFrame(animateRotation);
}

function rotateWholeCube(axis, angle) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis.normalize(), angle);
    cube.applyQuaternion(quaternion);
}


function onMouseDown(event) {
    if (isAnimating) return;

    isDragging = false;
    dragStartPoint.set(event.clientX, event.clientY);

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(cubelets);

    if (intersects.length > 0) {
        // The first intersected object is the closest one
        clickedCubelet = intersects[0].object;
        // The face normal of the intersected face
        clickedFaceNormal = intersects[0].face.normal;

        // Disable OrbitControls temporarily
        controls.enabled = false;
    } else {
        clickedCubelet = null;
        clickedFaceNormal = null;
        controls.enabled = true; // Enable OrbitControls if no cubelet is clicked
    }
}

function onMouseMove(event) {
    if (clickedCubelet === null) return; // Only proceed if a cubelet was clicked

    // Check if dragging has started (mouse moved beyond a threshold)
    const currentMousePoint = new THREE.Vector2(event.clientX, event.clientY);
    if (!isDragging && currentMousePoint.distanceTo(dragStartPoint) > 5) { // 5 pixels threshold
        isDragging = true;
    }

    if (isDragging) {
        // Calculate current mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);

        // Find intersections with the clicked cubelet (or all cubelets for broader detection)
        const intersects = raycaster.intersectObjects([clickedCubelet]);

        if (intersects.length > 0) {
            // Determine the drag direction relative to the clicked face
            // This is a simplified approach and needs refinement for accurate Rubik's cube moves
            const intersectionPoint = intersects[0].point;
            const dragDirection = new THREE.Vector3().subVectors(intersectionPoint, clickedCubelet.position).normalize();

            // For now, just log the drag direction. Actual move determination is complex.
            // console.log("Drag Direction:", dragDirection);

            // Re-enable OrbitControls if not dragging a cubelet
            if (!isDragging && clickedCubelet === null) {
                controls.enabled = true;
            }
        }
    }
}

function onMouseUp(event) {
    controls.enabled = true; // Always re-enable OrbitControls on mouse up

    if (isDragging && clickedCubelet !== null) {
        // Determine the move based on dragStartPoint, current mouse position, clickedCubelet, and clickedFaceNormal
        // This logic is highly complex and depends on the cube's current orientation.
        // For a full implementation, you'd need to project the drag onto the plane of the clicked face
        // and determine if it corresponds to a valid Rubik's cube turn.

        // For demonstration, let's just log that a drag occurred.
        console.log("Drag ended on cubelet:", clickedCubelet.uuid, "from face:", clickedFaceNormal);

        // Example: If a drag is detected, and it's on the top face, perform a 'U' move.
        // This is a very basic placeholder and needs proper logic.
        // if (clickedFaceNormal.y > 0.9 && Math.abs(dragStartPoint.x - event.clientX) > 20) { // Simple horizontal drag on top face
        //     rotateFace('U');
        // }

    } else if (clickedCubelet !== null) {
        // This was a click, not a drag. Could be used for a specific action.
        console.log("Clicked cubelet:", clickedCubelet.uuid, "on face:", clickedFaceNormal);
    }

    // Reset state
    isDragging = false;
    clickedCubelet = null;
    clickedFaceNormal = null;
}
