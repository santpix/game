"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Vec3Tuple = [number, number, number];

type BuildingDef = {
  id: string;
  label: string;
  subtitle: string;
  position: Vec3Tuple;
  height: number;
  radius: number;
  accent: string;
};

const BUILDINGS: BuildingDef[] = [
  { id: "santpix", label: "SANTPIX", subtitle: "Tecnología & Ecommerce", position: [-5.4, 0, -3.2], height: 4.8, radius: 2.6, accent: "#efe8dc" },
  { id: "merco", label: "MERCO", subtitle: "Crecimiento & Performance", position: [0, 0, -5.8], height: 4.0, radius: 2.5, accent: "#cdbb91" },
  { id: "dropi", label: "DROPI", subtitle: "Comercio & Fulfillment", position: [5.5, 0, -2.5], height: 5.3, radius: 2.7, accent: "#aebcab" },
  { id: "bank", label: "BANCO", subtitle: "Capital & Crédito", position: [-4.7, 0, 4.5], height: 3.0, radius: 2.3, accent: "#cbc4b7" },
  { id: "ai", label: "CENTRO IA", subtitle: "Análisis & Automatización", position: [4.3, 0, 4.3], height: 4.3, radius: 2.4, accent: "#aeb7c5" },
];

function Tree({ position, scale = 1 }: { position: Vec3Tuple; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.16, 1.1, 10]} />
        <meshStandardMaterial color="#4d4034" roughness={1} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#52604d" roughness={0.95} />
      </mesh>
      <mesh position={[0.34, 1.52, 0.08]} castShadow>
        <sphereGeometry args={[0.46, 14, 14]} />
        <meshStandardMaterial color="#5d6b56" roughness={0.95} />
      </mesh>
    </group>
  );
}

function StreetLight({ position }: { position: Vec3Tuple }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 2.3, 10]} />
        <meshStandardMaterial color="#202020" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[0, 2.34, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fff1c9" emissive="#ffd98b" emissiveIntensity={2.2} />
      </mesh>
      <pointLight position={[0, 2.25, 0]} intensity={0.7} distance={4.5} color="#ffdca0" />
    </group>
  );
}

function Building({ def, active }: { def: BuildingDef; active: boolean }) {
  const floors = Math.max(2, Math.floor(def.height / 0.9));
  const [x, , z] = def.position;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.05, def.height, 3.05]} />
        <meshStandardMaterial
          color={active ? "#30302f" : "#202120"}
          roughness={0.46}
          metalness={0.22}
          emissive={active ? def.accent : "#000000"}
          emissiveIntensity={active ? 0.18 : 0}
        />
      </mesh>

      <mesh position={[0, def.height + 0.1, 0]} castShadow>
        <boxGeometry args={[3.2, 0.2, 3.2]} />
        <meshStandardMaterial color={def.accent} roughness={0.62} />
      </mesh>

      <mesh position={[0, 0.75, 1.55]}>
        <boxGeometry args={[1.15, 1.35, 0.08]} />
        <meshStandardMaterial color="#171817" metalness={0.5} roughness={0.25} />
      </mesh>

      {Array.from({ length: floors }).map((_, floor) => (
        <group key={floor} position={[0, 0.72 + floor * 0.86, 0]}>
          {[-0.8, 0, 0.8].map((wx) => (
            <mesh key={`f-${wx}`} position={[wx, 0, 1.555]}>
              <boxGeometry args={[0.52, 0.34, 0.045]} />
              <meshStandardMaterial color="#d8d5cc" emissive="#d1c391" emissiveIntensity={0.2} roughness={0.18} metalness={0.3} />
            </mesh>
          ))}
          {[-0.8, 0, 0.8].map((wz) => (
            <mesh key={`s-${wz}`} position={[1.555, 0, wz]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.52, 0.34, 0.045]} />
              <meshStandardMaterial color="#bdc3c3" emissive="#aeb7b7" emissiveIntensity={0.12} roughness={0.2} metalness={0.38} />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[def.radius - 0.13, def.radius, 48]} />
        <meshBasicMaterial color={def.accent} transparent opacity={active ? 0.95 : 0.18} />
      </mesh>
    </group>
  );
}

function Player({ onNearby }: { onNearby: (building: BuildingDef | null) => void }) {
  const player = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const lastInteract = useRef(false);
  const { camera } = useThree();
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const desiredCamera = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!player.current) return;

    let x = 0;
    let z = 0;
    let interact = !!keys.current.KeyE || !!keys.current.Space;

    if (keys.current.KeyW || keys.current.ArrowUp) z -= 1;
    if (keys.current.KeyS || keys.current.ArrowDown) z += 1;
    if (keys.current.KeyA || keys.current.ArrowLeft) x -= 1;
    if (keys.current.KeyD || keys.current.ArrowRight) x += 1;

    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      const pad = Array.from(navigator.getGamepads()).find(Boolean);
      if (pad) {
        const dead = 0.16;
        const ax = Math.abs(pad.axes[0] ?? 0) > dead ? pad.axes[0] : 0;
        const az = Math.abs(pad.axes[1] ?? 0) > dead ? pad.axes[1] : 0;
        x += ax;
        z += az;
        interact = interact || !!pad.buttons[0]?.pressed;
      }
    }

    velocity.set(x, 0, z);
    if (velocity.lengthSq() > 1) velocity.normalize();

    const speed = 4.6;
    player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + velocity.x * speed * delta, -9.5, 9.5);
    player.current.position.z = THREE.MathUtils.clamp(player.current.position.z + velocity.z * speed * delta, -9.5, 9.5);

    if (velocity.lengthSq() > 0.001) player.current.rotation.y = Math.atan2(velocity.x, velocity.z);

    let nearby: BuildingDef | null = null;
    let bestDistance = Infinity;
    for (const building of BUILDINGS) {
      const dx = player.current.position.x - building.position[0];
      const dz = player.current.position.z - building.position[2];
      const distance = Math.hypot(dx, dz);
      if (distance < building.radius && distance < bestDistance) {
        nearby = building;
        bestDistance = distance;
      }
    }
    onNearby(nearby);

    if (interact && !lastInteract.current && nearby) {
      window.dispatchEvent(new CustomEvent("game-interact", { detail: nearby }));
    }
    lastInteract.current = interact;

    desiredCamera.set(player.current.position.x + 7.4, 7.8, player.current.position.z + 9.6);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.002, delta));
    camera.lookAt(player.current.position.x, 0.9, player.current.position.z);
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      <mesh position={[0, 0.86, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.95, 8, 14]} />
        <meshStandardMaterial color="#111111" roughness={0.34} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#d2b9a4" roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.54, 0.34]} castShadow>
        <boxGeometry args={[0.58, 0.12, 0.18]} />
        <meshStandardMaterial color="#d6c7a6" metalness={0.15} roughness={0.5} />
      </mesh>
    </group>
  );
}

function City({ activeId, onNearby }: { activeId?: string; onNearby: (building: BuildingDef | null) => void }) {
  const trees: Vec3Tuple[] = [
    [-8.2, 0, -7], [-8.0, 0, 1.2], [-8.3, 0, 7], [-2, 0, 7.6], [2, 0, 7.5],
    [8.2, 0, -6.8], [8.2, 0, 0.8], [8.4, 0, 7], [-2, 0, -8.3], [2, 0, -8.1]
  ];
  const lights: Vec3Tuple[] = [
    [-3.8, 0, -1.5], [3.8, 0, -1.5], [-3.8, 0, 1.6], [3.8, 0, 1.6],
    [-1.6, 0, -3.8], [1.6, 0, -3.8], [-1.6, 0, 3.8], [1.6, 0, 3.8]
  ];

  return (
    <>
      <color attach="background" args={["#b8b4aa"]} />
      <fog attach="fog" args={["#b8b4aa", 18, 33]} />
      <ambientLight intensity={1.4} />
      <hemisphereLight intensity={1.0} color="#f3ede2" groundColor="#69675f" />
      <directionalLight position={[9, 14, 7]} intensity={2.3} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[42, 42]} />
        <meshStandardMaterial color="#949189" roughness={1} />
      </mesh>

      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.15, 64]} />
        <meshStandardMaterial color="#c7c0b3" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.72, 3.96, 64]} />
        <meshStandardMaterial color="#eee8dc" roughness={0.76} />
      </mesh>

      {[
        [0, -6.3, 3.5, 12.5, 0],
        [0, 6.3, 3.5, 12.5, 0],
        [-6.3, 0, 3.5, 12.5, Math.PI / 2],
        [6.3, 0, 3.5, 12.5, Math.PI / 2],
      ].map(([x, z, w, h, rot], i) => (
        <mesh key={i} position={[x, 0.04, z]} rotation={[-Math.PI / 2, 0, rot]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#3d3e3c" roughness={0.98} />
        </mesh>
      ))}

      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.45, 0.58, 48]} />
          <meshStandardMaterial color="#d3ccbe" roughness={0.76} />
        </mesh>
        <mesh position={[0, 0.61, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.12, 48]} />
          <meshStandardMaterial color="#6f8b91" roughness={0.25} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 1.15, 16]} />
          <meshStandardMaterial color="#837a6f" metalness={0.52} roughness={0.38} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.19, 18, 18]} />
          <meshStandardMaterial color="#fff0c8" emissive="#eecb81" emissiveIntensity={1.1} />
        </mesh>
      </group>

      {BUILDINGS.map((def) => <Building key={def.id} def={def} active={def.id === activeId} />)}
      {trees.map((position, i) => <Tree key={i} position={position} scale={i % 3 === 0 ? 1.12 : 0.96} />)}
      {lights.map((position, i) => <StreetLight key={i} position={position} />)}

      <Player onNearby={onNearby} />
    </>
  );
}

export default function World() {
  const [nearby, setNearby] = useState<BuildingDef | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<BuildingDef>).detail;
      setMessage(`${detail.label} · ${detail.subtitle}`);
      window.setTimeout(() => setMessage(""), 1800);
    };
    window.addEventListener("game-interact", handle);
    return () => window.removeEventListener("game-interact", handle);
  }, []);

  return (
    <div className="game-stage">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [7.4, 7.8, 9.6], fov: 47 }} gl={{ antialias: true }}>
        <City activeId={nearby?.id} onNearby={setNearby} />
      </Canvas>

      <div className="location-legend">
        {BUILDINGS.map((building) => (
          <div key={building.id} className={nearby?.id === building.id ? "legend-item active" : "legend-item"}>
            <span className="legend-dot" style={{ background: building.accent }} />
            <div><strong>{building.label}</strong><small>{building.subtitle}</small></div>
          </div>
        ))}
      </div>

      {nearby && (
        <div className="interaction-card">
          <span className="interaction-kicker">ESTÁS CERCA DE</span>
          <strong>{nearby.label}</strong>
          <small>{nearby.subtitle}</small>
          <span className="interaction-action">E / A · ENTRAR</span>
        </div>
      )}

      {message && <div className="game-toast">{message}</div>}
    </div>
  );
}
