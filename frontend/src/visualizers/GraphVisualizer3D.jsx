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
    nodes: stateNodes = [],
    activeIndex: stateActiveIndex = null,
    pointers = {},
    swappedIndices = [],
    visited = [],
    edges: stateEdges = [],
    traversal = 'BFS',
    queue = null,
    stack = null,
    currentVertex = null,
    current = null,
    node = null,
  } = dataStructureState || {};
  const activeIndex = stateActiveIndex ?? currentVertex ?? current ?? node;

  // A graph scene must be backed by actual topology in the trace.
  const sourceNodes = Array.isArray(stateNodes) && stateNodes.length
    ? stateNodes
    : (Array.isArray(values) && values.length
      ? values.map((value, id) => ({ id, value, val: value, label: String(value) }))
      : []);
  const vertexIds = sourceNodes.map((node, index) => node?.id ?? node?.value ?? node?.val ?? index);
  const idToIndex = new Map(vertexIds.map((id, index) => [String(id), index]));
  const numVertices = sourceNodes.length;
  const radius = Math.max(1.8, Math.min(3.2, numVertices * 0.48));

  const vertices = sourceNodes.map((node, i) => {
    const angle = (i / Math.max(numVertices, 1)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.75;
    const label = node?.label ?? node?.val ?? node?.value ?? node?.name ?? vertexIds[i];
    const distVal = node?.dist ?? (values[i] !== undefined ? values[i] : null);
    return { id: vertexIds[i], index: i, label: String(label), dist: distVal, pos: [x, y, 0] };
  });

  const resolveVertexIndex = (endpoint) => {
    const raw = endpoint && typeof endpoint === 'object'
      ? (endpoint.id ?? endpoint.value ?? endpoint.val ?? endpoint.label)
      : endpoint;
    if (idToIndex.has(String(raw))) return idToIndex.get(String(raw));
    const numeric = Number(raw);
    return Number.isInteger(numeric) && numeric >= 0 && numeric < numVertices ? numeric : -1;
  };
  const edgesToRender = Array.isArray(stateEdges) ? stateEdges : [];
  const edges = edgesToRender.map((edge) => {
    const from = Array.isArray(edge) ? edge[0] : (edge.from ?? edge.source ?? edge.u);
    const to = Array.isArray(edge) ? edge[1] : (edge.to ?? edge.target ?? edge.v);
    return { ...(!Array.isArray(edge) ? edge : {}), fromIndex: resolveVertexIndex(from), toIndex: resolveVertexIndex(to), weight: Array.isArray(edge) ? edge[2] : edge.weight };
  }).filter((edge) => edge.fromIndex >= 0 && edge.toIndex >= 0);

  return (
    <group position={[0, 0.2, 0]} userData={{ traversal }}>
      {/* 3D Connecting Edges */}
      {edges.map((e, idx) => {
        const v1 = vertices[e.fromIndex];
        const v2 = vertices[e.toIndex];
        const fromId = v1?.id;
        const toId = v2?.id;
        const isEdgeActive = String(activeIndex) === String(fromId) || String(activeIndex) === String(toId) || (visited.some((id) => String(id) === String(fromId)) && visited.some((id) => String(id) === String(toId)));
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
        const isActive = String(activeIndex) === String(v.id) || activeIndex === v.index;
        const isVisited = visited.some((id) => String(id) === String(v.id) || id === v.index) || (swappedIndices && swappedIndices.some((id) => String(id) === String(v.id) || id === v.index)) || (v.dist !== null && v.dist < 900);

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
