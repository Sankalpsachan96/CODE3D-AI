import React from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function GraphEdge({ start, end, isActive, weight }) {
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
    <group>
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.045, 0.045, length, 12]} />
        <meshStandardMaterial
          color={isActive ? '#10b981' : '#334155'}
          emissive={isActive ? '#059669' : '#1e293b'}
          emissiveIntensity={isActive ? 0.9 : 0.2}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>
      {weight !== undefined && weight !== null && (
        <Text
          position={[mid.x, mid.y + 0.25, mid.z + 0.1]}
          fontSize={0.24}
          color="#facc15"
          fontWeight="bold"
        >
          {String(weight)}
        </Text>
      )}
    </group>
  );
}

/**
 * Premium 3D Graph Visualizer for BFS, DFS, and Dijkstra's Algorithm
 */
export default function GraphVisualizer3D({ dataStructureState }) {
  const {
    values = [],
    nodes = [],
    activeIndex = null,
    pointers = {},
    swappedIndices = [],
  } = dataStructureState || {};

  // Standard graph topology (5 vertices: 0, 1, 2, 3, 4)
  const numVertices = Math.max(5, nodes.length || values.length || 5);
  const radius = 3.2;

  const vertices = Array.from({ length: numVertices }).map((_, i) => {
    const angle = (i / numVertices) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.75;
    const label = nodes[i]?.val ?? nodes[i]?.name ?? `V${i}`;
    const distVal = values[i] !== undefined ? values[i] : null;

    return {
      id: i,
      label: String(label),
      dist: distVal,
      pos: [x, y, 0],
    };
  });

  // Default graph edges: 0-1, 0-2, 1-3, 2-4, 1-2
  const edges = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 5 },
    { from: 2, to: 4, weight: 8 },
    { from: 3, to: 4, weight: 2 },
  ].filter(e => e.from < numVertices && e.to < numVertices);

  return (
    <group position={[0, 0.2, 0]}>
      {/* 3D Connecting Edges */}
      {edges.map((e, idx) => {
        const v1 = vertices[e.from];
        const v2 = vertices[e.to];
        const isEdgeActive = activeIndex === e.from || activeIndex === e.to;
        return (
          <GraphEdge
            key={`edge-${idx}`}
            start={v1.pos}
            end={v2.pos}
            isActive={isEdgeActive}
            weight={e.weight}
          />
        );
      })}

      {/* 3D Graph Nodes */}
      {vertices.map((v) => {
        const isActive = activeIndex === v.id;
        const isVisited = (swappedIndices && swappedIndices.includes(v.id)) || (v.dist !== null && v.dist < 900);

        let color = '#1e293b';
        let emissive = '#0f172a';

        if (isActive) {
          color = '#06b6d4';
          emissive = '#0891b2';
        } else if (isVisited) {
          color = '#10b981';
          emissive = '#059669';
        }

        return (
          <group key={`vertex-${v.id}`} position={v.pos}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.62, 32, 32]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={isActive ? 0.95 : isVisited ? 0.6 : 0.2}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing border ring */}
            <lineSegments>
              <edgesGeometry args={[new THREE.SphereGeometry(0.63, 16, 16)]} />
              <lineBasicMaterial color={isActive ? '#67e8f9' : isVisited ? '#34d399' : '#334155'} />
            </lineSegments>

            {/* Vertex Name */}
            <Text position={[0, 0, 0.7]} fontSize={0.34} color="#ffffff" fontWeight="bold">
              {v.label}
            </Text>

            {/* Dijkstra Distance / Cost Tag */}
            {v.dist !== null && (
              <group position={[0, -0.9, 0]}>
                <Text fontSize={0.24} color="#facc15" fontWeight="bold">
                  {v.dist >= 900 ? 'dist: ∞' : `dist: ${v.dist}`}
                </Text>
              </group>
            )}

            {/* Active Visiting Beacon */}
            {isActive && (
              <Float speed={5} rotationIntensity={0.2} floatIntensity={0.2}>
                <group position={[0, 1.0, 0]}>
                  <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.18, 0.4, 16]} />
                    <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.9} />
                  </mesh>
                  <Text position={[0, 0.35, 0]} fontSize={0.22} color="#38bdf8" fontWeight="bold">
                    VISITING
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
