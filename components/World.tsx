"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Vec3Tuple = [number, number, number];

type BuildingDef = {
  id: string;
  label: string;
  position: Vec3Tuple;
  height: number;
  radius: number;
};

const BUILDINGS: BuildingDef[] = [
  { id: "santpix", label: "SANTPIX / TECH LAB", position: [-5, 0, -3], height: 4.2, radius: 2.5 },
  { id: "merco", label: "MERCO / GROWTH", position: [0, 0, -5], height: 3.2, radius: 2.4 },
  { id: "dropi", label: "DROPI / COMMERCE HUB", position: [5, 0, -2], height: 4.8, radius: 2.6 },
  { id: "bank", label: "BANK", position: [-4, 0, 4], height: 2.5, radius: 2.2 },
  { id: "ai", label: "AI CENTER", position: [3.5, 0, 4], height: 3.7, radius: 2.3 },
];

function Building({ def, active }: { def: BuildingDef; active: boolean }) {
  const [x, , z] = def.position;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, def.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, def.height, 2.8]} />
        <meshStandardMaterial roughness={0.72} metalness={0.08} emissive={active ? "#ffffff" : "#000000"} emissiveIntensity={active ? 0.12 : 0} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[def.radius - 0.12, def.radius, 64]} />
        <meshBasicMaterial transparent opacity={active ? 0.9 : 0.18} />
      </mesh>
      <Text position={[0, def.height + 0.45, 0]} fontSize={0.32} anchorX="center" anchorY="middle">
        {def.label}
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

    if (velocity.lengthSq() > 0.001) {
      player.current.rotation.y = Math.atan2(velocity.x, velocity.z);
    }

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

    desiredCamera.set(player.current.position.x + 7.5, 7.2, player.current.position.z + 9.5);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, delta));
    camera.lookAt(player.current.position.x, 0.8, player.current.position.z);
  });

  return (
    <group ref={player} position={[0, 0, 0]}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.9, 6, 12]} />
        <meshStandardMaterial roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.65, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial roughness={0.55} />
      </mesh>
      <Text position={[0, 2.15, 0]} fontSize={0.28}>FOUNDER</Text>
    </group>
  );
}

function City({ activeId, onNearby }: { activeId?: string; onNearby: (building: BuildingDef | null) => void }) {
  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[8, 12, 6]} intensity={2.4} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial roughness={1} />
      </mesh>
      {BUILDINGS.map((def) => (
        <Building key={def.id} def={def} active={def.id === activeId} />
      ))}
      <Player onNearby={onNearby} />
      <gridHelper args={[40, 40]} position={[0, 0.02, 0]} />
    </>
  );
}

export default function World() {
  const [nearby, setNearby] = useState<BuildingDef | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<BuildingDef>).detail;
      setMessage(`${detail.label} — interaction ready`);
      window.setTimeout(() => setMessage(""), 1800);
    };
    window.addEventListener("game-interact", handle);
    return () => window.removeEventListener("game-interact", handle);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas shadows camera={{ position: [7.5, 7.2, 9.5], fov: 48 }}>
        <City activeId={nearby?.id} onNearby={setNearby} />
        <Environment preset="city" />
      </Canvas>

      {nearby && (
        <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", background: "rgba(10,10,10,.88)", border: "1px solid rgba(255,255,255,.16)", padding: "10px 14px", fontSize: 12, letterSpacing: ".08em" }}>
          PRESS E / A TO ENTER · {nearby.label}
        </div>
      )}

      {message && (
        <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", background: "#f5f5f5", color: "#0a0a0a", padding: "10px 14px", fontSize: 12, fontWeight: 700 }}>
          {message}
        </div>
      )}
    </div>
  );
}
