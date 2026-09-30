import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SecurityError } from '../types/game';
import {
  createFloorTexture,
  createWhiteboardTexture,
  createCorkboardTexture,
  createUnlockedMonitorTexture,
  createMonitorPostitTexture,
  createSecretDocumentTexture,
  createPhoneScreenTexture,
  createWindowViewTexture,
  createPrinterTrayTexture,
  createPoliceCrestTexture
} from '../utils/officeTextures';

interface OfficeSceneProps {
  errors: SecurityError[];
  onFoundError: (error: SecurityError) => void;
  onMissClick: (screenX: number, screenY: number) => void;
  selectedErrorId: string | null;
  onSelectError: (id: string) => void;
  focusedErrorId: string | null;
  onClearFocus: () => void;
  resetCounter?: number;
}

interface FloatingPing {
  id: string;
  x: number;
  y: number;
  title: string;
}

export const OfficeScene: React.FC<OfficeSceneProps> = ({
  errors,
  onFoundError,
  onMissClick,
  selectedErrorId,
  onSelectError,
  focusedErrorId,
  onClearFocus,
  resetCounter = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Map of errorId -> Mesh / Group in scene
  const hitboxesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const visualObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const discoveredMarkersRef = useRef<Map<string, THREE.Group>>(new Map());

  // Bulletproof time-based camera transition state
  const transitionRef = useRef<{
    active: boolean;
    startPos: THREE.Vector3;
    endPos: THREE.Vector3;
    startTarget: THREE.Vector3;
    endTarget: THREE.Vector3;
    startTime: number;
    duration: number;
  }>({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    startTime: 0,
    duration: 700,
  });

  // Track click vs drag
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Floating HTML pings for discoveries
  const [floatingPings, setFloatingPings] = useState<FloatingPing[]>([]);
  const [hoveredErrorId, setHoveredErrorId] = useState<string | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.025);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 6.4);
    camera.lookAt(0, 1.2, -0.6);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.2, -0.6);
    controls.maxPolarAngle = Math.PI / 2.08; // Keep above floor
    controls.minPolarAngle = Math.PI / 10;
    controls.minDistance = 1.2; // Allow comfortable close inspection
    controls.maxDistance = 12;

    // Immediately stop any automated camera glide if user interacts with controls
    controls.addEventListener('start', () => {
      transitionRef.current.active = false;
    });

    controlsRef.current = controls;

    // LIGHTING
    // Ambient light: cool slate tone
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.7);
    scene.add(ambientLight);

    // Main key office overhead light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(3, 7, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 18;
    dirLight.shadow.camera.left = -6;
    dirLight.shadow.camera.right = 6;
    dirLight.shadow.camera.top = 6;
    dirLight.shadow.camera.bottom = -6;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // Daylight coming through window
    const windowLight = new THREE.DirectionalLight(0x7dd3fc, 1.2);
    windowLight.position.set(-6, 3.5, -1.8);
    windowLight.target.position.set(-1, 1.5, -1.2);
    scene.add(windowLight);
    scene.add(windowLight.target);

    // Recessed ceiling LED panels
    const ceilingLight1 = new THREE.PointLight(0xf8fafc, 0.8, 8);
    ceilingLight1.position.set(-2, 4.2, -1.5);
    scene.add(ceilingLight1);

    const ceilingLight2 = new THREE.PointLight(0xf8fafc, 0.8, 8);
    ceilingLight2.position.set(2, 4.2, -1.5);
    scene.add(ceilingLight2);

    const ceilingLight3 = new THREE.PointLight(0xf8fafc, 0.6, 7);
    ceilingLight3.position.set(0, 4.2, 1.5);
    scene.add(ceilingLight3);

    // ==========================================
    // BUILD OFFICE ARCHITECTURE
    // ==========================================
    const roomWidth = 10;
    const roomDepth = 10;
    const roomHeight = 4.4;

    // FLOOR
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorTex = createFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // BACK WALL (Z = -5)
const wallMat = new THREE.MeshBasicMaterial({
  color: 0xb8bec6,
  side: THREE.DoubleSide
});
    const backWallGeo = new THREE.PlaneGeometry(roomWidth, roomHeight);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // LEFT WALL (X = -5)
    const leftWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // RIGHT WALL (X = 5)
    const rightWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // BASEBOARDS
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.16, 0.04), baseboardMat);
    backBaseboard.position.set(0, 0.08, -roomDepth / 2 + 0.02);
    scene.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, roomDepth), baseboardMat);
    leftBaseboard.position.set(-roomWidth / 2 + 0.02, 0.08, 0);
    scene.add(leftBaseboard);

    // POLICE CREST EMBLEM ON BACK WALL
    const crestGeo = new THREE.CircleGeometry(0.42, 32);
    const crestMat = new THREE.MeshStandardMaterial({
      map: createPoliceCrestTexture(),
      roughness: 0.4,
    });
    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.position.set(-0.9, 3.65, -roomDepth / 2 + 0.02);
    scene.add(crestMesh);

    // DOOR ON RIGHT WALL
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.7, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    doorFrame.position.set(roomWidth / 2 - 0.05, 1.35, 2.6);
    scene.add(doorFrame);

    const doorLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 2.6, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    doorLeaf.position.set(roomWidth / 2 - 0.04, 1.35, 2.6);
    scene.add(doorLeaf);

    // Green emergency exit sign above door
    const exitSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.22, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x15803d, emissiveIntensity: 0.8 })
    );
    exitSign.position.set(roomWidth / 2 - 0.05, 2.9, 2.6);
    scene.add(exitSign);

    // CEILING RECESSED LED TROFFERS
    const ledTrofferMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf8fafc,
      emissiveIntensity: 0.9,
    });
    [
      [-2, 4.38, -1.5],
      [2, 4.38, -1.5],
      [0, 4.38, 1.5],
    ].forEach(([x, y, z]) => {
      const troffer = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.6), ledTrofferMat);
      troffer.position.set(x, y, z);
      scene.add(troffer);
    });

    // ==========================================
    // WORKSTATION 1 (LEFT DESK)
    // ==========================================
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });

    // Tabletop
    const desk1Top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 1.2), deskMat);
    desk1Top.position.set(-2.0, 1.0, -1.2);
    desk1Top.castShadow = true;
    desk1Top.receiveShadow = true;
    scene.add(desk1Top);

    // Desk 1 Legs
    [
      [-3.1, 0.5, -1.7],
      [-0.9, 0.5, -1.7],
      [-3.1, 0.5, -0.7],
      [-0.9, 0.5, -0.7],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 16), deskLegMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // Desk 1 Chair
    const chairGroup1 = createOfficeChair();
    chairGroup1.position.set(-2.0, 0, -0.15);
    chairGroup1.rotation.y = Math.PI - 0.25;
    scene.add(chairGroup1);

    // Large desk mousepad
    const deskPad = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.01, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    deskPad.position.set(-2.0, 1.035, -1.0);
    scene.add(deskPad);

    // Mechanical keyboard
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.02, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    keyboard.position.set(-2.0, 1.045, -0.9);
    keyboard.castShadow = true;
    scene.add(keyboard);

    // Computer Mouse
    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.025, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    mouse.position.set(-1.58, 1.045, -0.9);
    scene.add(mouse);

    // Desk 1 PC Tower under desk
    const pcTower = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.3, metalness: 0.8 })
    );
    pcTower.position.set(-3.0, 0.23, -1.2);
    pcTower.castShadow = true;
    scene.add(pcTower);

    // ==========================================
    // WORKSTATION 2 (RIGHT DESK)
    // ==========================================
    const desk2Top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 1.1), deskMat);
    desk2Top.position.set(2.0, 1.0, -1.1);
    desk2Top.castShadow = true;
    desk2Top.receiveShadow = true;
    scene.add(desk2Top);

    [
      [1.08, 0.5, -1.55],
      [2.92, 0.5, -1.55],
      [1.08, 0.5, -0.65],
      [2.92, 0.5, -0.65],
    ].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 16), deskLegMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    const chairGroup2 = createOfficeChair();
    chairGroup2.position.set(1.9, 0, -0.1);
    chairGroup2.rotation.y = Math.PI + 0.15;
    scene.add(chairGroup2);

    // Monitor on Desk 2 (turned off/clean desk contrast)
    const monitorDesk2 = createMonitorMesh(new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2 }));
    monitorDesk2.position.set(1.6, 1.03, -1.25);
    scene.add(monitorDesk2);

    // ==========================================
    // THE 15 INTERACTIVE ERROR OBJECTS
    // ==========================================

    // Helper: Register error hitbox
    const registerHitbox = (errorId: string, mesh: THREE.Mesh, visualObj?: THREE.Object3D) => {
      mesh.userData = { errorId };
      hitboxesRef.current.set(errorId, mesh);
      scene.add(mesh);
      if (visualObj) {
        visualObjectsRef.current.set(errorId, visualObj);
      }
    };

    // 1. OPEN WINDOW (`open-window`)
    // Left wall window cut-out
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
    const windowGroup = new THREE.Group();
    windowGroup.position.set(-roomWidth / 2 + 0.08, 2.5, -1.8);

    // Exterior scenery background backdrop
    const exteriorPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.4),
      new THREE.MeshBasicMaterial({ map: createWindowViewTexture() })
    );
    exteriorPlane.position.set(-0.35, 0, 0);
    exteriorPlane.rotation.y = Math.PI / 2;
    windowGroup.add(exteriorPlane);

    // Fixed glass pane (right sash)
    const fixedGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 1.5),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.85, opacity: 0.7, transparent: true, roughness: 0.1 })
    );
    fixedGlass.position.set(0, 0, 0.48);
    fixedGlass.rotation.y = Math.PI / 2;
    windowGroup.add(fixedGlass);

    // OPENED SASH (pivoted inward!)
    const openSashGroup = new THREE.Group();
    openSashGroup.position.set(0, 0, -0.48);
    openSashGroup.rotation.y = 0.55; // Open angle!

    const openFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 1.5, 0.85),
      windowFrameMat
    );
    openFrame.position.set(0, 0, -0.42);
    openSashGroup.add(openFrame);

    const openGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 1.4),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transmission: 0.9, opacity: 0.65, transparent: true, roughness: 0.05 })
    );
    openGlass.position.set(0.01, 0, -0.42);
    openGlass.rotation.y = Math.PI / 2;
    openSashGroup.add(openGlass);

    // Window latch & handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    handle.position.set(0.04, 0, -0.82);
    openSashGroup.add(handle);

    windowGroup.add(openSashGroup);
    scene.add(windowGroup);

    // Window Hitbox
    const windowHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.7, 1.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    windowHitbox.position.set(-4.85, 2.5, -1.8);
    registerHitbox('open-window', windowHitbox, windowGroup);

    // 2. PASSWORDS ON CORK NOTICE BOARD (`board-pass`)
    const corkBoardGroup = new THREE.Group();
    corkBoardGroup.position.set(-2.4, 2.7, -roomDepth / 2 + 0.05);

    // Wooden frame
    const corkFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 })
    );
    corkBoardGroup.add(corkFrame);

    // Cork face with texture
    const corkFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.1),
      new THREE.MeshStandardMaterial({ map: createCorkboardTexture(), roughness: 0.9 })
    );
    corkFace.position.set(0, 0, 0.025);
    corkBoardGroup.add(corkFace);
    scene.add(corkBoardGroup);

    const boardHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.3, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    boardHitbox.position.set(-2.4, 2.7, -4.8);
    registerHitbox('board-pass', boardHitbox, corkBoardGroup);

    // 3. SENSITIVE INVESTIGATION DATA ON WHITEBOARD (`sensitive-board`)
    const whiteboardGroup = new THREE.Group();
    whiteboardGroup.position.set(0.8, 2.8, -roomDepth / 2 + 0.05);

    // Aluminium frame
    const wbFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.4, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.3 })
    );
    whiteboardGroup.add(wbFrame);

    // Whiteboard sheet with detailed canvas texture
    const wbFace = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.3),
      new THREE.MeshStandardMaterial({ map: createWhiteboardTexture(), roughness: 0.25 })
    );
    wbFace.position.set(0, 0, 0.025);
    whiteboardGroup.add(wbFace);

    // Marker tray at bottom
    const markerTray = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.03, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 })
    );
    markerTray.position.set(0, -0.68, 0.06);
    whiteboardGroup.add(markerTray);

    // Markers on tray
    const markerRed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626 })
    );
    markerRed.rotation.z = Math.PI / 2;
    markerRed.position.set(-0.2, -0.66, 0.06);
    whiteboardGroup.add(markerRed);

    scene.add(whiteboardGroup);

    const sensitiveBoardHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.5, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    sensitiveBoardHitbox.position.set(0.8, 2.8, -4.8);
    registerHitbox('sensitive-board', sensitiveBoardHitbox, whiteboardGroup);

    // 4. UNLOCKED FILING CABINET WITH CLASSIFIED FILES (`open-drawer`)
    const cabinetGroup = new THREE.Group();
    cabinetGroup.position.set(3.8, 1.2, -4.3);

    // Heavy grey steel cabinet body
    const cabBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 2.2, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 })
    );
    cabBody.castShadow = true;
    cabinetGroup.add(cabBody);

    // Closed drawers
    [-0.75, 0.25, 0.75].forEach(y => {
      const drawerFront = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.44, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
      );
      drawerFront.position.set(0, y, 0.36);
      cabinetGroup.add(drawerFront);

      // Handle
      const hnd = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.03, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
      );
      hnd.position.set(0, y + 0.1, 0.39);
      cabinetGroup.add(hnd);
    });

    // OPEN DRAWER (at y = -0.25, pulled out!)
    const openDrawer = new THREE.Group();
    openDrawer.position.set(0, -0.25, 0.35 + 0.38);

    const drawerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    openDrawer.add(drawerBox);

    // Red files labeled "SZIGORÚAN TITKOS" inside the drawer
    for (let f = -0.2; f <= 0.2; f += 0.06) {
      const folderMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.28, 0.02),
        new THREE.MeshStandardMaterial({ color: f === 0 ? 0xdc2626 : 0xd97706, roughness: 0.5 })
      );
      folderMesh.position.set(0, 0.1, f);
      openDrawer.add(folderMesh);
    }

    cabinetGroup.add(openDrawer);
    scene.add(cabinetGroup);

    const drawerHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.2, 1.2),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    drawerHitbox.position.set(3.8, 1.0, -3.9);
    registerHitbox('open-drawer', drawerHitbox, cabinetGroup);

    // 5. UNATTENDED UNLOCKED PC SCREEN (`unlocked-pc1`)
    const unlockedScreenMat = new THREE.MeshStandardMaterial({
      map: createUnlockedMonitorTexture(),
      roughness: 0.2,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.25,
    });
    const unlockedMonitorGroup = createMonitorMesh(unlockedScreenMat);
    unlockedMonitorGroup.position.set(-2.1, 1.03, -1.2);
    unlockedMonitorGroup.rotation.y = 0.05;
    scene.add(unlockedMonitorGroup);

    const pcHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.6, 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    pcHitbox.position.set(-2.1, 1.45, -1.2);
    registerHitbox('unlocked-pc1', pcHitbox, unlockedMonitorGroup);

    // 6. PASSWORD POST-IT ON SECOND MONITOR (`monitor-pass`)
    // Second monitor on Desk 1
    const secMonitorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
    });
    const secMonitorGroup = createMonitorMesh(secMonitorMat);
    secMonitorGroup.position.set(-1.42, 1.03, -1.25);
    secMonitorGroup.rotation.y = -0.25;

    // Yellow Post-it stuck to the lower right bezel!
    const postitMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.12),
      new THREE.MeshStandardMaterial({
        map: createMonitorPostitTexture(),
        roughness: 0.6,
      })
    );
    postitMesh.position.set(0.24, 0.28, 0.06);
    postitMesh.rotation.z = -0.05;
    secMonitorGroup.add(postitMesh);
    scene.add(secMonitorGroup);

    const postitHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.3),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    postitHitbox.position.set(-1.22, 1.35, -1.18);
    registerHitbox('monitor-pass', postitHitbox, secMonitorGroup);

    // 7. UNATTENDED SMARTPHONE ON DESK (`unattended-phone`)
    const phoneGroup = new THREE.Group();
    phoneGroup.position.set(-2.6, 1.035, -0.88);
    phoneGroup.rotation.y = 0.35;

    // Phone body
    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.012, 0.19),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2, metalness: 0.9 })
    );
    phoneGroup.add(phoneBody);

    // Glowing screen
    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.09, 0.17),
      new THREE.MeshStandardMaterial({
        map: createPhoneScreenTexture(),
        emissive: 0x0284c7,
        emissiveIntensity: 0.45,
      })
    );
    phoneScreen.rotation.x = -Math.PI / 2;
    phoneScreen.position.set(0, 0.007, 0);
    phoneGroup.add(phoneScreen);
    scene.add(phoneGroup);

    const phoneHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    phoneHitbox.position.set(-2.6, 1.05, -0.88);
    registerHitbox('unattended-phone', phoneHitbox, phoneGroup);

    // 8. UNKNOWN ABANDONED USB DRIVE (`abandoned-usb`)
    const usbGroup = new THREE.Group();
    usbGroup.position.set(-1.8, 1.045, -0.68);
    usbGroup.rotation.y = 0.6;

    // USB body (metallic black & silver)
    const usbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.014, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 })
    );
    usbGroup.add(usbBody);

    // Silver USB head
    const usbPlug = new THREE.Mesh(
      new THREE.BoxGeometry(0.024, 0.01, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 })
    );
    usbPlug.position.set(0, 0, 0.05);
    usbGroup.add(usbPlug);

    // Blue activity LED dot on thumbdrive
    const usbLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.004, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.0 })
    );
    usbLed.position.set(0, 0.008, -0.02);
    usbGroup.add(usbLed);
    scene.add(usbGroup);

    const usbHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.3),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    usbHitbox.position.set(-1.8, 1.06, -0.68);
    registerHitbox('abandoned-usb', usbHitbox, usbGroup);

    // 9. CLEAN DESK VIOLATION: CLASSIFIED IRAT ON DESK 2 (`desk-document`)
    const docGroup = new THREE.Group();
    docGroup.position.set(1.8, 1.035, -0.98);
    docGroup.rotation.y = -0.15;

    const docSheet = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.48),
      new THREE.MeshStandardMaterial({
        map: createSecretDocumentTexture(),
        roughness: 0.7,
      })
    );
    docSheet.rotation.x = -Math.PI / 2;
    docGroup.add(docSheet);
    scene.add(docGroup);

    const docHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.25, 0.6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    docHitbox.position.set(1.8, 1.06, -0.98);
    registerHitbox('desk-document', docHitbox, docGroup);

    // 10. COFFEE LIQUID HAZARD NEXT TO POWER STRIP (`coffee-hazard`)
    const hazardGroup = new THREE.Group();
    hazardGroup.position.set(2.55, 1.035, -0.85);

    // White ceramic coffee mug
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.11, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    mug.position.set(0, 0.055, 0);
    hazardGroup.add(mug);

    // Dark liquid inside mug
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.01, 16),
      new THREE.MeshStandardMaterial({ color: 0x3f200c, roughness: 0.1 })
    );
    liquid.position.set(0, 0.1, 0);
    hazardGroup.add(liquid);

    // Mug handle
    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.008, 8, 16, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    mugHandle.position.set(-0.055, 0.055, 0);
    mugHandle.rotation.y = Math.PI / 2;
    hazardGroup.add(mugHandle);

    // Multi-socket electrical power strip IMMEDIATELY adjacent!
    const powerStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.035, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
    );
    powerStrip.position.set(0.12, 0.018, 0.04);
    hazardGroup.add(powerStrip);

    // Red illuminated power rocker switch
    const powerSwitch = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.015, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 })
    );
    powerSwitch.position.set(0.12, 0.038, -0.07);
    hazardGroup.add(powerSwitch);

    // Sockets & transformer plug
    const transformer = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.06, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    transformer.position.set(0.12, 0.06, 0.05);
    hazardGroup.add(transformer);

    scene.add(hazardGroup);

    const hazardHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.3, 0.45),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hazardHitbox.position.set(2.55, 1.1, -0.85);
    registerHitbox('coffee-hazard', hazardHitbox, hazardGroup);

    // 11. EXPOSED ROUTER / SWITCH UNDER DESK (`exposed-router`)
    const routerGroup = new THREE.Group();
    routerGroup.position.set(-1.25, 0.42, -1.35);

    // Rack switch casing
    const routerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.1, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.7, roughness: 0.3 })
    );
    routerGroup.add(routerBody);

    // Front face with RJ45 Ethernet ports
    const portFace = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.06, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.5 })
    );
    portFace.position.set(0, 0, 0.14);
    routerGroup.add(portFace);

    // Exposed Ethernet patch cable plugged in with dangling loose loop
    const cablePlug = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.025, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
    );
    cablePlug.position.set(-0.1, 0, 0.16);
    routerGroup.add(cablePlug);

    // Blinking green/amber link LEDs on router
    const ledMatGreen = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 1.2 });
    const ledMatAmber = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.0 });

    [-0.15, -0.05, 0.05, 0.12].forEach((x, i) => {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), i % 2 === 0 ? ledMatGreen : ledMatAmber);
      led.position.set(x, 0.02, 0.15);
      routerGroup.add(led);
    });

    scene.add(routerGroup);

    const routerHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    routerHitbox.position.set(-1.25, 0.42, -1.35);
    registerHitbox('exposed-router', routerHitbox, routerGroup);

    // 12. CONFIDENTIAL DOCUMENTS LEFT ON PRINTER TRAY (`printer-document`)
    const printerStation = new THREE.Group();
    printerStation.position.set(4.1, 0, -1.2);

    // Credenza stand
    const credenza = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.8, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    credenza.position.set(0, 0.4, 0);
    credenza.castShadow = true;
    printerStation.add(credenza);

    // Printer base unit
    const printerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.35, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    printerBody.position.set(0, 0.98, 0);
    printerBody.castShadow = true;
    printerStation.add(printerBody);

    // Scanner lid
    const scannerLid = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.08, 0.58),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
    );
    scannerLid.position.set(0, 1.2, 0);
    printerStation.add(scannerLid);

    // Touchscreen display on printer
    const printerLcd = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.1, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.6 })
    );
    printerLcd.position.set(-0.22, 1.22, 0.28);
    printerLcd.rotation.x = -0.3;
    printerStation.add(printerLcd);

    // Output tray with confidential printed papers left sitting!
    const trayPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.32),
      new THREE.MeshStandardMaterial({
        map: createPrinterTrayTexture(),
        roughness: 0.7,
      })
    );
    trayPaper.rotation.x = -Math.PI / 2;
    trayPaper.position.set(0.08, 1.02, 0.12);
    printerStation.add(trayPaper);

    scene.add(printerStation);

    const printerHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    printerHitbox.position.set(4.1, 1.15, -1.2);
    registerHitbox('printer-document', printerHitbox, printerStation);

    // 13. ROSSZUL POZICIONÁLT CCTV KAMERA (`cctv-angle`)
    const cctvGroup = new THREE.Group();
    cctvGroup.position.set(-4.5, 3.8, 1.8);

    // Wall mounting bracket
    const mountArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
    );
    mountArm.rotation.z = Math.PI / 2;
    cctvGroup.add(mountArm);

    // Camera body pointing directly down at desk 1!
    const cameraBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.085, 0.22, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
    );
    cameraBody.position.set(0.18, -0.06, 0);
    // Explicit angle aimed directly at Workstation 1 screen & keyboard!
    cameraBody.rotation.x = 0.55;
    cameraBody.rotation.z = -0.75;
    cctvGroup.add(cameraBody);

    // Dark lens element
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.9 })
    );
    lens.position.set(0.24, -0.16, 0.08);
    lens.rotation.x = 0.55;
    lens.rotation.z = -0.75;
    cctvGroup.add(lens);

    // Red recording LED light
    const recLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.01, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.5 })
    );
    recLed.position.set(0.25, -0.14, 0.03);
    cctvGroup.add(recLed);

    scene.add(cctvGroup);

    const cctvHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.7),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    cctvHitbox.position.set(-4.4, 3.8, 1.8);
    registerHitbox('cctv-angle', cctvHitbox, cctvGroup);

    // 14. UNSHREDDED CONFIDENTIAL AKTA IN REGULAR BIN (`unshredded-bin`)
    const binGroup = new THREE.Group();
    binGroup.position.set(4.2, 0, 1.2);

    // Electric paper shredder right beside it (for visual contrast)
    const shredder = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.58, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    shredder.position.set(0, 0.29, -0.32);
    shredder.castShadow = true;
    binGroup.add(shredder);

    // Shredder feed slot
    const shredSlot = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.015, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x020617 })
    );
    shredSlot.position.set(0, 0.585, -0.32);
    binGroup.add(shredSlot);

    // Regular office waste basket
    const trashBin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.44, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x64748b, side: THREE.DoubleSide, roughness: 0.6 })
    );
    trashBin.position.set(0, 0.22, 0.12);
    trashBin.castShadow = true;
    binGroup.add(trashBin);

    // Intact, un-shredded confidential folder sticking out of regular bin!
    const unshreddedFolder = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.36, 0.04),
      new THREE.MeshStandardMaterial({
        map: createSecretDocumentTexture(),
        roughness: 0.6,
      })
    );
    unshreddedFolder.position.set(0, 0.32, 0.12);
    unshreddedFolder.rotation.z = 0.22;
    unshreddedFolder.rotation.x = -0.15;
    binGroup.add(unshreddedFolder);

    scene.add(binGroup);

    const binHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.7, 0.9),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    binHitbox.position.set(4.2, 0.35, 1.1);
    registerHitbox('unshredded-bin', binHitbox, binGroup);

    // 15. UNACCOMPANIED VISITOR IN RED CLOTHES (`unattended-visitor`)
    const visitorGroup = createVisitorFigure();
    visitorGroup.position.set(2.8, 0, 2.5);
    visitorGroup.rotation.y = -Math.PI / 1.5;
    scene.add(visitorGroup);

    const visitorHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.9, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    visitorHitbox.position.set(2.8, 1.0, 2.5);
    registerHitbox('unattended-visitor', visitorHitbox, visitorGroup);

    // ==========================================
    // RENDER LOOP & ANIMATION
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera smooth transition if active
      if (transitionRef.current.active) {
        const trans = transitionRef.current;
        const progress = (performance.now() - trans.startTime) / trans.duration;
        if (progress >= 1) {
          camera.position.copy(trans.endPos);
          controls.target.copy(trans.endTarget);
          trans.active = false;
        } else {
          // Smooth easeInOutCubic curve
          const t = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          camera.position.lerpVectors(trans.startPos, trans.endPos, t);
          controls.target.lerpVectors(trans.startTarget, trans.endTarget, t);
        }
      }

      controls.update();

      // Gentle pulsing for discovered marker rings in 3D
      discoveredMarkersRef.current.forEach((markerGroup, errorId) => {
        const ring = markerGroup.children[0] as THREE.Mesh;
        if (ring) {
          ring.rotation.z += delta * 0.8;
          const s = 1.0 + Math.sin(elapsed * 3 + errorId.charCodeAt(0)) * 0.08;
          ring.scale.set(s, s, s);
        }
      });

      // Subtle blinking for router LED
      ledMatAmber.emissiveIntensity = 0.5 + Math.sin(elapsed * 8) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE LISTENER
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Helper to start a clean time-based camera transition
  const startCameraTransition = useCallback((targetPos: THREE.Vector3, targetLook: THREE.Vector3, duration = 650) => {
    if (!cameraRef.current || !controlsRef.current) return;
    transitionRef.current = {
      active: true,
      startPos: cameraRef.current.position.clone(),
      endPos: targetPos.clone(),
      startTarget: controlsRef.current.target.clone(),
      endTarget: targetLook.clone(),
      startTime: performance.now(),
      duration,
    };
  }, []);

  // Update discovered markers in 3D whenever `errors` change (CLEANS UP ON RESET!)
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // 1. Remove markers that are no longer discovered (e.g. after restart)
    discoveredMarkersRef.current.forEach((markerGroup, errorId) => {
      const err = errors.find((e) => e.id === errorId);
      if (!err || !err.discovered) {
        scene.remove(markerGroup);
        markerGroup.traverse((child) => {
          if ((child as THREE.Mesh).geometry) {
            (child as THREE.Mesh).geometry.dispose();
          }
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        discoveredMarkersRef.current.delete(errorId);
      }
    });

    // 2. Add markers for newly discovered errors
    errors.forEach((err) => {
      if (err.discovered && !discoveredMarkersRef.current.has(err.id)) {
        const markerGroup = new THREE.Group();
        markerGroup.position.set(err.position[0], err.position[1] + 0.35, err.position[2]);

        // Glowing circle ring
        const ringGeo = new THREE.RingGeometry(0.18, 0.24, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        markerGroup.add(ringMesh);

        // Center checkmark disc
        const discGeo = new THREE.CircleGeometry(0.08, 16);
        const discMat = new THREE.MeshBasicMaterial({
          color: 0x34d399,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const discMesh = new THREE.Mesh(discGeo, discMat);
        discMesh.rotation.x = Math.PI / 2;
        markerGroup.add(discMesh);

        scene.add(markerGroup);
        discoveredMarkersRef.current.set(err.id, markerGroup);
      }
    });
  }, [errors]);

  // Handle game restart: return camera to overview and clean up
  useEffect(() => {
    if (resetCounter > 0) {
      startCameraTransition(new THREE.Vector3(0, 5.2, 6.4), new THREE.Vector3(0, 1.2, -0.6), 700);
      setHoveredErrorId(null);
    }
  }, [resetCounter, startCameraTransition]);

  // Camera focus animation on selected or focused error
  useEffect(() => {
    if (!focusedErrorId || !cameraRef.current || !controlsRef.current) return;
    const targetError = errors.find((e) => e.id === focusedErrorId);
    if (!targetError) return;

    const focusPos = targetError.focusPosition || targetError.position;
    // Elevate camera slightly and position at comfortable viewing distance
    const targetPos = new THREE.Vector3(
      focusPos[0] + 1.2,
      focusPos[1] + 1.1,
      focusPos[2] + 1.5
    );
    const targetLook = new THREE.Vector3(focusPos[0], focusPos[1], focusPos[2]);

    startCameraTransition(targetPos, targetLook, 700);
    onClearFocus();
  }, [focusedErrorId, errors, onClearFocus, startCameraTransition]);

  // Pointer move raycasting for hover feedback
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!cameraRef.current || !rendererRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const hitboxes = Array.from(hitboxesRef.current.values());
      const intersects = raycaster.intersectObjects(hitboxes, false);

      if (intersects.length > 0) {
        const errorId = intersects[0].object.userData.errorId as string;
        setHoveredErrorId(errorId);
        e.currentTarget.style.cursor = 'pointer';
      } else {
        setHoveredErrorId(null);
        e.currentTarget.style.cursor = 'default';
      }
    },
    []
  );

  // Mouse Down to distinguish drag vs click, and immediately cancel any camera glide
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    transitionRef.current.active = false;
  };

  // Pointer Up handling click detection
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    // Ignore drags
    if (dist > 6) return;

    if (!cameraRef.current || !rendererRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const hitboxes = Array.from(hitboxesRef.current.values());
    const intersects = raycaster.intersectObjects(hitboxes, false);

    if (intersects.length > 0) {
      const errorId = intersects[0].object.userData.errorId as string;
      const targetError = errors.find((err) => err.id === errorId);

      if (targetError) {
        if (!targetError.discovered) {
          // New discovery!
          onFoundError(targetError);

          // Add floating HTML ping badge
          const pingId = `${errorId}-${Date.now()}`;
          setFloatingPings((prev) => [
            ...prev,
            {
              id: pingId,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              title: targetError.title,
            },
          ]);

          setTimeout(() => {
            setFloatingPings((prev) => prev.filter((p) => p.id !== pingId));
          }, 2400);
        } else {
          // Already discovered -> select to view info
          onSelectError(targetError.id);
        }
        return;
      }
    }

    // Clicked empty room area -> mistake
    onMissClick(e.clientX - rect.left, e.clientY - rect.top);
  };

  // Camera presets
  const setCameraView = (view: 'overview' | 'desk1' | 'desk2' | 'archive' | 'window') => {
    switch (view) {
      case 'overview':
        startCameraTransition(new THREE.Vector3(0, 5.2, 6.4), new THREE.Vector3(0, 1.2, -0.6), 700);
        break;
      case 'desk1':
        startCameraTransition(new THREE.Vector3(-1.8, 2.4, 0.9), new THREE.Vector3(-1.9, 1.4, -1.2), 700);
        break;
      case 'desk2':
        startCameraTransition(new THREE.Vector3(2.0, 2.3, 0.9), new THREE.Vector3(2.0, 1.3, -1.0), 700);
        break;
      case 'archive':
        startCameraTransition(new THREE.Vector3(3.2, 2.4, -2.0), new THREE.Vector3(4.0, 1.2, -3.2), 700);
        break;
      case 'window':
        startCameraTransition(new THREE.Vector3(-3.2, 2.6, 0.8), new THREE.Vector3(-4.8, 2.5, -1.8), 700);
        break;
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

      {/* Floating Discovery Badges */}
      {floatingPings.map((ping) => (
        <div
          key={ping.id}
          style={{ left: ping.x, top: ping.y }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full z-30 animate-bounce transition-all duration-300"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-semibold shadow-xl backdrop-blur-md">
            <span className="text-emerald-400">✓</span>
            <span>TALÁLAT:</span>
            <span className="text-white truncate max-w-[180px]">{ping.title}</span>
            <span className="text-amber-400 font-mono text-xs">+1000</span>
          </div>
        </div>
      ))}

      {/* Camera View Presets Bar (bottom-left) */}
      <div className="office-camera-presets fixed bottom-4 left-4 z-[120] flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-md shadow-2xl pointer-events-auto">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2">
          Kamera:
        </span>
        <button
          onClick={() => setCameraView('overview')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Teljes iroda
        </button>
        <button
          onClick={() => setCameraView('desk1')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          1-es Munkaállomás
        </button>
        <button
          onClick={() => setCameraView('desk2')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          2-es Munkaállomás
        </button>
        <button
          onClick={() => setCameraView('archive')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Iratszekrény
        </button>
        <button
          onClick={() => setCameraView('window')}
          className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          Ablak & Bejárat
        </button>
      </div>

      {/* Quick Nav/Controls Guide (bottom-center) */}
      <div className="hidden md:flex items-center gap-3 fixed bottom-4 left-1/2 -translate-x-1/2 z-[110] px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none">
        <span>Bal egérgomb: Keresés / Forgatás</span>
        <span aria-hidden="true">·</span>
        <span>Jobb egérgomb: Mozgatás</span>
        <span aria-hidden="true">·</span>
        <span>Görgő: Közelítés</span>
      </div>
    </div>
  );
};

// ========================================================
// HELPER 3D MESH GENERATORS
// ========================================================

// Ergonomic Office Chair
function createOfficeChair(): THREE.Group {
  const chair = new THREE.Group();
  const plasticMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const meshMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });

  // 5-Star Wheel Base
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.04), metalMat);
    arm.position.set(Math.cos(angle) * 0.15, 0.08, Math.sin(angle) * 0.15);
    arm.rotation.y = -angle;
    chair.add(arm);

    // Wheel caster
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), plasticMat);
    wheel.position.set(Math.cos(angle) * 0.28, 0.03, Math.sin(angle) * 0.28);
    chair.add(wheel);
  }

  // Gas Lift Cylinder
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.45, 16), metalMat);
  cylinder.position.set(0, 0.3, 0);
  cylinder.castShadow = true;
  chair.add(cylinder);

  // Seat Cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.48), meshMat);
  seat.position.set(0, 0.52, 0);
  seat.castShadow = true;
  chair.add(seat);

  // Curved Mesh Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.55, 0.05), meshMat);
  back.position.set(0, 0.85, -0.22);
  back.rotation.x = -0.12;
  back.castShadow = true;
  chair.add(back);

  // Armrests
  [-0.26, 0.26].forEach((x) => {
    const armSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), metalMat);
    armSupport.position.set(x, 0.62, 0);
    chair.add(armSupport);

    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.22), plasticMat);
    armPad.position.set(x, 0.72, 0);
    chair.add(armPad);
  });

  return chair;
}

// Modern Office Monitor with Bezel & Stand
function createMonitorMesh(screenMaterial: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });

  // Base plate
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 24), standMat);
  base.position.set(0, 0.006, 0);
  group.add(base);

  // Vertical pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 16), standMat);
  pole.position.set(0, 0.18, -0.04);
  group.add(pole);

  // Monitor frame/casing
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.035), bezelMat);
  frame.position.set(0, 0.38, 0);
  frame.castShadow = true;
  group.add(frame);

  // Screen display surface
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.38), screenMaterial);
  screen.position.set(0, 0.38, 0.019);
  group.add(screen);

  return group;
}

// 3D Human Character Figure for Unattended Visitor in Red Jacket
function createVisitorFigure(): THREE.Group {
  const figure = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe2b998, roughness: 0.6 });
  const redJacketMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }); // Piros ruhás látogató!
  const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 });
  const shoesMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });

  // Shoes
  [-0.1, 0.1].forEach((x) => {
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.22), shoesMat);
    shoe.position.set(x, 0.035, 0.02);
    shoe.castShadow = true;
    figure.add(shoe);
  });

  // Legs / Jeans
  [-0.1, 0.1].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.82, 16), jeansMat);
    leg.position.set(x, 0.45, 0);
    leg.castShadow = true;
    figure.add(leg);
  });

  // Pelvis / Hips
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.2), jeansMat);
  hips.position.set(0, 0.88, 0);
  figure.add(hips);

  // Torso / Bright Red Jacket / Hoodie (NO BADGE / LANYARD!)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.54, 0.24), redJacketMat);
  torso.position.set(0, 1.18, 0);
  torso.castShadow = true;
  figure.add(torso);

  // Arms with hands in pockets
  [-0.24, 0.24].forEach((x, i) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.45, 12), redJacketMat);
    arm.position.set(x, 1.16, 0.04);
    arm.rotation.z = i === 0 ? 0.18 : -0.18;
    arm.rotation.x = -0.25;
    arm.castShadow = true;
    figure.add(arm);

    // Hand entering jacket pocket
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinMat);
    hand.position.set(x * 0.85, 0.94, 0.12);
    figure.add(hand);
  });

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.1, 12), skinMat);
  neck.position.set(0, 1.5, 0);
  figure.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
  head.position.set(0, 1.62, 0);
  head.castShadow = true;
  figure.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
  hair.position.set(0, 1.64, -0.01);
  figure.add(hair);

  return figure;
}
