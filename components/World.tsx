"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text } from "@react-three/drei";
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
  { id: "santpix", label: "SANTPIX", subtitle: "TECNOLOGÍA & ECOMMERCE", position: [-5.4, 0, -3.2], height: 4.6, radius: 2.6, accent: "#f4f1e9" },
  { id: "merco", label: "MERCO", subtitle: "CRECIMIENTO & PERFORMANCE", position: [0, 0, -5.6], height: 3.7, radius: 2.5, accent: "#d8c9a7" },
  { id: "dropi", label: "DROPI", subtitle: "COMERCIO & FULFILLMENT", position: [5.4, 0, -2.5], height: 5.1, radius: 2.7, accent: "#c7d0c5" },
  { id: "bank", label: "BANCO", subtitle: "CAPITAL & CRÉDITO", position: [-4.5, 0, 4.3], height: 2.8, radius: 2.3, accent: "#d7d1c5" },
  { id: "ai", label: "CENTRO IA", subtitle: "ANÁLISIS & AUTOMATIZACIÓN", position: [4.2, 0, 4.2], height: 4.1, radius: 2.4, accent: "#cdd2db" },
];

function Tree({ position, scale = 1 }: { position: Vec3Tuple; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.1, 10]} />
        <meshStandardMaterial color="#4a4035" roughness={1} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.72, 18, 18]} />
        <meshStandardMaterial color="#596654" roughness={0.95} />
      </mesh>
    </group>
  );
}

function StreetLight({ position }: { position: Vec3Tuple }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 2.4, 10]} />
        <meshStandardMaterial color="#242424" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.45, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#fff4cf" emissive="#fff1bf" emissiveIntensity={1.8} />
      </mesh>
      <pointLight position={[0, 2.3, 0]} intensity={1.1} distance={5} color="#ffe9b8" />
    </group>
  );
}

function Building({ def, active }: { def: BuildingDef; active: boolean }) {
  const [x, , z] = def.position;
  const floors = Math.max(2, Math.floor(def.height / 0.95));

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, def.height, 3]} />
        <meshPhysicalMaterial
          color="#252525"
          roughness={0.5}
          metalness={0.25}
          clearcoat={0.35}
          emissive={active ? def.accent : "#000000"}
          emissiveIntensity={active ? 0.16 : 0}
        />
      </mesh>

      <mesh position={[0, def.height + 0.1, 0]} castShadow>
        <boxGeometry args={[3.15, 0.18, 3.15]} />
        <meshStandardMaterial color={def.accent} roughness={0.55} />
      </mesh>

      {Array.from({ length: floors }).map((_, floor) => (
        <group key={floor} position={[0, 0.68 + floor * 0.86, 0]}>
          <mesh position={[0, 0, 1.515]}>
            <boxGeometry args={[2.15, 0.34, 0.035]} />
            <meshStandardMaterial color="#d9d6cf" emissive="#d4cba9" emissiveIntensity={0.17} roughness={0.25} metalness={0.35} />
          </mesh>
          <mesh position={[1.515, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[2.15, 0.34, 0.035]} />
            <meshStandardMaterial color="#bfc5c6" emissive="#aeb7b8" emissiveIntensity={0.1} roughness={0.2} metalness={0.45} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[def.radius - 0.12, def.radius, 64]} />
        <meshBasicMaterial color={def.accent} transparent opacity={active ? 0.95 : 0.2} />
      </mesh>

      <Text position={[0, def.height + 0.72, 0]} fontSize={0.34} anchorX="center" anchorY="middle" color="#f4f1e9">
        {def.label}
      </Text>
      <Text position={[0, def.height + 0.38, 0]} fontSize={0.105} letterSpacing={0.06} anchorX="center" anchorY="middle" color="#a7a39b">
        {def.subtitle}
      </Text>
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

    const pads = navigator.getGamepads?.() ?? [];
    const pad = Array.from(pads).find(Boolean);
    if (pad) {
      const dead = 0.16;
      const ax = Math.abs(pad.axes[0] ?? 0) > dead ? pad.axes[0] : 0;
      const az = Math.abs(pad.axes[1] ?? 0) > dead ? pad.axes[1] : 0;
      x += ax;
      z += az;
      interact = interact || !!pad.buttons[0]?.pressed;
    }

    velocity.set(x, 0, z);
    if (velocity.lengthSq() > 1) velocity.normalize();

    const speed = 4.6;
    player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + velocity.x * speed * delta, -9, 9);
    player.current.position.z = THREE.MathUtils.clamp(player.current.position.z + velocity.z * speed * delta, -9, 9);

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

    desiredCamera.set(player.current.position.x + 7.6, 7.5, player.current.position.z + 9.8);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, delta));
    camera.lookAt(player.current.position.x, 0.9, player.current.position.z);
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      <mesh position={[0, 0.88, 0]} castShadow>
        <capsuleGeometry args={[0.38, 1.0, 8, 16]} />
        <meshStandardMaterial color="#111111" roughness={0.36} metalness={0.18} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#d8c1ad" roughness={0.62} />
      </mesh>
      <Text position={[0, 2.25, 0]} fontSize={0.22} color="#f4f1e9">EMPRENDEDOR</Text>
    </group>
  );
}

function City({ activeId, onNearby }: { activeId?: string; onNearby: (building: BuildingDef | null) => void }) {
  const trees: Vec3Tuple[] = [
    [-8, 0, -7], [-7.6, 0, 1.3], [-8.2, 0, 7.2], [-1.7, 0, 6.8], [0, 0, 7.5], [1.7, 0, 6.7],
    [8, 0, -6.5], [8.1, 0, 0.8], [8.3, 0, 7.1], [-1.7, 0, -8], [1.8, 0, -8]
  ];

  return (
    <>
      <color attach="background" args={["#bdb9af"]} />
      <fog attach="fog" args={["#bdb9af", 19, 34]} />
      <ambientLight intensity={1.15} />
      <hemisphereLight intensity={1.05} color="#efe8dc" groundColor="#6a6962" />
      <directionalLight position={[8, 13, 5]} intensity={2.15} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[42, 42]} />
        <meshStandardMaterial color="#9e9b92" roughness={1} />
      </mesh>

      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.2, 64]} />
        <meshStandardMaterial color="#c9c3b7" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.7, 4.0, 64]} />
        <meshStandardMaterial color="#ece7dc" roughness={0.75} />
      </mesh>

      <mesh position={[0, 0.04, -5.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.7, 12]} />
        <meshStandardMaterial color="#4a4a47" roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.045, 5.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.7, 12]} />
        <meshStandardMaterial color="#4a4a47" roughness={0.98} />
      </mesh>
      <mesh position={[-5.3, 0.04, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[3.7, 12]} />
        <meshStandardMaterial color="#4a4a47" roughness={0.98} />
      </mesh>
      <mesh position={[5.3, 0.04, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[3.7, 12]} />
        <meshStandardMaterial color="#4a4a47" roughness={0.98} />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <cylinderGeometry args={[1.15, 1.4, 0.55, 48]} />
          <meshStandardMaterial color="#d9d2c4" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.12, 48]} />
          <meshPhysicalMaterial color="#7d989d" roughness={0.22} metalness={0.05} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 1.18, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.12, 1.2, 16]} />
          <meshStandardMaterial color="#8b8377" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.2, 20, 20]} />
          <meshStandardMaterial color="#f4ead2" emissive="#f4dca6" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {BUILDINGS.map((def) => (
        <Building key={def.id} def={def} active={def.id === activeId} />
      ))}

      {trees.map((position, i) => <Tree key={i} position={position} scale={i % 3 === 0 ? 1.15 : 1} />)}

      <StreetLight position={[-2.8, 0, -2.5]} />
      <StreetLight position={[2.8, 0, -2.5]} />
      <StreetLight position={[-2.8, 0, 2.5]} />
      <StreetLight position={[2.8, 0, 2.5]} />

      <Player onNearby={onNearby} />
    </>
  );
}

export default function World() {
  const [nearby, setNearby] = useState<BuildingDef | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<BuildingDef>).detail;
      setMessage(`${detail.label} · interacción disponible`);
      window.setTimeout(() => setMessage(""), 1800);
    };
    window.addEventListener("game-interact", handle);
    return () => window.removeEventListener("game-interact", handle);
  }, []);

  return (
    <div className="gameViewport">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [7.6, 7.5, 9.8], fov: 46 }}>
        <City activeId={nearby?.id} onNearby={setNearby} />
        <Environment preset="city" />
      </Canvas>

      <div className="districtLabel">
        <span>DISTRITO EMPRENDEDOR</span>
        <strong>ASUNCIÓN · DÍA 01</strong>
      </div>

      {nearby && (
        <div className="interactionPrompt">
          <span className="interactionKey">E / A</span>
          <div>
            <small>INTERACTUAR CON</small>
            <strong>{nearby.label}</strong>
          </div>
        </div>
      )}

      {message && <div className="gameToast">{message}</div>}
    </div>
  );
}
