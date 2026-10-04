import React, { useState } from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function StackVisualizer3D({ dataStructureState }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { values = [], pointers = {} } = dataStructureState || {};
  const spacingY = 1.35;
  const maxHeight = Math.max(values.length * spacingY + 1.5, 6);

  return (
    <group position={[0, -1.8, 0]}>
      {/* Sci-fi Base Container Plate */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.3, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Base Glowing Ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 2.1, 32]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Futuristic Stack Glass Guide Rails */}
      <mesh position={[-1.5, maxHeight / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, maxHeight, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[1.5, maxHeight / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, maxHeight, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* Transparent Glass Backing */}
      <mesh position={[0, maxHeight / 2, -1.1]}>
        <boxGeometry args={[2.9, maxHeight, 0.04]} />
        <meshStandardMaterial color="#0284c7" transparent opacity={0.12} roughness={0.1} />
      </mesh>

      {/* Stack Empty Message */}
      {values.length === 0 && (
        <group position={[0, 1.5, 0]}>
          <Text fontSize={0.35} color="#94a3b8" fontWeight="bold">
            [STACK EMPTY (Size: 0)]
          </Text>
        </group>
      )}

      {/* Stack Elements (LIFO: Bottom to Top) */}
      {values.map((val, idx) => {
        const posY = idx * spacingY + 0.7;
        const isTop = idx === values.length - 1;

        const isHovered = hoveredIdx === idx;
        const hoverScale = isHovered ? 1.25 : 1.0;

        return (
          <group
            key={`stack-${idx}`}
            position={[0, posY, 0]}
            scale={[hoverScale, hoverScale, hoverScale]}
          >
            {/* 3D Stack Element Box */}
            <mesh
              castShadow
              receiveShadow
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredIdx(idx);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredIdx(null);
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[2.5, 1.1, 1.8]} />
              <meshStandardMaterial
                color={isHovered ? '#0284c7' : isTop ? '#06b6d4' : '#1e293b'}
                emissive={isHovered ? '#38bdf8' : isTop ? '#0891b2' : '#0f172a'}
                emissiveIntensity={isHovered ? 1.8 : isTop ? 0.9 : 0.2}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Wireframe Border */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(2.51, 1.11, 1.81)]} />
              <lineBasicMaterial color={isHovered ? '#38bdf8' : isTop ? '#67e8f9' : '#334155'} />
            </lineSegments>

            {/* Interactive Mouse Hover 3D Inspection Tooltip */}
            {isHovered && (
              <Float speed={5} floatIntensity={0.15}>
                <group position={[0, 1.35, 0]}>
                  <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[2.8, 0.95]} />
                    <meshBasicMaterial color="#080e1e" transparent opacity={0.94} />
                  </mesh>
                  <lineSegments position={[0, 0, -0.01]}>
                    <edgesGeometry args={[new THREE.BoxGeometry(2.82, 0.97, 0.01)]} />
                    <lineBasicMaterial color="#38bdf8" />
                  </lineSegments>
                  <Text position={[0, 0.25, 0.05]} fontSize={0.21} color="#38bdf8" fontWeight="bold">
                    {`Stack Node [${idx}] = ${val}`}
                  </Text>
                  <Text position={[0, -0.02, 0.05]} fontSize={0.14} color="#94a3b8">
                    {`Size: 2.50 × 1.10 × 1.80`}
                  </Text>
                  <Text position={[0, -0.24, 0.05]} fontSize={0.12} color="#22c55e" fontStyle="italic">
                    {`⚡ Scaled 125% on Mouse Over`}
                  </Text>
                </group>
              </Float>
            )}

            {/* Element Value */}
            <Text
              position={[0, 0, 0.95]}
              fontSize={0.46}
              color="#ffffff"
              fontWeight="bold"
            >
              {String(val)}
            </Text>

            {/* Index label on side */}
            <Text
              position={[-1.75, 0, 0]}
              fontSize={0.24}
              color="#64748b"
              fontWeight="bold"
            >
              {`[${idx}]`}
            </Text>

            {/* TOP Indicator */}
            {isTop && (
              <Float speed={4} rotationIntensity={0.1} floatIntensity={0.2}>
                <group position={[2.0, 0, 0]}>
                  <Text fontSize={0.3} color="#22d3ee" fontWeight="bold">
                    ← TOP
                  </Text>
                </group>
              </Float>
            )}
          </group>
        );
      })}
    </group>
  );
}
