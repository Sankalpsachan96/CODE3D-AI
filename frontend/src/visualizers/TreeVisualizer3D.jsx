import React, { useMemo, useState } from 'react';
import { Text, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

/**
 * 3D Laser Branch connecting parent and child nodes
 */
function TreeBranch({ start, end, isActive }) {
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
    <group position={mid} quaternion={quat}>
      {/* Core laser cylinder */}
      <mesh>
        <cylinderGeometry args={[0.045, 0.045, length, 16]} />
        <meshStandardMaterial
          color={isActive ? '#38bdf8' : '#334155'}
          emissive={isActive ? '#0284c7' : '#0f172a'}
          emissiveIntensity={isActive ? 1.0 : 0.25}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {/* Outer glow aura when active */}
      {isActive && (
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, length, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.35}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Helper to build a BST structure if given a raw flat list of values or incomplete nodes
 */
function buildBstFromValues(values) {
  if (!values || values.length === 0) {
    values = [50, 30, 70, 20, 40, 60, 80];
  }

  const nodes = [];
  let nextId = 0;

  for (let i = 0; i < values.length; i++) {
    const val = typeof values[i] === 'object' ? (values[i].val ?? values[i].value ?? i) : values[i];
    if (i === 0) {
      nodes.push({ id: 0, val, left: null, right: null, parent: null, depth: 0 });
      nextId = 1;
      continue;
    }

    let curr = 0;
    while (curr !== null) {
      const parentNode = nodes[curr];
      if (val < parentNode.val) {
        if (parentNode.left === null) {
          const newId = nextId++;
          parentNode.left = newId;
          nodes.push({ id: newId, val, left: null, right: null, parent: curr, depth: parentNode.depth + 1 });
          break;
        } else {
          curr = parentNode.left;
        }
      } else {
        if (parentNode.right === null) {
          const newId = nextId++;
          parentNode.right = newId;
          nodes.push({ id: newId, val, left: null, right: null, parent: curr, depth: parentNode.depth + 1 });
          break;
        } else {
          curr = parentNode.right;
        }
      }
    }
  }

  return nodes;
}

/**
 * Premium 3D Tree & BST Visualizer with:
 * - Dynamic collision-free in-order hierarchical layout (zero node overlap)
 * - Exact parent-child laser connection branches
 * - Interactive hover inspection badges
 * - Glowing cybernetic spheres with readable value billboard
 * - Active beacon indicator for current step traversal
 */
export default function TreeVisualizer3D({ dataStructureState }) {
  const { isBright } = useTheme();
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const { activeIndex = null, nodes: rawNodes = [], values = [] } = dataStructureState || {};

  // Compute clean tree nodes with guaranteed parent-child pointers
  const treeNodes = useMemo(() => {
    if (rawNodes && rawNodes.length > 0) {
      // Ensure each node has left, right, parent, depth
      return rawNodes.map((n, i) => ({
        id: n.id ?? i,
        val: n.val ?? n.value ?? n.id ?? i,
        left: n.left ?? null,
        right: n.right ?? null,
        parent: n.parent ?? null,
        depth: n.depth ?? 0,
      }));
    }
    return buildBstFromValues(values);
  }, [rawNodes, values]);

  // Deterministic tidy layout: inorder gives stable horizontal ordering and
  // depth gives a strict horizontal level. This avoids modifier/contour drift
  // that could move nodes from the same level onto different Y coordinates.
  const layoutData = useMemo(() => {
    if (!treeNodes || treeNodes.length === 0) {
      return { positionedNodes: [], branches: [], levels: [], treeScale: 1.0, minX: -2, maxX: 2 };
    }

    const nodeMap = new Map(treeNodes.map((n) => [n.id, { ...n }]));
    let root = treeNodes.find((n) => n.parent === null || n.parent === undefined);
    if (!root) root = treeNodes[0];

    const levelHeight = 1.95;
    const nodeSpacing = 1.75;
    const xById = new Map();
    let inorderIndex = 0;

    const assignX = (id, depth = 0) => {
      const node = nodeMap.get(id);
      if (!node) return;
      node.depth = depth;
      if (node.left !== null && nodeMap.has(node.left)) assignX(node.left, depth + 1);
      xById.set(id, (inorderIndex++) * nodeSpacing);
      if (node.right !== null && nodeMap.has(node.right)) assignX(node.right, depth + 1);
    };

    assignX(root.id, 0);

    const rootX = xById.get(root.id) ?? 0;
    let minX = Infinity;
    let maxX = -Infinity;

    const positionedNodes = treeNodes.map((original) => {
      const node = nodeMap.get(original.id) || original;
      const x = (xById.get(node.id) ?? 0) - rootX;
      const y = -node.depth * levelHeight;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      return { ...original, depth: node.depth, pos: [x, y, 0] };
    });

    const posMap = new Map(positionedNodes.map((n) => [n.id, n.pos]));
    const branches = [];
    positionedNodes.forEach((node) => {
      if (node.parent !== null && node.parent !== undefined) {
        const parentPos = posMap.get(node.parent);
        if (parentPos) {
          branches.push({
            id: 'b-' + node.parent + '-' + node.id,
            parentId: node.parent,
            childId: node.id,
            start: parentPos,
            end: node.pos,
          });
        }
      }
    });

    const maxDepth = Math.max(...positionedNodes.map((n) => n.depth), 0);
    const levels = Array.from({ length: maxDepth + 1 }, (_, depth) => ({
      depth,
      y: -depth * levelHeight,
      label: depth === 0 ? 'Level 0 (Root)' : 'Level ' + depth,
    })).filter((level) => positionedNodes.some((n) => n.depth === level.depth));

    const treeWidth = Math.max(maxX - minX, 1);
    const treeScale = treeWidth > 11 ? Math.min(1, 11 / treeWidth) : 1;

    return { positionedNodes, branches, levels, minX, maxX, treeScale };
  }, [treeNodes]);
  const { positionedNodes, branches, levels, minX = -4, maxX = 4, treeScale = 1.0 } = layoutData;
  const hoveredNode = positionedNodes.find((n) => n.id === hoveredNodeId);

  const markerOffset = Math.min(minX - 1.2, -3.8);

  return (
    <group position={[0, 0, 0]} scale={[treeScale, treeScale, treeScale]}>
      {/* Symmetrically balanced Level Markers so <Center> stays perfectly centered on Root */}
      <group position={[markerOffset, 0, 0]}>
        {levels.map((lvl) => (
          <Billboard key={`lvl-${lvl.depth}`} position={[0, lvl.y, 0]}>
            <Text
              fontSize={0.24}
              color={isBright ? '#64748b' : '#475569'}
              fontWeight="bold"
              anchorX="right"
              anchorY="middle"
            >
              {lvl.label} ──
            </Text>
          </Billboard>
        ))}
      </group>
      {/* Invisible right balance anchor to keep Center root at X=0 */}
      <group position={[-markerOffset, 0, 0]}>
        {levels.map((lvl) => (
          <group key={`lvl-balance-${lvl.depth}`} position={[0, lvl.y, 0]} />
        ))}
      </group>

      {/* Laser Branches between Parent and Child */}
      {branches.map((b) => {
        const isActiveBranch = activeIndex === b.childId || activeIndex === b.parentId;
        return (
          <TreeBranch
            key={b.id}
            start={b.start}
            end={b.end}
            isActive={isActiveBranch}
          />
        );
      })}

      {/* 3D Glowing Spheres for Nodes */}
      {positionedNodes.map((node) => {
        const isActive = activeIndex === node.id;
        const isHovered = hoveredNodeId === node.id;
        const radius = isHovered ? 0.65 : 0.54;

        return (
          <group
            key={`tree-node-${node.id}`}
            position={node.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNodeId(node.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredNodeId(null);
            }}
          >
            {/* Sphere Mesh with cyber glowing material */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                color={isActive ? '#06b6d4' : isHovered ? '#f59e0b' : isBright ? '#e2e8f0' : '#1e293b'}
                emissive={isActive ? '#0891b2' : isHovered ? '#d97706' : isBright ? '#cbd5e1' : '#0f172a'}
                emissiveIntensity={isActive ? 1.0 : isHovered ? 0.6 : 0.2}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>

            {/* Outer wireframe halo ring */}
            <lineSegments>
              <edgesGeometry args={[new THREE.SphereGeometry(radius + 0.015, 16, 16)]} />
              <lineBasicMaterial
                color={isActive ? '#67e8f9' : isHovered ? '#fbbf24' : isBright ? '#94a3b8' : '#334155'}
              />
            </lineSegments>

            {/* Node Value Text Billboard (Always faces camera) */}
            <Billboard position={[0, 0, radius + 0.08]}>
              <Text
                fontSize={0.34}
                color={isActive ? '#082f49' : isBright ? '#0f172a' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {String(node.val)}
              </Text>
            </Billboard>

            {/* Depth tag badge under sphere */}
            <Billboard position={[0, -radius - 0.28, 0]}>
              <Text
                fontSize={0.18}
                color={isBright ? '#64748b' : '#94a3b8'}
                anchorX="center"
                anchorY="middle"
                fontFamily="monospace"
              >
                d:{node.depth}
              </Text>
            </Billboard>

            {/* Active Pointer Beacon for current step traversal */}
            {isActive && (
              <Float speed={5} rotationIntensity={0.2} floatIntensity={0.2}>
                <group position={[0, radius + 0.5, 0]}>
                  <mesh rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.18, 0.42, 16]} />
                    <meshStandardMaterial
                      color="#22d3ee"
                      emissive="#06b6d4"
                      emissiveIntensity={1.0}
                    />
                  </mesh>
                  <Billboard position={[0, 0.35, 0]}>
                    <Text
                      fontSize={0.22}
                      color="#38bdf8"
                      fontWeight="bold"
                      anchorX="center"
                      anchorY="middle"
                    >
                      ACTIVE
                    </Text>
                  </Billboard>
                </group>
              </Float>
            )}

            {/* Hover Floating HUD Badge */}
            {isHovered && (
              <Billboard position={[0, radius + 0.7, 0]}>
                <group>
                  <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[2.8, 0.8]} />
                    <meshBasicMaterial color="#090d16" transparent opacity={0.9} />
                  </mesh>
                  <Text position={[0, 0.2, 0]} fontSize={0.2} color="#38bdf8" fontWeight="bold">
                    Node: {node.val} (Level {node.depth})
                  </Text>
                  <Text position={[0, -0.15, 0]} fontSize={0.16} color="#94a3b8">
                    Parent: {node.parent !== null ? node.parent : 'Root'} | Left: {node.left !== null ? 'Yes' : 'None'} | Right: {node.right !== null ? 'Yes' : 'None'}
                  </Text>
                </group>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
}
