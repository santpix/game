"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];
type BuildingId = "santpix" | "merco" | "dropi" | "bank" | "ai";

type BuildingDef = {
  id: BuildingId;
  label: string;
  subtitle: string;
  position: Vec3;
  radius: number;
  accent: string;
};

const BUILDINGS: BuildingDef[] = [
  { id: "santpix", label: "SANTPIX", subtitle: "Tecnología & Ecommerce", position: [-6.2, 0, -3.8], radius: 2.8, accent: "#f0e9dc" },
  { id: "merco", label: "MERCO", subtitle: "Crecimiento & Performance", position: [0, 0, -6.6], radius: 2.7, accent: "#cdb786" },
  { id: "dropi", label: "DROPI", subtitle: "Comercio & Fulfillment", position: [6.2, 0, -3.1], radius: 2.9, accent: "#a7b9aa" },
  { id: "bank", label: "BANCO", subtitle: "Capital & Crédito", position: [-5.5, 0, 5.2], radius: 2.6, accent: "#d0c7b8" },
  { id: "ai", label: "CENTRO IA", subtitle: "Análisis & Automatización", position: [5.2, 0, 5.0], radius: 2.7, accent: "#aeb9ca" },
];

const C = {
  dark: "#141514",
  charcoal: "#1c1d1c",
  graphite: "#2b2c2a",
  stone: "#d5cec0",
  stone2: "#b9b1a3",
  glass: "#91a6a8",
  warmGlass: "#d1c4a4",
  road: "#343533",
  green: "#50604c",
  green2: "#66755e",
  brass: "#ad9665",
};

function Glass({ position, size, rotation = [0, 0, 0], warm = false }: { position: Vec3; size: Vec3; rotation?: Vec3; warm?: boolean }) {
  const color = warm ? C.warmGlass : C.glass;
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.12} metalness={0.35} roughness={0.12} clearcoat={0.5} />
    </mesh>
  );
}

function Planter({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[1.05, 0.36, 0.56]} />
        <meshStandardMaterial color="#978f82" roughness={0.9} />
      </mesh>
      {[-0.28, 0, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.54, 0]} castShadow>
          <icosahedronGeometry args={[0.24, 1]} />
          <meshStandardMaterial color={x === 0 ? C.green2 : C.green} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Bench({ position, rotationY = 0 }: { position: Vec3; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[1.35, 0.12, 0.42]} /><meshStandardMaterial color="#725d48" roughness={0.72} /></mesh>
      <mesh position={[0, 0.72, 0.18]} rotation={[-0.12, 0, 0]} castShadow><boxGeometry args={[1.35, 0.45, 0.1]} /><meshStandardMaterial color="#725d48" roughness={0.72} /></mesh>
      {[-0.48, 0.48].map((x) => <mesh key={x} position={[x, 0.2, 0]} castShadow><boxGeometry args={[0.08, 0.4, 0.34]} /><meshStandardMaterial color="#222" metalness={0.6} roughness={0.32} /></mesh>)}
    </group>
  );
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const crown = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (crown.current) crown.current.rotation.z = Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.018;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.12, 0.19, 1.45, 10]} /><meshStandardMaterial color="#4b3d32" roughness={1} /></mesh>
      <group ref={crown} position={[0, 1.75, 0]}>
        <mesh castShadow><icosahedronGeometry args={[0.72, 1]} /><meshStandardMaterial color={C.green} roughness={0.95} /></mesh>
        <mesh position={[0.43, 0.1, -0.08]} castShadow><icosahedronGeometry args={[0.5, 1]} /><meshStandardMaterial color={C.green2} roughness={0.95} /></mesh>
        <mesh position={[-0.34, 0.18, 0.12]} castShadow><icosahedronGeometry args={[0.47, 1]} /><meshStandardMaterial color="#5a6854" roughness={0.95} /></mesh>
      </group>
    </group>
  );
}

function StreetLight({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[0.035, 0.055, 2.5, 10]} /><meshStandardMaterial color="#191a19" metalness={0.75} roughness={0.3} /></mesh>
      <mesh position={[0, 2.55, 0]}><sphereGeometry args={[0.12, 14, 14]} /><meshStandardMaterial color="#fff1c9" emissive="#ffd889" emissiveIntensity={2.4} /></mesh>
      <pointLight position={[0, 2.45, 0]} intensity={0.55} distance={4.5} color="#ffdba0" />
    </group>
  );
}

function SantPixBuilding({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[-0.55, 2.8, 0]} castShadow receiveShadow><boxGeometry args={[2.7, 5.6, 2.8]} /><meshPhysicalMaterial color="#121312" roughness={0.24} metalness={0.42} clearcoat={0.55} emissive={active ? "#6e675c" : "#000"} emissiveIntensity={active ? 0.16 : 0} /></mesh>
      <mesh position={[1.05, 1.75, 0.2]} castShadow><boxGeometry args={[1.55, 3.5, 2.25]} /><meshStandardMaterial color="#272826" roughness={0.32} metalness={0.3} /></mesh>
      {[1.15, 2.1, 3.05, 4, 4.95].map((y) => <Glass key={y} position={[-0.55, y, 1.42]} size={[1.95, 0.44, 0.05]} />)}
      {[0.9, 1.75, 2.6].map((y) => <Glass key={y} position={[1.05, y, 1.34]} size={[1.0, 0.42, 0.05]} warm />)}
      <mesh position={[0.72, 1.62, 1.58]} castShadow><boxGeometry args={[1.55, 0.16, 1.05]} /><meshStandardMaterial color="#e8e0d2" metalness={0.2} roughness={0.45} /></mesh>
      {[-0.52, 0, 0.52].map((x) => <mesh key={x} position={[x + 0.72, 0.82, 1.48]}><boxGeometry args={[0.34, 1.25, 0.05]} /><meshStandardMaterial color="#9eaaaa" metalness={0.45} roughness={0.16} /></mesh>)}
      {[-0.9, -0.3, 0.3, 0.9].map((x) => <mesh key={x} position={[x - 0.55, 6.02, 0]} castShadow><boxGeometry args={[0.07, 0.76, 2.45]} /><meshStandardMaterial color="#e9e1d3" roughness={0.46} /></mesh>)}
      <Planter position={[1.55, 0, 1.55]} scale={0.8} />
    </group>
  );
}

function MercoBuilding({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.75, 0]} castShadow><boxGeometry args={[3.35, 3.5, 2.9]} /><meshStandardMaterial color="#1d1e1c" roughness={0.3} metalness={0.3} emissive={active ? "#6d5d35" : "#000"} emissiveIntensity={active ? 0.15 : 0} /></mesh>
      <mesh position={[0.45, 4.0, -0.15]} castShadow><boxGeometry args={[2.55, 1.8, 2.4]} /><meshStandardMaterial color="#2b2c29" roughness={0.34} metalness={0.24} /></mesh>
      {[0.62, 1.35, 2.08, 2.81, 3.58, 4.28].map((y) => <Glass key={y} position={[0, y, 1.47]} size={[2.62, 0.32, 0.05]} warm />)}
      {[-1.3, -0.78, -0.26, 0.26, 0.78, 1.3].map((x) => <mesh key={x} position={[x, 2.22, 1.53]} castShadow><boxGeometry args={[0.065, 4.35, 0.09]} /><meshStandardMaterial color="#cdb786" metalness={0.3} roughness={0.42} /></mesh>)}
      <mesh position={[0.65, 3.08, 1.03]} castShadow><boxGeometry args={[1.9, 0.16, 1.55]} /><meshStandardMaterial color="#85785f" roughness={0.72} /></mesh>
      <Planter position={[0.15, 3.2, 0.95]} scale={0.62} /><Planter position={[1.15, 3.2, 0.95]} scale={0.62} />
    </group>
  );
}

function DropiBuilding({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[-0.3, 1.38, 0.1]} castShadow><boxGeometry args={[4.35, 2.75, 3.3]} /><meshStandardMaterial color="#1f2421" roughness={0.43} metalness={0.2} emissive={active ? "#49604f" : "#000"} emissiveIntensity={active ? 0.16 : 0} /></mesh>
      <mesh position={[1.15, 3.72, -0.3]} castShadow><boxGeometry args={[1.9, 4.7, 2.15]} /><meshStandardMaterial color="#151916" roughness={0.32} metalness={0.3} /></mesh>
      {[2.25, 3.05, 3.85, 4.65, 5.45].map((y) => <Glass key={y} position={[1.15, y, 0.79]} size={[1.3, 0.34, 0.05]} />)}
      {[-1.55, -0.3, 0.95].map((x) => <group key={x} position={[x, 0, 1.78]}><mesh position={[0, 0.8, 0]}><boxGeometry args={[0.96, 1.4, 0.08]} /><meshStandardMaterial color="#b7beb9" metalness={0.35} roughness={0.28} /></mesh><mesh position={[0, 1.55, 0.28]} castShadow><boxGeometry args={[1.1, 0.12, 0.64]} /><meshStandardMaterial color="#a7b9aa" roughness={0.55} /></mesh></group>)}
      {[-1.5, -0.95, -0.4].map((x) => <mesh key={x} position={[x, 2.98, -0.1]} castShadow><cylinderGeometry args={[0.16, 0.19, 0.55, 12]} /><meshStandardMaterial color="#737a75" metalness={0.55} roughness={0.4} /></mesh>)}
    </group>
  );
}

function BankBuilding({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.55, -0.1]} castShadow><boxGeometry args={[3.5, 3.1, 2.75]} /><meshStandardMaterial color="#cfc7b8" roughness={0.7} emissive={active ? "#655f55" : "#000"} emissiveIntensity={active ? 0.12 : 0} /></mesh>
      <mesh position={[0, 3.25, 0]} castShadow><boxGeometry args={[3.75, 0.28, 3]} /><meshStandardMaterial color="#e2dbce" roughness={0.65} /></mesh>
      <mesh position={[0, 0.2, 1.7]} castShadow><boxGeometry args={[3.0, 0.4, 1.15]} /><meshStandardMaterial color="#b6ad9f" roughness={0.8} /></mesh>
      {[-1.2, -0.4, 0.4, 1.2].map((x) => <mesh key={x} position={[x, 1.55, 1.35]} castShadow><cylinderGeometry args={[0.16, 0.2, 2.55, 18]} /><meshStandardMaterial color="#ded7ca" roughness={0.68} /></mesh>)}
      <Glass position={[0, 1.35, 1.39]} size={[0.9, 1.6, 0.06]} warm />
    </group>
  );
}

function AIBuilding({ active }: { active: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.elapsedTime * 0.22;
  });
  return (
    <group>
      <mesh position={[0, 2.05, 0]} castShadow><cylinderGeometry args={[1.6, 1.9, 4.1, 32]} /><meshPhysicalMaterial color="#1a1c20" roughness={0.2} metalness={0.55} clearcoat={0.65} emissive={active ? "#536278" : "#000"} emissiveIntensity={active ? 0.18 : 0} /></mesh>
      {[0.8, 1.55, 2.3, 3.05].map((y) => <mesh key={y} position={[0, y, 0]}><torusGeometry args={[1.74, 0.055, 10, 48]} /><meshStandardMaterial color="#aeb9ca" emissive="#7185a3" emissiveIntensity={0.9} metalness={0.5} roughness={0.22} /></mesh>)}
      <mesh ref={ring} position={[0, 4.4, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.38, 0.08, 12, 64]} /><meshStandardMaterial color="#d9e2ef" emissive="#8599b8" emissiveIntensity={1.4} metalness={0.5} roughness={0.18} /></mesh>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <mesh key={i} position={[Math.sin(a) * 1.9, 2.15, Math.cos(a) * 1.9]} rotation={[0, a, 0]} castShadow><boxGeometry args={[0.08, 3.55, 0.22]} /><meshStandardMaterial color="#8b98aa" metalness={0.5} roughness={0.28} /></mesh>;
      })}
    </group>
  );
}

function Building({ def, active }: { def: BuildingDef; active: boolean }) {
  return (
    <group position={def.position}>
      {def.id === "santpix" && <SantPixBuilding active={active} />}
      {def.id === "merco" && <MercoBuilding active={active} />}
      {def.id === "dropi" && <DropiBuilding active={active} />}
      {def.id === "bank" && <BankBuilding active={active} />}
      {def.id === "ai" && <AIBuilding active={active} />}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[def.radius - 0.12, def.radius, 64]} /><meshBasicMaterial color={def.accent} transparent opacity={active ? 0.95 : 0.15} /></mesh>
    </group>
  );
}

function AnimatedFounder({ onNearby }: { onNearby: (b: BuildingDef | null) => void }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const { camera, gl } = useThree();
  const yaw = useRef(Math.PI * 0.12);
  const pitch = useRef(0.48);
  const distance = useRef(7.3);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastInteract = useRef(false);
  const walkPhase = useRef(0);
  const move = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const desiredCam = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault(); };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const mouseDown = (e: MouseEvent) => { if (e.button === 2 || e.button === 0) { dragging.current = true; lastPointer.current = { x: e.clientX, y: e.clientY }; canvas.style.cursor = "grabbing"; } };
    const mouseUp = () => { dragging.current = false; canvas.style.cursor = "grab"; };
    const mouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.006;
      pitch.current = THREE.MathUtils.clamp(pitch.current + dy * 0.004, 0.18, 1.08);
    };
    const wheel = (e: WheelEvent) => { e.preventDefault(); distance.current = THREE.MathUtils.clamp(distance.current + e.deltaY * 0.008, 3.8, 11.5); };
    const context = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    canvas.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("contextmenu", context);
    canvas.style.cursor = "grab";
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      canvas.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("contextmenu", context);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!root.current) return;
    let strafe = 0;
    let thrust = 0;
    let interact = !!keys.current.KeyE || !!keys.current.Space;
    const sprint = !!keys.current.ShiftLeft || !!keys.current.ShiftRight;

    if (keys.current.KeyW || keys.current.ArrowUp) thrust += 1;
    if (keys.current.KeyS || keys.current.ArrowDown) thrust -= 1;
    if (keys.current.KeyA || keys.current.ArrowLeft) strafe -= 1;
    if (keys.current.KeyD || keys.current.ArrowRight) strafe += 1;

    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      const pad = Array.from(navigator.getGamepads()).find(Boolean);
      if (pad) {
        const dead = 0.16;
        const lx = Math.abs(pad.axes[0] ?? 0) > dead ? pad.axes[0] : 0;
        const ly = Math.abs(pad.axes[1] ?? 0) > dead ? pad.axes[1] : 0;
        const rx = Math.abs(pad.axes[2] ?? 0) > dead ? pad.axes[2] : 0;
        const ry = Math.abs(pad.axes[3] ?? 0) > dead ? pad.axes[3] : 0;
        strafe += lx;
        thrust -= ly;
        yaw.current -= rx * delta * 2.1;
        pitch.current = THREE.MathUtils.clamp(pitch.current + ry * delta * 1.5, 0.18, 1.08);
        interact = interact || !!pad.buttons[0]?.pressed;
      }
    }

    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    move.copy(forward).multiplyScalar(thrust).addScaledVector(right, strafe);
    if (move.lengthSq() > 1) move.normalize();

    const speed = sprint ? 6.8 : 4.25;
    const moving = move.lengthSq() > 0.002;
    if (moving) {
      root.current.position.addScaledVector(move, speed * delta);
      root.current.position.x = THREE.MathUtils.clamp(root.current.position.x, -10.2, 10.2);
      root.current.position.z = THREE.MathUtils.clamp(root.current.position.z, -10.2, 10.2);
      const targetRot = Math.atan2(move.x, move.z);
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetRot, 1 - Math.pow(0.001, delta));
      walkPhase.current += delta * (sprint ? 12 : 8.5);
    }

    const phase = walkPhase.current;
    const amp = moving ? (sprint ? 0.78 : 0.58) : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, Math.sin(phase) * amp, 0.22);
    if (rightLeg.current) rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -Math.sin(phase) * amp, 0.22);
    if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -Math.sin(phase) * amp * 0.72, 0.22);
    if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, Math.sin(phase) * amp * 0.72, 0.22);
    if (body.current) body.current.position.y = THREE.MathUtils.lerp(body.current.position.y, moving ? Math.abs(Math.sin(phase * 2)) * 0.045 : Math.sin(performance.now() * 0.002) * 0.015, 0.16);

    let nearby: BuildingDef | null = null;
    let best = Infinity;
    for (const b of BUILDINGS) {
      const d = Math.hypot(root.current.position.x - b.position[0], root.current.position.z - b.position[2]);
      if (d < b.radius && d < best) { nearby = b; best = d; }
    }
    onNearby(nearby);
    if (interact && !lastInteract.current && nearby) window.dispatchEvent(new CustomEvent("game-interact", { detail: nearby }));
    lastInteract.current = interact;

    const horizontal = Math.cos(pitch.current) * distance.current;
    target.set(root.current.position.x, 1.35, root.current.position.z);
    desiredCam.set(
      target.x + Math.sin(yaw.current) * horizontal,
      target.y + Math.sin(pitch.current) * distance.current,
      target.z + Math.cos(yaw.current) * horizontal
    );
    camera.position.lerp(desiredCam, 1 - Math.pow(0.0007, delta));
    camera.lookAt(target);
  });

  return (
    <group ref={root} position={[0, 0, 1.4]}>
      <group ref={body}>
        <mesh position={[0, 1.42, 0]} castShadow><capsuleGeometry args={[0.38, 0.78, 8, 16]} /><meshStandardMaterial color="#111211" roughness={0.34} metalness={0.12} /></mesh>
        <mesh position={[0, 2.15, 0]} castShadow><sphereGeometry args={[0.29, 20, 20]} /><meshStandardMaterial color="#d0b49f" roughness={0.62} /></mesh>
        <mesh position={[0, 2.21, -0.08]} castShadow><sphereGeometry args={[0.295, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} /><meshStandardMaterial color="#24201d" roughness={0.72} /></mesh>
        <group ref={leftArm} position={[-0.48, 1.68, 0]}><mesh position={[0, -0.42, 0]} castShadow><capsuleGeometry args={[0.11, 0.62, 6, 10]} /><meshStandardMaterial color="#161716" roughness={0.42} /></mesh></group>
        <group ref={rightArm} position={[0.48, 1.68, 0]}><mesh position={[0, -0.42, 0]} castShadow><capsuleGeometry args={[0.11, 0.62, 6, 10]} /><meshStandardMaterial color="#161716" roughness={0.42} /></mesh></group>
        <group ref={leftLeg} position={[-0.2, 0.92, 0]}><mesh position={[0, -0.5, 0]} castShadow><capsuleGeometry args={[0.13, 0.75, 6, 10]} /><meshStandardMaterial color="#292b29" roughness={0.5} /></mesh><mesh position={[0, -0.98, 0.11]} castShadow><boxGeometry args={[0.26, 0.14, 0.48]} /><meshStandardMaterial color="#101010" roughness={0.55} /></mesh></group>
        <group ref={rightLeg} position={[0.2, 0.92, 0]}><mesh position={[0, -0.5, 0]} castShadow><capsuleGeometry args={[0.13, 0.75, 6, 10]} /><meshStandardMaterial color="#292b29" roughness={0.5} /></mesh><mesh position={[0, -0.98, 0.11]} castShadow><boxGeometry args={[0.26, 0.14, 0.48]} /><meshStandardMaterial color="#101010" roughness={0.55} /></mesh></group>
      </group>
    </group>
  );
}

function Fountain() {
  const water = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (water.current) water.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.3) * 0.012);
  });
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow><cylinderGeometry args={[1.18, 1.46, 0.62, 48]} /><meshStandardMaterial color="#d3ccbe" roughness={0.74} /></mesh>
      <mesh ref={water} position={[0, 0.65, 0]}><cylinderGeometry args={[0.9, 0.9, 0.11, 48]} /><meshPhysicalMaterial color="#6f8e97" roughness={0.12} metalness={0.05} transparent opacity={0.86} clearcoat={0.8} /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.08, 0.12, 1.15, 16]} /><meshStandardMaterial color="#81786d" metalness={0.5} roughness={0.36} /></mesh>
      <mesh position={[0, 1.9, 0]}><sphereGeometry args={[0.19, 18, 18]} /><meshStandardMaterial color="#fff0c8" emissive="#eecb81" emissiveIntensity={1.4} /></mesh>
    </group>
  );
}

function City({ activeId, onNearby }: { activeId?: string; onNearby: (b: BuildingDef | null) => void }) {
  const trees: Vec3[] = [[-9,-7,0] as unknown as Vec3];
  const treePositions: Vec3[] = [[-9,0,-8],[-9,0,0],[-9,0,8],[-2.4,0,8.8],[2.6,0,8.7],[9,0,-7.8],[9,0,0.5],[9,0,8],[-2.5,0,-9],[2.5,0,-9]];
  const lights: Vec3[] = [[-4,0,-1.7],[4,0,-1.7],[-4,0,1.8],[4,0,1.8],[-1.8,0,-4.1],[1.8,0,-4.1],[-1.8,0,4.2],[1.8,0,4.2]];
  void trees;
  return (
    <>
      <color attach="background" args={["#aaa79f"]} />
      <fog attach="fog" args={["#aaa79f", 17, 35]} />
      <ambientLight intensity={0.95} />
      <hemisphereLight intensity={1.25} color="#f6efe3" groundColor="#55564f" />
      <directionalLight position={[9, 15, 7]} intensity={2.65} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
      <directionalLight position={[-7, 8, -8]} intensity={0.7} color="#9fb6ca" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[46, 46]} /><meshStandardMaterial color="#8f8d86" roughness={1} /></mesh>
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[5.45, 64]} /><meshStandardMaterial color="#c7c0b3" roughness={0.92} /></mesh>
      <mesh position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.78, 4.05, 64]} /><meshStandardMaterial color="#eee7db" roughness={0.75} /></mesh>

      {[[0,-6.6,3.8,13.2,0],[0,6.6,3.8,13.2,0],[-6.6,0,3.8,13.2,Math.PI/2],[6.6,0,3.8,13.2,Math.PI/2]].map(([x,z,w,h,r],i)=><mesh key={i} position={[x,0.04,z]} rotation={[-Math.PI/2,0,r]} receiveShadow><planeGeometry args={[w,h]} /><meshStandardMaterial color={C.road} roughness={0.98} /></mesh>)}

      {[-1.1,0,1.1].map((x)=><mesh key={`crossN${x}`} position={[x,0.06,-4.9]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.55,1.35]} /><meshBasicMaterial color="#d8d5ce" transparent opacity={0.72} /></mesh>)}
      {[-1.1,0,1.1].map((x)=><mesh key={`crossS${x}`} position={[x,0.06,4.9]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[0.55,1.35]} /><meshBasicMaterial color="#d8d5ce" transparent opacity={0.72} /></mesh>)}

      <Fountain />
      {BUILDINGS.map((b)=><Building key={b.id} def={b} active={b.id===activeId} />)}
      {treePositions.map((p,i)=><Tree key={i} position={p} scale={i%3===0?1.15:1} />)}
      {lights.map((p,i)=><StreetLight key={i} position={p} />)}
      <Bench position={[-3.1,0,3.2]} rotationY={0.75} /><Bench position={[3.2,0,-3.1]} rotationY={-2.3} />
      <Planter position={[-3.2,0,-3.2]} /><Planter position={[3.3,0,3.1]} />
      <AnimatedFounder onNearby={onNearby} />
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
      <Canvas
        shadows
        dpr={[1, 1.65]}
        camera={{ position: [7, 6, 9], fov: 48, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <City activeId={nearby?.id} onNearby={setNearby} />
      </Canvas>

      <div className="districtLabel"><span>DISTRITO 01</span><strong>CENTRO EMPRENDEDOR</strong></div>
      <div className="cameraHint">MOUSE: ARRASTRAR CÁMARA · RUEDA: ZOOM · SHIFT: CORRER</div>

      {nearby && (
        <div className="interactionPrompt">
          <span className="interactionKey">E / A</span>
          <div><small>ENTRAR A</small><strong>{nearby.label}</strong><small>{nearby.subtitle}</small></div>
        </div>
      )}
      {message && <div className="gameToast">{message}</div>}
    </div>
  );
}
