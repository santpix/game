"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Vec3Tuple = [number, number, number];
type BuildingId = "santpix" | "merco" | "dropi" | "bank" | "ai";

type BuildingDef = {
  id: BuildingId;
  label: string;
  subtitle: string;
  position: Vec3Tuple;
  radius: number;
  accent: string;
};

const BUILDINGS: BuildingDef[] = [
  { id: "santpix", label: "SANTPIX", subtitle: "Tecnología & Ecommerce", position: [-5.8, 0, -3.4], radius: 2.7, accent: "#f0e9dc" },
  { id: "merco", label: "MERCO", subtitle: "Crecimiento & Performance", position: [0, 0, -6.2], radius: 2.65, accent: "#cdb786" },
  { id: "dropi", label: "DROPI", subtitle: "Comercio & Fulfillment", position: [5.9, 0, -2.8], radius: 2.85, accent: "#a7b9aa" },
  { id: "bank", label: "BANCO", subtitle: "Capital & Crédito", position: [-5.1, 0, 4.8], radius: 2.5, accent: "#d0c7b8" },
  { id: "ai", label: "CENTRO IA", subtitle: "Análisis & Automatización", position: [4.9, 0, 4.7], radius: 2.6, accent: "#aeb9ca" },
];

const mat = {
  charcoal: "#171817",
  graphite: "#242523",
  stone: "#c9c2b4",
  stoneDark: "#aaa294",
  glass: "#91a2a3",
  warmGlass: "#cfc3a2",
  road: "#363735",
  curb: "#ded8cc",
  green: "#52604d",
  green2: "#65725e",
  brass: "#aa9465",
};

function WindowStrip({ position, size = [2.2, 0.34, 0.05], color = mat.glass, emissive = mat.glass, rotation = [0, 0, 0] as Vec3Tuple }: { position: Vec3Tuple; size?: Vec3Tuple; color?: string; emissive?: string; rotation?: Vec3Tuple }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.18} metalness={0.42} roughness={0.18} />
    </mesh>
  );
}

function Planter({ position, scale = 1 }: { position: Vec3Tuple; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.05, 0.36, 0.56]} />
        <meshStandardMaterial color="#9b9488" roughness={0.88} />
      </mesh>
      {[-0.28, 0, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <sphereGeometry args={[0.23, 12, 12]} />
          <meshStandardMaterial color={x === 0 ? mat.green2 : mat.green} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ position, rotationY = 0 }: { position: Vec3Tuple; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.35, 0.12, 0.42]} />
        <meshStandardMaterial color="#6f5b48" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.72, 0.18]} rotation={[-0.14, 0, 0]} castShadow>
        <boxGeometry args={[1.35, 0.45, 0.1]} />
        <meshStandardMaterial color="#6f5b48" roughness={0.68} />
      </mesh>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.34]} />
          <meshStandardMaterial color="#252525" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Vec3Tuple; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.45, 10]} />
        <meshStandardMaterial color="#4b3f34" roughness={1} />
      </mesh>
      <mesh position={[0, 1.72, 0]} castShadow>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color={mat.green} roughness={0.95} />
      </mesh>
      <mesh position={[0.42, 1.78, -0.08]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={mat.green2} roughness={0.95} />
      </mesh>
      <mesh position={[-0.32, 1.88, 0.13]} castShadow>
        <icosahedronGeometry args={[0.46, 1]} />
        <meshStandardMaterial color="#5b6754" roughness={0.95} />
      </mesh>
    </group>
  );
}

function StreetLight({ position }: { position: Vec3Tuple }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 2.5, 10]} />
        <meshStandardMaterial color="#1c1d1c" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 2.48, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 12]} />
        <meshStandardMaterial color="#222" metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0, 2.58, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fff0c2" emissive="#ffd988" emissiveIntensity={2.1} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={0.55} distance={4.2} color="#ffdca0" />
    </group>
  );
}

function SantPixBuilding({ active }: { active: boolean }) {
  const accent = "#f0e9dc";
  return (
    <group>
      <mesh position={[-0.45, 2.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.55, 5.3, 2.7]} />
        <meshPhysicalMaterial color="#151615" roughness={0.28} metalness={0.42} clearcoat={0.45} emissive={active ? accent : "#000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      <mesh position={[1.05, 1.65, 0.28]} castShadow>
        <boxGeometry args={[1.45, 3.3, 2.2]} />
        <meshStandardMaterial color="#262725" roughness={0.35} metalness={0.3} />
      </mesh>
      {[1.1, 2, 2.9, 3.8, 4.7].map((y) => <WindowStrip key={y} position={[-0.45, y, 1.375]} size={[1.85, 0.42, 0.045]} color="#94a3a2" />)}
      {[0.8, 1.6, 2.4].map((y) => <WindowStrip key={y} position={[1.05, y, 1.405]} size={[0.9, 0.42, 0.045]} color="#c6bea5" emissive="#c6bea5" />)}
      <mesh position={[0.72, 0.23, 1.82]} castShadow>
        <boxGeometry args={[2.8, 0.18, 1.1]} />
        <meshStandardMaterial color={accent} roughness={0.6} />
      </mesh>
      <mesh position={[0.7, 1.55, 1.46]} castShadow>
        <boxGeometry args={[1.45, 0.16, 1.0]} />
        <meshStandardMaterial color={accent} metalness={0.25} roughness={0.45} />
      </mesh>
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x + 0.72, 0.82, 1.49]}>
          <boxGeometry args={[0.32, 1.2, 0.05]} />
          <meshStandardMaterial color="#9aa7a6" metalness={0.5} roughness={0.18} />
        </mesh>
      ))}
      {[-0.9, -0.3, 0.3, 0.9].map((x) => (
        <mesh key={x} position={[x - 0.45, 5.72, 0]} castShadow>
          <boxGeometry args={[0.06, 0.72, 2.4]} />
          <meshStandardMaterial color={accent} roughness={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function MercoBuilding({ active }: { active: boolean }) {
  const accent = "#cdb786";
  return (
    <group>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[3.2, 3.4, 2.8]} />
        <meshStandardMaterial color="#20211f" roughness={0.34} metalness={0.28} emissive={active ? accent : "#000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      <mesh position={[0.35, 3.85, -0.12]} castShadow>
        <boxGeometry args={[2.5, 1.6, 2.35]} />
        <meshStandardMaterial color="#2b2b29" roughness={0.36} metalness={0.25} />
      </mesh>
      {[0.55, 1.25, 1.95, 2.65, 3.45, 4.05].map((y) => <WindowStrip key={y} position={[0, y, 1.415]} size={[2.55, 0.32, 0.05]} color="#bfc4bd" emissive="#bbb69f" />)}
      {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
        <mesh key={x} position={[x, 2.15, 1.49]} castShadow>
          <boxGeometry args={[0.07, 4.25, 0.09]} />
          <meshStandardMaterial color={accent} metalness={0.35} roughness={0.42} />
        </mesh>
      ))}
      <mesh position={[0.62, 3.05, 0.98]} castShadow>
        <boxGeometry args={[1.8, 0.16, 1.5]} />
        <meshStandardMaterial color="#8d8167" roughness={0.72} />
      </mesh>
      <Planter position={[0.1, 3.18, 0.85]} scale={0.62} />
      <Planter position={[1.1, 3.18, 0.85]} scale={0.62} />
      <mesh position={[0, 0.78, 1.48]}>
        <boxGeometry args={[1.2, 1.4, 0.06]} />
        <meshStandardMaterial color="#8b9898" metalness={0.5} roughness={0.18} />
      </mesh>
    </group>
  );
}

function DropiBuilding({ active }: { active: boolean }) {
  const accent = "#a7b9aa";
  return (
    <group>
      <mesh position={[0, 1.3, 0.15]} castShadow>
        <boxGeometry args={[4.2, 2.6, 3.2]} />
        <meshStandardMaterial color="#202522" roughness={0.46} metalness={0.18} emissive={active ? accent : "#000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      <mesh position={[1.05, 3.55, -0.3]} castShadow>
        <boxGeometry args={[1.8, 4.5, 2.1]} />
        <meshStandardMaterial color="#171a18" roughness={0.35} metalness={0.28} />
      </mesh>
      {[2.25, 3.05, 3.85, 4.65, 5.45].map((y) => <WindowStrip key={y} position={[1.05, y, 0.765]} size={[1.25, 0.34, 0.05]} color="#a8b5af" emissive="#9cab9e" />)}
      {[-1.15, 0, 1.15].map((x) => (
        <group key={x} position={[x - 0.55, 0, 1.79]}>
          <mesh position={[0, 0.78, 0]}>
            <boxGeometry args={[0.9, 1.35, 0.08]} />
            <meshStandardMaterial color="#b8beb9" metalness={0.35} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.52, 0.28]} castShadow>
            <boxGeometry args={[1.08, 0.12, 0.64]} />
            <meshStandardMaterial color={accent} roughness={0.55} />
          </mesh>
        </group>
      ))}
      {[-1.35, -0.85, -0.35].map((x) => (
        <mesh key={x} position={[x, 2.78, 0.2]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.45, 12]} />
          <meshStandardMaterial color="#727a74" metalness={0.5} roughness={0.42} />
        </mesh>
      ))}
      <mesh position={[-1.75, 1.55, -0.5]} castShadow>
        <boxGeometry args={[0.16, 2.2, 2.0]} />
        <meshStandardMaterial color={accent} roughness={0.58} />
      </mesh>
    </group>
  );
}

function BankBuilding({ active }: { active: boolean }) {
  const accent = "#d0c7b8";
  return (
    <group>
      <mesh position={[0, 1.65, -0.18]} castShadow>
        <boxGeometry args={[3.6, 3.3, 2.7]} />
        <meshStandardMaterial color="#373632" roughness={0.58} metalness={0.12} emissive={active ? accent : "#000"} emissiveIntensity={active ? 0.08 : 0} />
      </mesh>
      {[0, 0.16, 0.32].map((y, i) => (
        <mesh key={i} position={[0, y, 1.62]} castShadow>
          <boxGeometry args={[3.8 - i * 0.2, 0.16, 1.1 - i * 0.15]} />
          <meshStandardMaterial color={i === 2 ? accent : mat.stoneDark} roughness={0.72} />
        </mesh>
      ))}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.55, 1.34]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 2.45, 16]} />
          <meshStandardMaterial color={accent} roughness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, 2.96, 1.28]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[2.2, 2.2, 0.24]} />
        <meshStandardMaterial color={accent} roughness={0.64} />
      </mesh>
      <mesh position={[0, 1.0, 1.41]}>
        <boxGeometry args={[0.9, 1.5, 0.05]} />
        <meshStandardMaterial color="#6f7e7f" metalness={0.45} roughness={0.2} />
      </mesh>
    </group>
  );
}

function AiBuilding({ active }: { active: boolean }) {
  const accent = "#aeb9ca";
  return (
    <group>
      <mesh position={[0, 2.45, 0]} castShadow>
        <cylinderGeometry args={[1.35, 1.65, 4.9, 28]} />
        <meshStandardMaterial color="#1b1e22" roughness={0.28} metalness={0.45} emissive={active ? accent : "#000"} emissiveIntensity={active ? 0.12 : 0} />
      </mesh>
      {[1.15, 2.05, 2.95, 3.85].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[1.52 - y * 0.025, 0.055, 10, 42]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.48} metalness={0.38} roughness={0.28} />
        </mesh>
      ))}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const r = 1.43;
        return <mesh key={i} position={[Math.cos(a) * r, 2.45, Math.sin(a) * r]} rotation={[0, -a, 0]}><boxGeometry args={[0.22, 3.6, 0.06]} /><meshStandardMaterial color="#8292a6" emissive="#77879a" emissiveIntensity={0.18} metalness={0.45} roughness={0.24} /></mesh>;
      })}
      <mesh position={[0, 5.18, 0]} castShadow>
        <cylinderGeometry args={[0.75, 1.1, 0.32, 28]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.8, 1.55]}>
        <boxGeometry args={[0.95, 1.4, 0.06]} />
        <meshStandardMaterial color="#8fa1b2" emissive="#72879c" emissiveIntensity={0.35} metalness={0.48} roughness={0.18} />
      </mesh>
    </group>
  );
}

function PremiumBuilding({ def, active }: { def: BuildingDef; active: boolean }) {
  const [x, , z] = def.position;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[def.radius, def.radius + 0.12, 0.12, 42]} />
        <meshStandardMaterial color="#bdb6a9" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[def.radius - 0.16, def.radius, 48]} />
        <meshBasicMaterial color={def.accent} transparent opacity={active ? 0.95 : 0.18} />
      </mesh>
      {def.id === "santpix" && <SantPixBuilding active={active} />}
      {def.id === "merco" && <MercoBuilding active={active} />}
      {def.id === "dropi" && <DropiBuilding active={active} />}
      {def.id === "bank" && <BankBuilding active={active} />}
      {def.id === "ai" && <AiBuilding active={active} />}
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
  const walkPhase = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((_, delta) => {
    if (!player.current) return;
    let x = 0, z = 0;
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
        x += ax; z += az; interact = interact || !!pad.buttons[0]?.pressed;
      }
    }
    velocity.set(x, 0, z);
    if (velocity.lengthSq() > 1) velocity.normalize();
    const moving = velocity.lengthSq() > 0.001;
    const speed = 4.4;
    player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + velocity.x * speed * delta, -10, 10);
    player.current.position.z = THREE.MathUtils.clamp(player.current.position.z + velocity.z * speed * delta, -10, 10);
    if (moving) {
      player.current.rotation.y = Math.atan2(velocity.x, velocity.z);
      walkPhase.current += delta * 9;
      player.current.position.y = Math.sin(walkPhase.current) * 0.025;
    } else player.current.position.y *= 0.85;

    let nearby: BuildingDef | null = null, best = Infinity;
    for (const building of BUILDINGS) {
      const d = Math.hypot(player.current.position.x - building.position[0], player.current.position.z - building.position[2]);
      if (d < building.radius && d < best) { nearby = building; best = d; }
    }
    onNearby(nearby);
    if (interact && !lastInteract.current && nearby) window.dispatchEvent(new CustomEvent("game-interact", { detail: nearby }));
    lastInteract.current = interact;

    desiredCamera.set(player.current.position.x + 7.6, 8.1, player.current.position.z + 10.2);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.002, delta));
    camera.lookAt(player.current.position.x, 1.0, player.current.position.z);
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      <mesh position={[0, 1.18, 0]} castShadow><boxGeometry args={[0.62, 0.9, 0.34]} /><meshStandardMaterial color="#111" roughness={0.38} metalness={0.12} /></mesh>
      <mesh position={[0, 1.86, 0]} castShadow><sphereGeometry args={[0.27, 18, 18]} /><meshStandardMaterial color="#d3baa6" roughness={0.64} /></mesh>
      {[-0.22, 0.22].map((x) => <mesh key={x} position={[x, 0.48, 0]} castShadow><capsuleGeometry args={[0.11, 0.62, 5, 8]} /><meshStandardMaterial color="#252525" roughness={0.52} /></mesh>)}
      {[-0.42, 0.42].map((x) => <mesh key={x} position={[x, 1.18, 0]} rotation={[0, 0, x < 0 ? -0.13 : 0.13]} castShadow><capsuleGeometry args={[0.09, 0.55, 5, 8]} /><meshStandardMaterial color="#d3baa6" roughness={0.62} /></mesh>)}
      <mesh position={[0, 1.28, 0.2]}><boxGeometry args={[0.38, 0.12, 0.05]} /><meshStandardMaterial color="#c9b784" metalness={0.2} roughness={0.5} /></mesh>
    </group>
  );
}

function City({ activeId, onNearby }: { activeId?: string; onNearby: (building: BuildingDef | null) => void }) {
  const trees: Vec3Tuple[] = [[-8.8,0,-7.8],[-8.6,0,-0.8],[-8.9,0,7.6],[-2.3,0,8.3],[2.4,0,8.2],[8.7,0,-7.5],[8.8,0,0.9],[8.9,0,7.5],[-2.3,0,-8.8],[2.4,0,-8.7]];
  const lights: Vec3Tuple[] = [[-4.1,0,-1.8],[4.1,0,-1.8],[-4.1,0,1.8],[4.1,0,1.8],[-1.8,0,-4.1],[1.8,0,-4.1],[-1.8,0,4.1],[1.8,0,4.1]];
  const planters: Vec3Tuple[] = [[-2.8,0,2.9],[2.8,0,2.9],[-2.8,0,-2.9],[2.8,0,-2.9]];

  return (
    <>
      <color attach="background" args={["#b8b4aa"]} />
      <fog attach="fog" args={["#b8b4aa", 20, 36]} />
      <ambientLight intensity={1.25} />
      <hemisphereLight intensity={1.05} color="#f4eee3" groundColor="#64635d" />
      <directionalLight position={[9, 14, 7]} intensity={2.15} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[46, 46]} /><meshStandardMaterial color="#908d85" roughness={1} /></mesh>

      {[[0,-6.8,4.0,14,0],[0,6.8,4.0,14,0],[-6.8,0,4.0,14,Math.PI/2],[6.8,0,4.0,14,Math.PI/2]].map(([x,z,w,h,r],i)=><mesh key={i} position={[x,0.035,z]} rotation={[-Math.PI/2,0,r]} receiveShadow><planeGeometry args={[w,h]} /><meshStandardMaterial color={mat.road} roughness={0.98} /></mesh>)}

      {[-6.8,6.8].flatMap((z) => [-1.05,0,1.05].map((x) => <mesh key={`${z}-${x}`} position={[x,0.048,z]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.12,2.8]} /><meshBasicMaterial color="#d8d0c1" /></mesh>))}
      {[-6.8,6.8].flatMap((x) => [-1.05,0,1.05].map((z) => <mesh key={`${x}-${z}`} position={[x,0.049,z]} rotation={[-Math.PI/2,0,Math.PI/2]}><planeGeometry args={[0.12,2.8]} /><meshBasicMaterial color="#d8d0c1" /></mesh>))}

      <mesh position={[0,0.025,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[5.35,64]} /><meshStandardMaterial color="#c5beb1" roughness={0.92} /></mesh>
      <mesh position={[0,0.055,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[3.85,4.08,64]} /><meshStandardMaterial color="#eee8dc" roughness={0.75} /></mesh>
      <mesh position={[0,0.11,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[5.05,5.28,64]} /><meshStandardMaterial color="#aaa396" roughness={0.88} /></mesh>

      <group>
        <mesh position={[0,0.34,0]} castShadow><cylinderGeometry args={[1.25,1.5,0.62,48]} /><meshStandardMaterial color="#d3ccbe" roughness={0.76} /></mesh>
        <mesh position={[0,0.66,0]}><cylinderGeometry args={[0.92,0.92,0.12,48]} /><meshStandardMaterial color="#708d92" roughness={0.22} metalness={0.08} /></mesh>
        <mesh position={[0,1.28,0]} castShadow><cylinderGeometry args={[0.08,0.12,1.25,16]} /><meshStandardMaterial color="#847b70" metalness={0.52} roughness={0.36} /></mesh>
        <mesh position={[0,2.0,0]}><sphereGeometry args={[0.2,18,18]} /><meshStandardMaterial color="#fff0c8" emissive="#eecb81" emissiveIntensity={1.2} /></mesh>
      </group>

      {BUILDINGS.map((def) => <PremiumBuilding key={def.id} def={def} active={def.id === activeId} />)}
      {trees.map((p,i)=><Tree key={i} position={p} scale={i%3===0?1.12:1} />)}
      {lights.map((p,i)=><StreetLight key={i} position={p} />)}
      {planters.map((p,i)=><Planter key={i} position={p} />)}
      <Bench position={[-3.25,0,0.25]} rotationY={Math.PI/2} />
      <Bench position={[3.25,0,-0.25]} rotationY={-Math.PI/2} />
      <Bench position={[0.25,0,3.25]} rotationY={Math.PI} />
      <Bench position={[-0.25,0,-3.25]} />

      {[-9.6,-8.8,8.8,9.6].flatMap((x)=>[-2.2,2.2].map((z)=><mesh key={`${x}-${z}`} position={[x,0.35,z]} castShadow><cylinderGeometry args={[0.08,0.1,0.7,10]} /><meshStandardMaterial color="#343434" metalness={0.5} roughness={0.38} /></mesh>))}

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
    <div className="gameViewport">
      <Canvas shadows dpr={[1, 1.65]} camera={{ position: [7.6, 8.1, 10.2], fov: 47 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <City activeId={nearby?.id} onNearby={setNearby} />
      </Canvas>

      <div className="districtLabel"><span>DISTRITO</span><strong>NEGOCIOS & INNOVACIÓN</strong></div>
      {nearby && <div className="interactionPrompt"><span className="interactionKey">E / A</span><div><small>ENTRAR A</small><strong>{nearby.label}</strong></div></div>}
      {message && <div className="gameToast">{message}</div>}
    </div>
  );
}
