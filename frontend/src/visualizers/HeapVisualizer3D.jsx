import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Laser Branch connecting parent and child heap nodes
 */
function HeapBranch({ start, end, isActive, isSwapping }) {
  if (!start || !end) return null;
  const p1 = new THREE.Vector3(...start);
  const p2 = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();
  if (length === 0) return null;
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.045, 0.045, length, 16]} />
      <meshStandardMaterial
        color={isSwapping ? '#fbbf24' : isActive ? '#00f2fe' : '#334155'}
        emissive={isSwapping ? '#f59e0b' : isActive ? '#0284c7' : '#0f172a'}
        emissiveIntensity={isSwapping ? 1.4 : isActive ? 0.9 : 0.25}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  );
}

/**
 * Rotating Holographic Status Ring around the active Heap node
 */
function ActiveHoloRing({ position, color = '#00f2fe' }) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.8;
      ringRef.current.rotation.x += delta * 0.9;
    }
  });

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.82, 0.035, 16, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.8}
          wireframe
        />
      </mesh>
    </group>
  );
}

/**
 * Dedicated AAA 3D Binary Heap / Priority Queue Visualizer
 * Shows the Complete Binary Tree in 3D space with dual 1D Array memory below.
 */
export default function HeapVisualizer3D({ dataStructureState }) {
  const {
    values = [10, 15, 20, 17, 25, 30, 40],
    activeIndex = null,
    parentIndex = null,
    comparedIndices = [],
    swappedIndices = [],
    heapType = 'Min-Heap',
    label,
    focusInfo
  } = dataStructureState || {};

  // Standard hierarchical positions for up to 7-15 heap nodes
  const treePositions = [
    [0, 2.5, 0],         // Node 0 (Root)
    [-2.6, 1.0, 0],      // Node 1 (Left)
    [2.6, 1.0, 0],       // Node 2 (Right)
    [-3.9, -0.6, 0],     // Node 3 (Left-Left)
    [-1.3, -0.6, 0],     // Node 4 (Left-Right)
    [1.3, -0.6, 0],      // Node 5 (Right-Left)
    [3.9, -0.6, 0],      // Node 6 (Right-Right)
  ];

  const parentMap = [null, 0, 0, 1, 1, 2, 2];

  const items = values.slice(0, Math.min(values.length, 7));

  return (
    <group position={[0, 0.2, 0]}>
      {/* Heap Level Guides */}
      <group position={[-5.2, 0, 0]}>
        <Text position={[0, 2.5, 0]} fontSize={0.22} color="#64748b" anchorX="right">
          Level 0 (Root)
        </Text>
        <Text position={[0, 1.0, 0]} fontSize={0.22} color="#64748b" anchorX="right">
          Level 1
        </Text>
        <Text position={[0, -0.6, 0]} fontSize={0.22} color="#64748b" anchorX="right">
          Level 2
        </Text>
        <Text position={[0, -2.5, 0]} fontSize={0.22} color="#38bdf8" anchorX="right">
          Array Memory
        </Text>
      </group>

      {/* Connecting Branches between Parent and Child in Heap Tree */}
      {items.map((_, idx) => {
        if (idx === 0) return null;
        const pIdx = parentMap[idx];
        if (pIdx === null || pIdx >= items.length) return null;

        const start = treePositions[pIdx];
        const end = treePositions[idx];
        const isActive = (activeIndex === idx && parentIndex === pIdx) ||
                         (comparedIndices.includes(idx) && comparedIndices.includes(pIdx));
        const isSwapping = swappedIndices.includes(idx) && swappedIndices.includes(pIdx);

        return (
          <HeapBranch
            key={`branch-${idx}`}
            start={start}
            end={end}
            isActive={isActive}
            isSwapping={isSwapping}
          />
        );
      })}

      {/* 3D Tree Nodes */}
      {items.map((val, idx) => {
        const pos = treePositions[idx];
        const isActive = activeIndex === idx;
        const isParent = parentIndex === idx;
        const isCompared = comparedIndices.includes(idx);
        const isSwapped = swappedIndices.includes(idx);

        let nodeColor = '#0284c7';
        let emissiveColor = '#0369a1';
        let emissiveIntensity = 0.3;

        if (isSwapped) {
          nodeColor = '#fbbf24';
          emissiveColor = '#d97706';
          emissiveIntensity = 1.6;
        } else if (isActive) {
          nodeColor = '#00f2fe';
          emissiveColor = '#00f2fe';
          emissiveIntensity = 1.3;
        } else if (isParent) {
          nodeColor = '#a855f7';
          emissiveColor = '#9333ea';
          emissiveIntensity = 0.9;
        } else if (isCompared) {
          nodeColor = '#f43f5e';
          emissiveColor = '#e11d48';
          emissiveIntensity = 0.9;
        }

        return (
          <group key={`node-${idx}`} position={pos}>
            <Float speed={isActive ? 2.5 : 1} rotationIntensity={0.05} floatIntensity={0.08}>
              {/* Node Orb */}
              <mesh>
                <sphereGeometry args={[0.52, 32, 32]} />
                <meshStandardMaterial
                  color={nodeColor}
                  emissive={emissiveColor}
                  emissiveIntensity={emissiveIntensity}
                  roughness={0.15}
                  metalness={0.7}
                />
              </mesh>

              {/* Wireframe outer shell for premium cyber glow */}
              <mesh>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshStandardMaterial
                  color={nodeColor}
                  wireframe
                  transparent
                  opacity={isActive || isSwapped ? 0.6 : 0.2}
                />
              </mesh>

              {/* Holographic Ring if Active */}
              {(isActive || isSwapped) && (
                <ActiveHoloRing position={[0, 0, 0]} color={isSwapped ? '#fbbf24' : '#00f2fe'} />
              )}

              {/* Node Value */}
              <Text
                position={[0, 0, 0.58]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jO.woff"
                fontWeight="bold"
              >
                {val}
              </Text>

              {/* Node Index & Role Label */}
              <Text
                position={[0, 0.72, 0]}
                fontSize={0.17}
                color={isActive ? '#00f2fe' : isParent ? '#c084fc' : '#94a3b8'}
                anchorX="center"
                anchorY="bottom"
              >
                {`[${idx}]${idx === 0 ? ' (ROOT)' : ''}${isParent ? ' PARENT' : ''}`}
              </Text>
            </Float>
          </group>
        );
      })}

      {/* Dual Representation: 1D Heap Array Storage at Bottom */}
      <group position={[0, -2.5, 0]}>
        {/* Rack Rail Base */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[items.length * 1.35 + 0.5, 0.08, 0.6]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {items.map((val, idx) => {
          const xPos = (idx - (items.length - 1) / 2) * 1.35;
          const isActive = activeIndex === idx;
          const isParent = parentIndex === idx;
          const isSwapped = swappedIndices.includes(idx);

          return (
            <group key={`array-slot-${idx}`} position={[xPos, 0, 0]}>
              {/* Array Cube */}
              <mesh>
                <boxGeometry args={[1.05, 0.65, 0.5]} />
                <meshStandardMaterial
                  color={isSwapped ? '#f59e0b' : isActive ? '#00f2fe' : isParent ? '#9333ea' : '#0f172a'}
                  emissive={isSwapped ? '#d97706' : isActive ? '#0284c7' : isParent ? '#6b21a8' : '#0284c7'}
                  emissiveIntensity={isActive || isSwapped ? 1.0 : isParent ? 0.6 : 0.15}
                  metalness={0.7}
                  roughness={0.2}
                />
              </mesh>

              {/* Value inside Array Slot */}
              <Text
                position={[0, 0, 0.28]}
                fontSize={0.25}
                color={isActive ? '#070b14' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {val}
              </Text>

              {/* Slot Index */}
              <Text
                position={[0, -0.48, 0]}
                fontSize={0.16}
                color={isActive ? '#00f2fe' : '#64748b'}
                anchorX="center"
              >
                {`arr[${idx}]`}
              </Text>

              {/* Subtle Laser Ray shooting up from Array slot towards Tree node */}
              {isActive && (
                <mesh position={[0, 0.8, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
                  <meshStandardMaterial
                    color="#00f2fe"
                    emissive="#00f2fe"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* Heap Property Invariant HUD Badge */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.05} position={[0, 3.5, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[4.2, 0.5]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.15} />
          </mesh>
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.2}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {label || `Binary ${heapType}: parent <= children`}
          </Text>
        </group>
      </Float>
    </group>
  );
}
