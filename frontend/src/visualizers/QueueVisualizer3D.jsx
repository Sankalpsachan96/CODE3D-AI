import React from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function QueueVisualizer3D({ dataStructureState }) {
  const { values = [] } = dataStructureState || {};
  const spacingX = 2.4;
  const count = Math.max(values.length, 1);
  const totalWidth = Math.max(count * spacingX + 2.5, 9);
  const startX = -((values.length - 1) * spacingX) / 2;

  return (
    <group position={[0, 0.5, 0]}>
      {/* Sci-fi Conveyor Base Track */}
      <mesh position={[0, -0.75, 0]} receiveShadow>
        <boxGeometry args={[totalWidth, 0.16, 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Neon Edge Guide Rails */}
      <mesh position={[0, -0.65, 1.2]}>
        <boxGeometry args={[totalWidth, 0.06, 0.06]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[0, -0.65, -1.2]}>
        <boxGeometry args={[totalWidth, 0.06, 0.06]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* FIFO Direction Arrow in center of conveyor */}
      <group position={[0, -0.62, 0]}>
        <Text fontSize={0.28} color="#0284c7" fontWeight="bold">
          FIFO FLOW: [REAR / ENTRY]  ➔ ➔ ➔  [FRONT / EXIT]
        </Text>
      </group>

      {/* Empty Queue State */}
      {values.length === 0 && (
        <group position={[0, 0.5, 0]}>
          <Text fontSize={0.38} color="#94a3b8" fontWeight="bold">
            [QUEUE EMPTY]
          </Text>
        </group>
      )}

      {/* Queue Items */}
      {values.map((val, idx) => {
        const posX = startX + idx * spacingX;
        const isFront = idx === 0;
        const isRear = idx === values.length - 1;

        let boxColor = '#1e293b';
        let emissiveColor = '#0f172a';
        if (isFront) {
          boxColor = '#10b981';
          emissiveColor = '#047857';
        } else if (isRear) {
          boxColor = '#3b82f6';
          emissiveColor = '#1d4ed8';
        }

        return (
          <group key={`q-${idx}`} position={[posX, 0, 0]}>
            {/* 3D Box */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.8, 1.25, 1.5]} />
              <meshStandardMaterial
                color={boxColor}
                emissive={emissiveColor}
                emissiveIntensity={isFront || isRear ? 0.85 : 0.2}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Wireframe Border */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(1.81, 1.26, 1.51)]} />
              <lineBasicMaterial color={isFront ? '#34d399' : isRear ? '#60a5fa' : '#334155'} />
            </lineSegments>

            {/* Element Value */}
            <Text position={[0, 0, 0.8]} fontSize={0.45} color="#ffffff" fontWeight="bold">
              {String(val)}
            </Text>

            {/* FRONT Pointer Banner */}
            {isFront && (
              <Float speed={5} rotationIntensity={0.1} floatIntensity={0.2}>
                <group position={[0, 1.35, 0]}>
                  <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.16, 0.32, 12]} />
                    <meshStandardMaterial color="#34d399" emissive="#10b981" />
                  </mesh>
                  <Text fontSize={0.25} color="#34d399" fontWeight="bold">
                    FRONT (Dequeue / Exit)
                  </Text>
                </group>
              </Float>
            )}

            {/* REAR Pointer Banner */}
            {isRear && (
              <Float speed={5} rotationIntensity={0.1} floatIntensity={0.2}>
                <group position={[0, -1.35, 0]}>
                  <mesh position={[0, 0.3, 0]}>
                    <coneGeometry args={[0.16, 0.32, 12]} />
                    <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" />
                  </mesh>
                  <Text fontSize={0.25} color="#60a5fa" fontWeight="bold">
                    REAR (Enqueue / Entry)
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
