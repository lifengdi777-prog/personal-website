import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const INITIAL_CAMERA = new THREE.Vector3(1.75, 5, 7.5);
const INITIAL_TARGET = new THREE.Vector3(0.5, 2.5, 0.32);
const SCREEN_CAMERA = new THREE.Vector3(0.4, 0.8, 1.75);
const SCREEN_TARGET = new THREE.Vector3(0.4, 3.39, -0.38);
const MODEL_SCREEN_BOUNDS = {
  x: [-1.2, 1.76],
  y: [0.45, 3.8],
  z: [-5.35, -3.25],
};

function isPointOnScreen(point) {
  return (
    point.x >= MODEL_SCREEN_BOUNDS.x[0] &&
    point.x <= MODEL_SCREEN_BOUNDS.x[1] &&
    point.y >= MODEL_SCREEN_BOUNDS.y[0] &&
    point.y <= MODEL_SCREEN_BOUNDS.y[1] &&
    point.z >= MODEL_SCREEN_BOUNDS.z[0] &&
    point.z <= MODEL_SCREEN_BOUNDS.z[1]
  );
}

function CameraRig({ phase }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    camera.position.copy(INITIAL_CAMERA);
    camera.lookAt(INITIAL_TARGET);
  }, [camera]);

  useFrame((_, delta) => {
    if (phase !== 'booting') return;

    camera.position.lerp(SCREEN_CAMERA, 1 - Math.exp(-delta * 3));
    camera.lookAt(SCREEN_TARGET);
    controlsRef.current?.target.lerp(SCREEN_TARGET, 1 - Math.exp(-delta * 3));
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
    ref={controlsRef}
    enabled={phase === 'intro'}
    target={INITIAL_TARGET}
    enablePan={false}
    enableZoom={false}
    minDistance={2.6}
    maxDistance={14}
    minPolarAngle={0.95}
    maxPolarAngle={1.42}
    rotateSpeed={0.55}
    zoomSpeed={0.5}
    />
  );
}

function IBMComputerModel({ phase, onScreenClick }) {
  const model = useGLTF('/models/ibm_computer.glb');
  const groupRef = useRef(null);
  const localPointRef = useRef(new THREE.Vector3());
  const debugScreen = new URLSearchParams(window.location.search).has('debugScreen');

  useLayoutEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3.2 / Math.max(size.x, size.y, size.z);

    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.set(-center.x * scale, -box.min.y * scale - 0.72, -center.z * scale);
  }, [model.scene]);

  return (
    <group
      ref={groupRef}
      rotation={[0, 0, 0]}
      onPointerMove={(event) => {
        if (phase !== 'intro' || !groupRef.current) return;

        const localPoint = localPointRef.current.copy(event.point);
        groupRef.current.worldToLocal(localPoint);
        document.body.style.cursor = isPointOnScreen(localPoint) ? 'pointer' : 'auto';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
      onClick={(event) => {
        if (phase !== 'intro' || !groupRef.current) return;

        const localPoint = localPointRef.current.copy(event.point);
        groupRef.current.worldToLocal(localPoint);
        if (debugScreen) {
          console.info('model local click', {
            x: Number(localPoint.x.toFixed(3)),
            y: Number(localPoint.y.toFixed(3)),
            z: Number(localPoint.z.toFixed(3)),
          });
        }

        if (isPointOnScreen(localPoint)) {
          event.stopPropagation();
          document.body.style.cursor = 'auto';
          onScreenClick();
        }
      }}
    >
      <primitive object={model.scene} />
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.5, 4.5, 3]} intensity={2.1} castShadow />
      <spotLight position={[-2.8, 3.2, 2.4]} angle={0.48} penumbra={0.65} intensity={1.45} />
      <pointLight position={[0, 1.15, 1.1]} color="#63ff2a" intensity={0.65} distance={2.4} />
    </>
  );
}

function LoadingModel() {
  return (
    <Html center>
      <div className="loading-chip">LOADING MODEL</div>
    </Html>
  );
}

export default function IntroScene3D({ phase, onScreenClick }) {
  const dpr = useMemo(() => [1, Math.min(window.devicePixelRatio, 1.8)], []);

  return (
    <Canvas
      className="intro-canvas"
      dpr={dpr}
      camera={{ position: INITIAL_CAMERA.toArray(), fov: 38, near: 0.1, far: 100 }}
      shadows
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#211d1e"]} />
      <SceneLights />
      <Suspense fallback={<LoadingModel />}>
        <IBMComputerModel phase={phase} onScreenClick={onScreenClick} />
        <ContactShadows position={[0, -0.72, 0]} opacity={0.38} scale={5.2} blur={2.2} />
        <Environment preset="city" />
      </Suspense>
      <CameraRig phase={phase} />
    </Canvas>
  );
}

useGLTF.preload('/models/ibm_computer.glb');