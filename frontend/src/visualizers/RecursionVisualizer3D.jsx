import React from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function RecursionVisualizer3D({ dataStructureState }) {
  const { callStack = [] } = dataStructureState || {};
  const spacingY = 1.35;

  return (
    <group position={[0, -1.5, 0]}>
      {/* Base Foundation Platform */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.2, 3.2]} />
        <meshStandardMaterial color="#090d16" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Vertical Guide Beams on Left and Right */}
      <mesh position={[-2.7, Math.max(callStack.length * spacingY, 4) / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, Math.max(callStack.length * spacingY, 4), 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[2.7, Math.max(callStack.length * spacingY, 4) / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, Math.max(callStack.length * spacingY, 4), 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* Empty Stack Indicator */}
      {callStack.length === 0 && (
        <group position={[0, 1.5, 0]}>
          <Text fontSize={0.34} color="#64748b" fontWeight="bold">
            [RECURSION CALL STACK EMPTY]
          </Text>
        </group>
      )}

      {/* 3D Call Stack Frames */}
      {callStack.map((frame, idx) => {
        const posY = idx * spacingY + 0.6;
        const isLatest = idx === callStack.length - 1;
        const isReturn = frame.state === 'RETURN' || frame.state === 'BASE_CASE' || frame.state === 'RECURSION_BASE';

        let color = '#1e293b';
        let emissive = '#0f172a';
        let wireColor = '#334155';

        if (isReturn) {
          color = '#047857';
          emissive = '#059669';
          wireColor = '#34d399';
        } else if (isLatest) {
          color = '#06b6d4';
          emissive = '#0891b2';
          wireColor = '#67e8f9';
        }

        return (
          <group key={`frame-${idx}`} position={[0, posY, 0]}>
            {/* 3D Frame Box */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[4.8, 1.05, 2.2]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={isLatest || isReturn ? 0.95 : 0.2}
                metalness={0.4}
                roughness={0.25}
              />
            </mesh>

            {/* Glowing Wireframe Border */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(4.82, 1.07, 2.22)]} />
              <lineBasicMaterial color={wireColor} linewidth={2} />
            </lineSegments>

            {/* Depth Badge on Left */}
            <Text
              position={[-1.85, 0, 1.15]}
              fontSize={0.24}
              color="#94a3b8"
              fontWeight="bold"
            >
              {`Depth ${idx + 1}`}
            </Text>

            {/* Function Call Signature */}
            <Text
              position={[0.2, 0, 1.15]}
              fontSize={0.36}
              color="#ffffff"
              fontWeight="bold"
            >
              {String(frame.func || `solve(${frame.n ?? idx})`)}
            </Text>

            {/* Frame State Tag on Right */}
            <group position={[1.8, 0, 1.15]}>
              <Text
                fontSize={0.22}
                color={isReturn ? '#34d399' : '#38bdf8'}
                fontWeight="bold"
              >
                {isReturn ? '✓ RETURN' : isLatest ? '▶ ACTIVE' : 'WAITING'}
              </Text>
            </group>

            {/* Active Pointer Beacon for latest frame */}
            {isLatest && (
              <Float speed={4} floatIntensity={0.2}>
                <group position={[2.8, 0, 0]}>
                  <Text fontSize={0.26} color="#22d3ee" fontWeight="bold">
                    ← STACK TOP
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
