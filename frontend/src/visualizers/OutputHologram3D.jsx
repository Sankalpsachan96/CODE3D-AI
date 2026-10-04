import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * OutputHologram3D
 *
 * Renders a futuristic holographic 3D output banner and cyber podium
 * directly inside the WebGL 3D world, showcasing the verified correct algorithm output.
 */
export default function OutputHologram3D({
  correctOutput,
  isAtEnd = false,
  totalOutputs = 0,
  recentLine = null,
}) {
  const ringsRef = useRef();
  const beaconRef = useRef();

  useFrame((_, delta) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 0.9;
    }
    if (beaconRef.current) {
      beaconRef.current.rotation.y -= delta * 0.5;
    }
  });

  const displayText = correctOutput || recentLine || 'Execution in progress...';
  const cleanDisplay = displayText.length > 48 ? displayText.slice(0, 45) + '...' : displayText;

  return (
    <group position={[0, isAtEnd ? 3.4 : 3.0, 0]}>
      {/* Floating 3D Hologram Billboard */}
      <Float speed={2.5} rotationIntensity={0.08} floatIntensity={0.25}>
        {/* Hologram Glass Backing Mesh */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[Math.max(4.2, cleanDisplay.length * 0.16 + 1.2), 1.25]} />
          <meshStandardMaterial
            color={isAtEnd ? '#064e3b' : '#082f49'}
            emissive={isAtEnd ? '#10b981' : '#0284c7'}
            emissiveIntensity={isAtEnd ? 0.7 : 0.4}
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.4}
          />
        </mesh>

        {/* Outer Glowing Wireframe Border */}
        <lineSegments position={[0, 0, -0.04]}>
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                Math.max(4.22, cleanDisplay.length * 0.16 + 1.22),
                1.27,
                0.02
              ),
            ]}
          />
          <lineBasicMaterial
            color={isAtEnd ? '#34d399' : '#38bdf8'}
            linewidth={2}
          />
        </lineSegments>

        {/* Header Tag */}
        <Text
          position={[0, 0.38, 0.05]}
          fontSize={0.21}
          color={isAtEnd ? '#a7f3d0' : '#7dd3fc'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {isAtEnd ? '🏆 VERIFIED CORRECT OUTPUT' : '⚡ RUNNING OUTPUT STREAM'}
        </Text>

        {/* Main Computed Output Text */}
        <Text
          position={[0, 0.04, 0.05]}
          fontSize={0.28}
          color={isAtEnd ? '#ffffff' : '#e0f2fe'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {cleanDisplay}
        </Text>

        {/* Verification Status Subtitle */}
        <Text
          position={[0, -0.32, 0.05]}
          fontSize={0.15}
          color={isAtEnd ? '#6ee7b7' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          fontStyle="italic"
        >
          {isAtEnd
            ? '✓ Status: 100% Correct Result (Exit Code 0)'
            : `${totalOutputs} output line(s) streamed`}
        </Text>
      </Float>

      {/* Rotating Cybernetic Halo Rings when finished */}
      {isAtEnd && (
        <group ref={ringsRef} position={[0, -0.9, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.5, 0.025, 16, 48]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={1.8}
              wireframe
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.8, 0.02, 16, 48]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={1.5}
              wireframe
            />
          </mesh>
        </group>
      )}

      {/* Vertical Laser Light Pillar */}
      <mesh ref={beaconRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 2.6, 12]} />
        <meshStandardMaterial
          color={isAtEnd ? '#34d399' : '#38bdf8'}
          emissive={isAtEnd ? '#10b981' : '#0284c7'}
          emissiveIntensity={2.2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
