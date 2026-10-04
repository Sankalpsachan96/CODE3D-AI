import React, { useState } from 'react';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * 3D Laser Arch connecting two compared pillars
 */
function ComparisonLaserArch({ startX, startHeight, endX, endHeight }) {
  const p1 = new THREE.Vector3(startX, startHeight + 0.4, 0);
  const p2 = new THREE.Vector3(endX, endHeight + 0.4, 0);
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  mid.y += 0.6; // arch apex

  const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
  const points = curve.getPoints(24);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color="#f59e0b" linewidth={3} />
      </line>
      <Float speed={4} floatIntensity={0.2}>
        <Text position={[mid.x, mid.y + 0.35, mid.z]} fontSize={0.26} color="#facc15" fontWeight="bold">
          COMPARING
        </Text>
      </Float>
    </group>
  );
}

export default function SortingVisualizer3D({ dataStructureState }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const values = Array.isArray(dataStructureState?.values) ? dataStructureState.values : [];
  const comparedIndices = Array.isArray(dataStructureState?.comparedIndices) ? dataStructureState.comparedIndices : [];
  const swappedIndices = Array.isArray(dataStructureState?.swappedIndices) ? dataStructureState.swappedIndices : [];
  const sortedIndices = Array.isArray(dataStructureState?.sortedIndices) ? dataStructureState.sortedIndices : [];
  const visualStates = dataStructureState?.visualStates || {};
  const activeIndex = dataStructureState?.activeIndex ?? null;
  const pointers = dataStructureState?.pointers || {};

  const spacing = values.length > 20 ? 1.4 : 1.8;
  const totalWidth = values.length > 0 ? (values.length - 1) * spacing : 0;
  const startX = -totalWidth / 2;

  const maxAbsVal = Math.max(...values.map((v) => Math.abs(Number(v) || 0)), 1);
  const computeHeight = (val) => Math.max(0.6, (Math.abs(Number(val) || 0) / maxAbsVal) * 3.6);

  const low = pointers?.low;
  const mid = pointers?.mid;
  const high = pointers?.high;
  const pivot = pointers?.pivot;

  // Find heights of compared indices for laser arch
  let comparedArch = null;
  if (comparedIndices && comparedIndices.length >= 2) {
    const idxA = comparedIndices[0];
    const idxB = comparedIndices[1];
    if (idxA >= 0 && idxA < values.length && idxB >= 0 && idxB < values.length) {
      const hA = computeHeight(values[idxA]);
      const hB = computeHeight(values[idxB]);
      comparedArch = {
        startX: startX + idxA * spacing,
        startHeight: hA,
        endX: startX + idxB * spacing,
        endHeight: hB,
      };
    }
  }

  return (
    <group position={[0, -1, 0]}>
      {/* Ground Foundation Pedestal */}
      {values.length > 0 ? (
        <mesh position={[0, -0.12, 0]} receiveShadow>
          <boxGeometry args={[values.length * spacing + 2.5, 0.16, 2.4]} />
          <meshStandardMaterial color="#090d16" metalness={0.7} roughness={0.3} />
        </mesh>
      ) : (
        <group position={[0, 1.2, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[4.2, 0.14, 1.8]} />
            <meshStandardMaterial color="#090d16" roughness={0.6} />
          </mesh>
          <Text position={[0, 0.4, 0]} fontSize={0.32} color="#94a3b8" fontWeight="bold">
            [EMPTY DATASET: 0 elements]
          </Text>
        </group>
      )}

      {/* Laser Arch between compared pillars */}
      {comparedArch && (
        <ComparisonLaserArch
          startX={comparedArch.startX}
          startHeight={comparedArch.startHeight}
          endX={comparedArch.endX}
          endHeight={comparedArch.endHeight}
        />
      )}

      {/* 3D Value Bars / Pillars */}
      {values.map((val, idx) => {
        const height = computeHeight(val);
        const posX = startX + idx * spacing;
        const isCompared = comparedIndices && comparedIndices.includes(idx);
        const isSwapped = swappedIndices && swappedIndices.includes(idx);
        const isSorted = sortedIndices && sortedIndices.includes(idx);
        const isActive = activeIndex === idx || mid === idx;
        const isPivot = pivot === idx;
        const vState = visualStates[idx];

        let color = '#1e293b';
        let emissive = '#0f172a';
        let wireColor = '#334155';

        // State-driven coloring
        if (vState === 'FOUND' || vState === 'found') {
          color = '#10b981';
          emissive = '#059669';
          wireColor = '#6ee7b7';
        } else if (vState === 'NOT_FOUND' || vState === 'not_found') {
          color = '#ef4444';
          emissive = '#dc2626';
          wireColor = '#fca5a5';
        } else if (vState === 'TARGET' || vState === 'target') {
          color = '#eab308';
          emissive = '#ca8a04';
          wireColor = '#fde047';
        } else if (vState === 'SELECTED' || vState === 'selected') {
          color = '#0284c7';
          emissive = '#0369a1';
          wireColor = '#7dd3fc';
        } else if (vState === 'PIVOT' || vState === 'pivot' || isPivot) {
          color = '#8b5cf6';
          emissive = '#7c3aed';
          wireColor = '#c4b5fd';
        } else if (vState === 'SWAPPING' || vState === 'swap' || isSwapped) {
          color = '#10b981';
          emissive = '#059669';
          wireColor = '#6ee7b7';
        } else if (vState === 'COMPARE' || vState === 'compare' || isCompared) {
          color = '#f59e0b';
          emissive = '#d97706';
          wireColor = '#fde68a';
        } else if (vState === 'CURRENT' || vState === 'current' || isActive) {
          color = '#06b6d4';
          emissive = '#0891b2';
          wireColor = '#67e8f9';
        } else if (vState === 'SORTED' || vState === 'sorted' || isSorted) {
          color = '#047857';
          emissive = '#059669';
          wireColor = '#34d399';
        } else if (vState === 'VISITED' || vState === 'visited') {
          color = '#6366f1';
          emissive = '#4f46e5';
          wireColor = '#a5b4fc';
        }

        const isHovered = hoveredIdx === idx;
        const hoverScale = isHovered ? 1.3 : 1.0;
        const hoverElevation = isHovered ? 0.35 : 0;

        // Collect all pointer badges
        const ptrNames = [];
        if (isPivot || vState === 'PIVOT') ptrNames.push('PIVOT');
        if (mid === idx) ptrNames.push('MID');
        if (low === idx) ptrNames.push('LOW');
        if (high === idx) ptrNames.push('HIGH');
        if (pointers.i === idx) ptrNames.push('i');
        if (pointers.j === idx) ptrNames.push('j');
        if (pointers.k === idx) ptrNames.push('k');
        if (pointers.target === idx || vState === 'TARGET') ptrNames.push('TARGET');
        if (vState === 'FOUND') ptrNames.push('FOUND 🎯');
        if (vState === 'NOT_FOUND') ptrNames.push('MISS');

        return (
          <group
            key={`sort-${idx}`}
            position={[posX, height / 2 + hoverElevation, 0]}
            scale={[hoverScale, hoverScale, hoverScale]}
          >
            {/* 3D Pillar Box */}
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
              <boxGeometry args={[1.3, height, 1.2]} />
              <meshStandardMaterial
                color={isHovered ? '#0284c7' : color}
                emissive={isHovered ? '#38bdf8' : emissive}
                emissiveIntensity={isHovered ? 1.8 : (isCompared || isSwapped || isActive || isPivot ? 0.9 : 0.25)}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Glowing Wireframe Border */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(1.31, height + 0.01, 1.21)]} />
              <lineBasicMaterial color={isHovered ? '#38bdf8' : wireColor} linewidth={2} />
            </lineSegments>

            {/* Interactive Mouse Hover 3D Inspection Tooltip */}
            {isHovered && (
              <Float speed={5} floatIntensity={0.15}>
                <group position={[0, height / 2 + 1.25, 0]}>
                  <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[2.7, 1.0]} />
                    <meshBasicMaterial color="#080e1e" transparent opacity={0.94} />
                  </mesh>
                  <lineSegments position={[0, 0, -0.01]}>
                    <edgesGeometry args={[new THREE.BoxGeometry(2.72, 1.02, 0.01)]} />
                    <lineBasicMaterial color="#38bdf8" />
                  </lineSegments>
                  <Text position={[0, 0.3, 0.05]} fontSize={0.21} color="#38bdf8" fontWeight="bold">
                    {`Pillar [${idx}] = ${val}`}
                  </Text>
                  <Text position={[0, 0.04, 0.05]} fontSize={0.14} color="#94a3b8">
                    {`Size: 1.30 × ${height.toFixed(2)} × 1.20`}
                  </Text>
                  <Text position={[0, -0.22, 0.05]} fontSize={0.13} color="#22c55e" fontStyle="italic">
                    {`⚡ Scaled 130% on Mouse Over`}
                  </Text>
                </group>
              </Float>
            )}

            {/* Value above bar */}
            <Text
              position={[0, height / 2 + 0.38, 0]}
              fontSize={0.34}
              color="#ffffff"
              fontWeight="bold"
            >
              {String(val)}
            </Text>

            {/* Dynamic Pointer & State Badges */}
            {ptrNames.length > 0 && (
              <Float speed={4} floatIntensity={0.15}>
                <group position={[0, height / 2 + 0.8, 0]}>
                  <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[Math.max(0.9, ptrNames.join(', ').length * 0.18), 0.36]} />
                    <meshBasicMaterial color="#080e1e" transparent opacity={0.88} />
                  </mesh>
                  <Text
                    fontSize={0.22}
                    color={
                      ptrNames.includes('FOUND 🎯')
                        ? '#34d399'
                        : ptrNames.includes('MISS')
                        ? '#f87171'
                        : ptrNames.includes('PIVOT')
                        ? '#c4b5fd'
                        : ptrNames.includes('TARGET')
                        ? '#fde047'
                        : '#38bdf8'
                    }
                    fontWeight="bold"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {ptrNames.join(', ')}
                  </Text>
                </group>
              </Float>
            )}

            {/* Index label underneath */}
            <Text
              position={[0, -height / 2 - 0.35, 0]}
              fontSize={0.24}
              color="#64748b"
            >
              {`[${idx}]`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
