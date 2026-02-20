import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import "./App.css";

/* Enemy */
function Enemy({ position, onHit }) {
  const ref = useRef();

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={onHit}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}

/* Gun */
function Gun() {
  return (
    <mesh position={[0.3, -0.3, -0.7]}>
      <boxGeometry args={[0.3, 0.2, 1]} />
      <meshStandardMaterial color="black" />
    </mesh>
  );
}

/* Player Movement */
function Player({ shoot }) {
  const { camera } = useThree();
  const keys = useRef({});

  useEffect(() => {
    const down = (e) => (keys.current[e.key] = true);
    const up = (e) => (keys.current[e.key] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    window.addEventListener("click", shoot);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("click", shoot);
    };
  }, [shoot]);

  useFrame(() => {
    const speed = 0.1;

    if (keys.current.w) camera.position.z -= speed;
    if (keys.current.s) camera.position.z += speed;
    if (keys.current.a) camera.position.x -= speed;
    if (keys.current.d) camera.position.x += speed;
  });

  return <Gun />;
}

/* Scene */
function Scene({ addScore }) {
  const [enemyPos, setEnemyPos] = useState([0, 1, -10]);
  const { camera, scene } = useThree();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(0, 0);

  /* Shooting */
  const shoot = () => {
    raycaster.setFromCamera(mouse, camera);

    const hits = raycaster.intersectObjects(scene.children);

    hits.forEach((hit) => {
      if (hit.object.name === "enemy") {
        addScore();
        setEnemyPos([
          Math.random() * 20 - 10,
          1,
          Math.random() * -20,
        ]);
      }
    });
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="green" />
      </mesh>

      {/* Enemy */}
      <mesh
        name="enemy"
        position={enemyPos}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Player */}
      <Player shoot={shoot} />

      <PointerLockControls />
    </>
  );
}

/* Main App */
export default function App() {
  const [score, setScore] = useState(0);

  return (
    <>
      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <Scene addScore={() => setScore((s) => s + 10)} />
      </Canvas>

      {/* UI */}
      <div className="hud">
        🎯 Score: {score}
      </div>

      <div className="crosshair">+</div>
    </>
  );
}
