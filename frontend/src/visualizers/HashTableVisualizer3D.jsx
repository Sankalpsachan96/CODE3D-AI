import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Key-Value Memory Block slotted inside a Hash Bucket
 */
function HashEntryBlock({ entryKey, entryValue, isMatched }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current && isMatched) {
      meshRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[0, 0.45, 0]}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.7, 1.2]} />
        <meshStandardMaterial
          color={isMatched ? '#10b981' : '#06b6d4'}
          emissive={isMatched ? '#059669' : '#0891b2'}
          emissiveIntensity={isMatched ? 0.95 : 0.4}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      {/* Glowing Wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.31, 0.71, 1.21)]} />
        <lineBasicMaterial color={isMatched ? '#6ee7b7' : '#67e8f9'} />
      </lineSegments>
      {/* Key -> Value Text */}
      <Text
        position={[0, 0, 0.65]}
        fontSize={0.26}
        color="#ffffff"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {`${entryKey} → [${entryValue}]`}
      </Text>
    </group>
  );
}

/**
 * Single 3D Hash Bucket (Slot)
 */
function HashBucketSlot({ slotIndex, entries = [], isTargetSlot }) {
  return (
    <group position={[(slotIndex - 3.5) * 1.8, -1.2, 0]}>
      {/* Pedestal Base */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.2, 24]} />
        <meshStandardMaterial
          color={isTargetSlot ? '#0284c7' : '#0f172a'}
          metalness={0.6}
          roughness={0.3}
          emissive={isTargetSlot ? '#0284c7' : '#000000'}
          emissiveIntensity={isTargetSlot ? 0.5 : 0}
        />
      </mesh>

      {/* Guide Rails */}
      <mesh position={[-0.65, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.65, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Slot Index Label */}
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.22}
        color="#64748b"
        fontWeight="bold"
      >
        {`Slot ${slotIndex}`}
      </Text>

      {/* Slotted Entries */}
      {entries.map((entry, idx) => (
        <group key={`entry-${slotIndex}-${idx}`} position={[0, idx * 0.8, 0]}>
          <HashEntryBlock
            entryKey={entry.key}
            entryValue={entry.value}
            isMatched={entry.isMatched}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Premium 3D Hash Table Visualizer for Two-Sum & Hashing Algorithms
 */
export default function HashTableVisualizer3D({ dataStructureState }) {
  const {
    values = [],
    hashTable = {},
    activeIndex = null,
    comparedIndices = [],
    target = null,
  } = dataStructureState || {};

  // Map entries into 8 fixed bucket slots using simple modulo hash
  const NUM_SLOTS = 8;
  const buckets = Array.from({ length: NUM_SLOTS }, () => []);

  Object.entries(hashTable).forEach(([k, v]) => {
    const numKey = parseInt(k, 10);
    const slot = isNaN(numKey)
      ? Math.abs(k.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % NUM_SLOTS
      : Math.abs(numKey) % NUM_SLOTS;

    const isMatched = comparedIndices && comparedIndices.includes(v);
    buckets[slot].push({ key: k, value: v, isMatched });
  });

  // Target slot if currently looking up
  const activeValue = activeIndex !== null && values[activeIndex] !== undefined ? values[activeIndex] : null;
  const complement = (target !== null && activeValue !== null) ? target - activeValue : null;
  const targetSlot = complement !== null ? Math.abs(complement) % NUM_SLOTS : null;

  return (
    <group position={[0, 0.5, 0]}>
      {/* Top Section: Original Input Array */}
      <group position={[0, 1.8, 0]}>
        <Text position={[0, 0.9, 0]} fontSize={0.26} color="#38bdf8" fontWeight="bold">
          {target !== null ? `INPUT ARRAY (Target Sum: ${target})` : 'INPUT STREAM'}
        </Text>

        {values.map((val, idx) => {
          const posX = (idx - (values.length - 1) / 2) * 1.6;
          const isActive = activeIndex === idx;
          const isMatched = comparedIndices && comparedIndices.includes(idx);

          return (
            <group key={`val-${idx}`} position={[posX, isActive ? 0.3 : 0, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.8, 1.0]} />
                <meshStandardMaterial
                  color={isMatched ? '#10b981' : isActive ? '#06b6d4' : '#1e293b'}
                  emissive={isMatched ? '#059669' : isActive ? '#0891b2' : '#0f172a'}
                  emissiveIntensity={isActive || isMatched ? 0.9 : 0.2}
                  metalness={0.4}
                  roughness={0.25}
                />
              </mesh>
              <Text position={[0, 0, 0.55]} fontSize={0.34} color="#ffffff" fontWeight="bold">
                {String(val)}
              </Text>
              <Text position={[0, -0.6, 0]} fontSize={0.2} color="#64748b">
                {`[${idx}]`}
              </Text>
              {isActive && (
                <Float speed={4} floatIntensity={0.2}>
                  <Text position={[0, 0.65, 0]} fontSize={0.22} color="#38bdf8" fontWeight="bold">
                    ▼ SCANNING
                  </Text>
                </Float>
              )}
            </group>
          );
        })}
      </group>

      {/* Middle Section: Scanning Laser Beam when looking up complement */}
      {targetSlot !== null && activeIndex !== null && (
        <group>
          <mesh position={[(targetSlot - 3.5) * 1.8, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 2.2, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[(targetSlot - 3.5) * 1.8, 0.3, 0.4]}
            fontSize={0.2}
            color="#67e8f9"
            fontWeight="bold"
          >
            {`hash(${complement}) → Slot ${targetSlot}`}
          </Text>
        </group>
      )}

      {/* Bottom Section: 3D Hash Table Buckets */}
      <group position={[0, -0.3, 0]}>
        <Text position={[0, 0.6, 0]} fontSize={0.26} color="#a855f7" fontWeight="bold">
          3D HASH TABLE (Key → Index Map)
        </Text>

        {buckets.map((entries, slotIdx) => (
          <HashBucketSlot
            key={`slot-${slotIdx}`}
            slotIndex={slotIdx}
            entries={entries}
            isTargetSlot={slotIdx === targetSlot}
          />
        ))}
      </group>
    </group>
  );
}
