"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Text } from "@react-three/drei";

function Building({ position, label, height = 2.8 }: { position: [number, number, number]; label: string; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, height, 2.8]} />
        <meshStandardMaterial roughness={0.72} metalness={0.08} />
      </mesh>
      <Text position={[0, height + 0.45, 0]} fontSize={0.32} anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function City() {
  return (
    <>
      <ambientLight intensity={1.8} />
      <directionalLight position={[8, 12, 6]} intensity={2.5} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial roughness={1} />
      </mesh>
      <Building position={[-5, 0, -3]} label="SANTPIX / TECH LAB" height={4.2} />
      <Building position={[0, 0, -5]} label="MERCO / GROWTH" height={3.2} />
      <Building position={[5, 0, -2]} label="DROPI / COMMERCE HUB" height={4.8} />
      <Building position={[-4, 0, 4]} label="BANK" height={2.5} />
      <Building position={[3.5, 0, 4]} label="AI CENTER" height={3.7} />
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.7, 6, 12]} />
        <meshStandardMaterial roughness={0.55} />
      </mesh>
      <Text position={[0, 1.65, 0]} fontSize={0.28}>FOUNDER</Text>
      <gridHelper args={[40, 40]} position={[0, 0.02, 0]} />
    </>
  );
}

export default function World() {
  return (
    <Canvas shadows camera={{ position: [10, 11, 14], fov: 46 }}>
      <City />
      <OrbitControls enablePan enableDamping maxPolarAngle={Math.PI / 2.15} minDistance={8} maxDistance={26} />
      <Environment preset="city" />
    </Canvas>
  );
}