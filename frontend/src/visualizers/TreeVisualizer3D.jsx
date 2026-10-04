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

  // Compute collision-free layout using Reingold-Tilford / Tidy Tree algorithm
  const layoutData = useMemo(() => {
    if (!treeNodes || treeNodes.length === 0) {
      return { positionedNodes: [], branches: [], levels: [], treeScale: 1.0, minX: -2 };
    }

    const nodeMap = new Map();
    treeNodes.forEach((n) => nodeMap.set(n.id, { ...n, x: 0, y: 0, mod: 0 }));

    // Find root (node with no parent or parent === null)
    let root = treeNodes.find((n) => n.parent === null || n.parent === undefined);
    if (!root) root = treeNodes[0];
    const rootNode = nodeMap.get(root.id);

    const totalN = Math.max(treeNodes.length, 1);
    // Dynamic horizontal spacing: contracts gracefully for wide trees
    const siblingDistance = Math.max(1.8, Math.min(2.4, 16.0 / totalN));
    const levelHeight = 1.95;

    // Pass 1: Post-order traversal to calculate initial X and modifiers
    function firstPass(nodeId, depth = 0, leftSiblingId = null) {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      node.depth = depth;
      node.y = -depth * levelHeight;

      const leftId = node.left;
      const rightId = node.right;
      const hasLeft = leftId !== null && nodeMap.has(leftId);
      const hasRight = rightId !== null && nodeMap.has(rightId);

      if (hasLeft) firstPass(leftId, depth + 1, null);
      if (hasRight) firstPass(rightId, depth + 1, hasLeft ? leftId : null);

      if (!hasLeft && !hasRight) {
        if (leftSiblingId !== null && nodeMap.has(leftSiblingId)) {
          node.x = nodeMap.get(leftSiblingId).x + siblingDistance;
        } else {
          node.x = 0;
        }
      } else if (hasLeft && !hasRight) {
        const leftChild = nodeMap.get(leftId);
        const mid = leftChild.x;
        if (leftSiblingId !== null && nodeMap.has(leftSiblingId)) {
          node.x = nodeMap.get(leftSiblingId).x + siblingDistance;
          node.mod = node.x - mid;
        } else {
          node.x = mid;
        }
      } else if (!hasLeft && hasRight) {
        const rightChild = nodeMap.get(rightId);
        const mid = rightChild.x;
        if (leftSiblingId !== null && nodeMap.has(leftSiblingId)) {
          node.x = nodeMap.get(leftSiblingId).x + siblingDistance;
          node.mod = node.x - mid;
        } else {
          node.x = mid;
        }
      } else {
        const leftChild = nodeMap.get(leftId);
        const rightChild = nodeMap.get(rightId);
        const mid = (leftChild.x + rightChild.x) / 2;
        if (leftSiblingId !== null && nodeMap.has(leftSiblingId)) {
          node.x = nodeMap.get(leftSiblingId).x + siblingDistance;
          node.mod = node.x - mid;
        } else {
          node.x = mid;
        }
      }

      // Contour collision resolution between subtrees
      if (hasLeft && hasRight) {
        resolveContourCollisions(nodeId);
      }
    }

    function resolveContourCollisions(nodeId) {
      const node = nodeMap.get(nodeId);
      if (!node.left || !node.right) return;

      let maxOverlap = 0;
      const leftContour = [];
      const rightContour = [];

      function getRightmostContour(id, currDepth, modSum) {
        const n = nodeMap.get(id);
        if (!n) return;
        const x = n.x + modSum;
        if (leftContour[currDepth] === undefined || x > leftContour[currDepth]) {
          leftContour[currDepth] = x;
        }
        if (n.right) getRightmostContour(n.right, currDepth + 1, modSum + n.mod);
        if (n.left) getRightmostContour(n.left, currDepth + 1, modSum + n.mod);
      }

      function getLeftmostContour(id, currDepth, modSum) {
        const n = nodeMap.get(id);
        if (!n) return;
        const x = n.x + modSum;
        if (rightContour[currDepth] === undefined || x < rightContour[currDepth]) {
          rightContour[currDepth] = x;
        }
        if (n.left) getLeftmostContour(n.left, currDepth + 1, modSum + n.mod);
        if (n.right) getLeftmostContour(n.right, currDepth + 1, modSum + n.mod);
      }

      getRightmostContour(node.left, 0, 0);
      getLeftmostContour(node.right, 0, 0);

      const minDepth = Math.min(leftContour.length, rightContour.length);
      for (let d = 0; d < minDepth; d++) {
        const distance = rightContour[d] - leftContour[d];
        if (distance < siblingDistance) {
          const overlap = siblingDistance - distance;
          if (overlap > maxOverlap) maxOverlap = overlap;
        }
      }

      if (maxOverlap > 0) {
        const rightChild = nodeMap.get(node.right);
        rightChild.x += maxOverlap;
        rightChild.mod += maxOverlap;
        const leftChild = nodeMap.get(node.left);
        node.x = (leftChild.x + rightChild.x) / 2;
      }
    }

    // Pass 2: Pre-order traversal to apply modifier sums
    function secondPass(nodeId, modSum = 0) {
      const node = nodeMap.get(nodeId);
      if (!node) return;
      node.x += modSum;
      if (node.left) secondPass(node.left, modSum + node.mod);
      if (node.right) secondPass(node.right, modSum + node.mod);
    }

    firstPass(rootNode.id);
    secondPass(rootNode.id);

    // Center root on X = 0
    const rootX = rootNode.x;
    nodeMap.forEach((n) => { n.x -= rootX; });

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    nodeMap.forEach((node) => {
      if (node.x < minX) minX = node.x;
      if (node.x > maxX) maxX = node.x;
      if (node.y < minY) minY = node.y;
      if (node.y > maxY) maxY = node.y;
    });

    // Dynamic scale for large trees to avoid camera clipping
    const treeWidth = Math.max(maxX - minX, 1);
    const treeScale = treeWidth > 11 ? Math.min(1.0, 11.0 / treeWidth) : 1.0;

    const positionedNodes = treeNodes.map((node) => {
      const n = nodeMap.get(node.id);
      return {
        ...node,
        pos: [n.x, n.y, 0],
      };
    });

    const posMap = new Map();
    positionedNodes.forEach((n) => posMap.set(n.id, n.pos));

    // Build branches connecting parent -> child
    const branches = [];
    positionedNodes.forEach((node) => {
      if (node.parent !== null && node.parent !== undefined) {
        const parentPos = posMap.get(node.parent);
        if (parentPos) {
          branches.push({
            id: `b-${node.parent}-${node.id}`,
            parentId: node.parent,
            childId: node.id,
            start: parentPos,
            end: node.pos,
          });
        }
      }
    });

    // Extract unique levels for level markers
    const maxDepth = Math.max(...positionedNodes.map((n) => n.depth), 0);
    const levels = [];
    for (let d = 0; d <= maxDepth; d++) {
      const sample = positionedNodes.find((n) => n.depth === d);
      if (sample) {
        levels.push({
          depth: d,
          y: sample.pos[1],
          label: d === 0 ? 'Level 0 (Root)' : `Level ${d}`,
        });
      }
    }

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
