import React from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function LinkedListVisualizer3D({ dataStructureState }) {
  const {
    nodes: rawNodes = [],
    values: rawVals = [],
    activeIndex = null,
    pointers = {},
    type = '',
  } = dataStructureState || {};

  const isDoubly = type.includes('doubly') || pointers?.PREV !== undefined;
  const isCircular = type.includes('circular') || dataStructureState?.label?.toLowerCase().includes('circular');

  const sourceList = (rawNodes && rawNodes.length > 0)
    ? rawNodes
    : (rawVals && rawVals.length > 0)
      ? rawVals
      : [10, 20, 30, 40];

  const resolvedNodes = sourceList.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id ?? idx,
        val: item.value ?? item.val ?? item.id ?? idx,
      };
    }
    return { id: idx, val: item };
  });

  const spacing = 3.4;
  const startX = -((resolvedNodes.length - 1) * spacing) / 2;

  // Track pointers like slow / fast / head / curr
  const slowIdx = pointers?.SLOW !== undefined ? Number(pointers.SLOW) : null;
  const fastIdx = pointers?.FAST !== undefined ? Number(pointers.FAST) : null;
  const currIdx = pointers?.CURR !== undefined ? Number(pointers.CURR) : activeIndex;

  return (
    <group position={[0, 0.7, 0]}>
      {/* Nodes and Forward/Backward Pointers */}
      {resolvedNodes.map((node, idx) => {
        const posX = startX + idx * spacing;
        const isCurrent = currIdx === idx;
        const isSlow = slowIdx === idx;
        const isFast = fastIdx === idx;
        const isActive = isCurrent || isSlow || isFast;

        let nodeColor = '#1e293b';
        let emissiveColor = '#0f172a';
        if (isCurrent) {
          nodeColor = '#06b6d4';
          emissiveColor = '#0891b2';
        } else if (isSlow && isFast) {
          nodeColor = '#f59e0b';
          emissiveColor = '#d97706';
        } else if (isSlow) {
          nodeColor = '#10b981';
          emissiveColor = '#059669';
        } else if (isFast) {
          nodeColor = '#8b5cf6';
          emissiveColor = '#6d28d9';
        }

        return (
          <group key={`node-${idx}`} position={[posX, isActive ? 0.45 : 0, 0]}>
            {/* 3D Node Mesh */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.9, 1.25, 1.25]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={emissiveColor}
                emissiveIntensity={isActive ? 0.85 : 0.2}
                metalness={0.4}
                roughness={0.25}
              />
            </mesh>

            {/* Glowing Wireframe Border */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(1.91, 1.26, 1.26)]} />
              <lineBasicMaterial color={isActive ? '#67e8f9' : '#334155'} />
            </lineSegments>

            {/* Value Label */}
            <Text
              position={[-0.32, 0, 0.65]}
              fontSize={0.44}
              color="#ffffff"
              fontWeight="bold"
            >
              {String(node.val)}
            </Text>

            {/* Pointer section divider inside node */}
            <mesh position={[0.28, 0, 0]}>
              <boxGeometry args={[0.04, 1.2, 1.2]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
            <Text
              position={[0.55, 0, 0.65]}
              fontSize={0.22}
              color="#38bdf8"
              fontWeight="bold"
            >
              next
            </Text>

            {/* Next Pointer Arrow connecting to next node */}
            {idx < resolvedNodes.length - 1 && (
              <group position={[0.95, 0, 0]}>
                <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <cylinderGeometry args={[0.05, 0.05, 1.5]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                  <coneGeometry args={[0.16, 0.38, 16]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
                </mesh>
              </group>
            )}

            {/* Doubly Linked List Prev Pointer Arrow */}
            {isDoubly && idx > 0 && (
              <group position={[-0.95, -0.4, 0]}>
                <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.5]} />
                  <meshStandardMaterial color="#ec4899" emissive="#be185d" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <coneGeometry args={[0.14, 0.35, 16]} />
                  <meshStandardMaterial color="#ec4899" emissive="#be185d" emissiveIntensity={0.9} />
                </mesh>
              </group>
            )}

            {/* Null terminator for singly/doubly list when not circular */}
            {!isCircular && idx === resolvedNodes.length - 1 && (
              <group position={[1.4, 0, 0]}>
                <Text position={[0.5, 0, 0]} fontSize={0.3} color="#ef4444" fontWeight="bold">
                  NULL
                </Text>
              </group>
            )}

            {/* Floating Pointer Badges */}
            {isActive && (
              <Float speed={5} rotationIntensity={0.1} floatIntensity={0.25}>
                <group position={[0, 1.25, 0]}>
                  <Text fontSize={0.26} color="#38bdf8" fontWeight="bold">
                    {isSlow && isFast
                      ? 'COLLISION (Cycle!)'
                      : isSlow
                      ? '🐢 SLOW'
                      : isFast
                      ? '🐇 FAST'
                      : 'CURR'}
                  </Text>
                  <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.16, 0.32, 12]} />
                    <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" />
                  </mesh>
                </group>
              </Float>
            )}
          </group>
        );
      })}

      {/* Circular Linked List Return Arc (Tail -> Head) */}
      {isCircular && resolvedNodes.length > 1 && (
        <group position={[0, -1.3, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[resolvedNodes.length * spacing - 1.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.9} />
          </mesh>
          <Text position={[0, -0.3, 0]} fontSize={0.24} color="#38bdf8" fontWeight="bold">
            ↺ Circular Link: Tail.next → HEAD
          </Text>
        </group>
      )}
    </group>
  );
}
