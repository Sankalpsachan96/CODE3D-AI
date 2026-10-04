import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const POINTER_COLORS = {
  i: '#38bdf8',
  j: '#f59e0b',
  left: '#10b981',
  right: '#ef4444',
  start: '#a855f7',
  end: '#ec4899',
  maxStart: '#facc15',
  maxEnd: '#f59e0b',
  curr: '#06b6d4',
  pivot: '#eab308'
};

/**
 * Rotating Holographic Ring around the Active Array Cell
 */
function CellHoloRing({ color = '#00f2fe' }) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 2;
      ringRef.current.rotation.x += delta * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.15, 0.03, 16, 40]} />
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
 * 3D Holographic Water Volume Mesh for "Container With Most Water"
 */
function WaterVolumeMesh({ startX, spacing, leftIdx, rightIdx, leftHeight, rightHeight, currentArea, maxArea }) {
  if (leftIdx === null || rightIdx === null || leftIdx >= rightIdx) return null;

  const leftX = startX + leftIdx * spacing;
  const rightX = startX + rightIdx * spacing;
  const width = rightX - leftX;
  const centerX = (leftX + rightX) / 2;
  const waterHeight = Math.max(0.4, Math.min(leftHeight, rightHeight) * 0.38);

  return (
    <group position={[centerX, waterHeight / 2 - 0.2, 0]}>
      {/* 3D Water Box */}
      <mesh>
        <boxGeometry args={[width, waterHeight, 1.4]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.6}
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Surface Water Line Glow */}
      <mesh position={[0, waterHeight / 2, 0]}>
        <boxGeometry args={[width, 0.05, 1.42]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>

      {/* Floating Area Metric Tag */}
      <Float speed={2} floatIntensity={0.15}>
        <group position={[0, waterHeight / 2 + 0.6, 0]}>
          <Text
            fontSize={0.26}
            color="#22d3ee"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`Water Area: ${currentArea} (Max: ${maxArea || currentArea})`}
          </Text>
          <Text
            position={[0, -0.26, 0]}
            fontSize={0.18}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
          >
            {`width (${rightIdx - leftIdx}) × height (${Math.min(leftHeight, rightHeight)})`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

/**
 * Single 3D Array Cell Box with negative value styling, custom height for container pillars, and smooth elevation
 */
/**
 * Single 3D Array Cell Box with negative value styling, custom height for container pillars,
 * trapped water rendering, target found laser beacon, and smooth elevation
 */
function ArrayCell({
  value,
  index,
  isActive,
  isPrevious,
  isInWindow,
  positionX,
  pointerNames = [],
  customHeight = null,
  trappedWaterHeight = null,
  isTargetFound = false,
  isLisActive = false,
  dpValue = null,
  isXRayMode = false,
  onSelectCell = null,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef();
  const isNegative = typeof value === 'number' && value < 0;

  // If customHeight is provided (e.g. for Container With Most Water or Trapping Rain Water), scale box height
  const baseHeight = customHeight ? Math.max(0.6, Math.min(customHeight * 0.45, 4.5)) : 1.4;
  const hoverScaleMultiplier = isHovered ? 1.32 : 1.0;
  const hoverElevation = isHovered ? 0.38 : 0;
  const targetY = (isTargetFound ? 1.0 : isActive ? 0.75 : isInWindow ? 0.25 : 0) + hoverElevation;
  const targetScale = (isTargetFound ? 1.15 : isActive ? 1.08 : isInWindow ? 1.02 : 1.0) * hoverScaleMultiplier;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY + baseHeight / 2 - 0.7, delta * 12);
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 12);
    }
  });

  // Dynamic colors based on active, target found, LIS, negative, or subarray state
  let boxColor = '#1e293b';
  let emissiveColor = '#0f172a';
  let wireColor = '#334155';

  if (isHovered) {
    boxColor = '#0284c7';
    emissiveColor = '#0ea5e9';
    wireColor = '#38bdf8';
  } else if (isTargetFound) {
    boxColor = '#eab308';
    emissiveColor = '#ca8a04';
    wireColor = '#fef08a';
  } else if (isLisActive) {
    boxColor = '#d97706';
    emissiveColor = '#b45309';
    wireColor = '#fde68a';
  } else if (isActive) {
    boxColor = isNegative ? '#9f1239' : '#06b6d4';
    emissiveColor = isNegative ? '#e11d48' : '#0891b2';
    wireColor = isNegative ? '#fda4af' : '#67e8f9';
  } else if (isInWindow) {
    boxColor = isNegative ? '#4c0519' : '#164e63';
    emissiveColor = isNegative ? '#881337' : '#0e7490';
    wireColor = isNegative ? '#f43f5e' : '#22d3ee';
  } else if (isPrevious) {
    boxColor = '#334155';
    emissiveColor = '#1e293b';
    wireColor = '#64748b';
  } else if (isNegative) {
    boxColor = '#271217';
    emissiveColor = '#3f121d';
    wireColor = '#881337';
  }

  return (
    <group position={[positionX, 0, 0]}>
      {/* 3D Cell Box */}
      <group ref={meshRef} position={[0, targetY + baseHeight / 2 - 0.7, 0]}>
        <mesh
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setIsHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setIsHovered(false);
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelectCell) onSelectCell(index, value);
          }}
        >
          <boxGeometry args={[1.45, baseHeight, 1.45]} />
          <meshStandardMaterial
            color={isXRayMode ? '#0284c7' : boxColor}
            metalness={isXRayMode ? 0.85 : 0.55}
            roughness={isXRayMode ? 0.1 : 0.18}
            emissive={isXRayMode ? '#38bdf8' : emissiveColor}
            emissiveIntensity={isHovered ? 1.8 : isTargetFound ? 1.5 : isActive ? 1.1 : isInWindow ? 0.6 : 0.25}
            transparent={isXRayMode}
            opacity={isXRayMode ? 0.55 : 1.0}
            wireframe={isXRayMode && !isHovered}
          />
        </mesh>

        {/* Outer glowing wireframe border */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.46, baseHeight + 0.01, 1.46)]} />
          <lineBasicMaterial color={wireColor} linewidth={2} />
        </lineSegments>

        {/* Interactive Mouse Hover 3D Inspection Tooltip */}
        {isHovered && (
          <Float speed={5} floatIntensity={0.15}>
            <group position={[0, baseHeight / 2 + 1.25, 0]}>
              <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[2.8, 1.05]} />
                <meshBasicMaterial color="#080e1e" transparent opacity={0.94} />
              </mesh>
              <lineSegments position={[0, 0, -0.01]}>
                <edgesGeometry args={[new THREE.BoxGeometry(2.82, 1.07, 0.01)]} />
                <lineBasicMaterial color="#38bdf8" />
              </lineSegments>
              <Text position={[0, 0.32, 0.05]} fontSize={0.22} color="#38bdf8" fontWeight="bold">
                {`arr[${index}] = ${value}`}
              </Text>
              <Text position={[0, 0.04, 0.05]} fontSize={0.14} color="#94a3b8">
                {`Box Size: 1.45 × ${baseHeight.toFixed(2)} × 1.45`}
              </Text>
              <Text position={[0, -0.24, 0.05]} fontSize={0.13} color="#22c55e" fontStyle="italic">
                {`⚡ Scaled 132% on Mouse Over`}
              </Text>
            </group>
          </Float>
        )}

        {/* Active Holo Ring around active cell */}
        {isActive && !isTargetFound && <CellHoloRing color={isNegative ? '#f43f5e' : '#00f2fe'} />}

        {/* Target Found Laser Beacon and Golden Ring */}
        {isTargetFound && (
          <group position={[0, baseHeight / 2, 0]}>
            <mesh position={[0, 1.9, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 3.8, 16]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={2.8}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.95, 0.05, 16, 32]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
            <Float speed={5} floatIntensity={0.2}>
              <Text
                position={[0, 4.0, 0]}
                fontSize={0.3}
                color="#fbbf24"
                fontWeight="bold"
              >
                🎯 TARGET MATCH!
              </Text>
            </Float>
          </group>
        )}

        {/* Trapped Rain Water Block atop elevation pillar */}
        {trappedWaterHeight > 0 && (
          <group position={[0, baseHeight / 2 + (trappedWaterHeight * 0.45) / 2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.44, trappedWaterHeight * 0.45, 1.44]} />
              <meshStandardMaterial
                color="#00f2fe"
                emissive="#0284c7"
                emissiveIntensity={0.8}
                transparent
                opacity={0.65}
                roughness={0.1}
                metalness={0.2}
              />
            </mesh>
            {/* Glowing water surface line */}
            <mesh position={[0, (trappedWaterHeight * 0.45) / 2, 0]}>
              <boxGeometry args={[1.45, 0.04, 1.45]} />
              <meshBasicMaterial color="#67e8f9" />
            </mesh>
            <Float speed={3} floatIntensity={0.15}>
              <Text
                position={[0, (trappedWaterHeight * 0.45) / 2 + 0.35, 0]}
                fontSize={0.24}
                color="#22d3ee"
                fontWeight="bold"
              >
                {`+${trappedWaterHeight}💧`}
              </Text>
            </Float>
          </group>
        )}

        {/* 3D Value Text */}
        <Text
          position={[0, 0, 0.76]}
          fontSize={0.48}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {String(value)}
        </Text>

        {/* Negative Sign Accent Tag */}
        {isNegative && (
          <mesh position={[0, -baseHeight / 2 + 0.04, 0]}>
            <boxGeometry args={[1.4, 0.08, 1.4]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        )}

        {/* LIS Badge */}
        {isLisActive && (
          <Float speed={3} floatIntensity={0.15}>
            <Text
              position={[0, baseHeight / 2 + 0.5, 0]}
              fontSize={0.26}
              color="#facc15"
              fontWeight="bold"
            >
              ★ LIS
            </Text>
          </Float>
        )}

        {/* Floating Multi-Pointer Tags above cell with holographic vertical beam */}
        {pointerNames.length > 0 && !isTargetFound && (
          <group position={[0, baseHeight / 2 + 0.6, 0]}>
            <mesh position={[0, -0.28, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.55, 8]} />
              <meshBasicMaterial
                color={POINTER_COLORS[pointerNames[0]] || '#38bdf8'}
                transparent
                opacity={0.8}
              />
            </mesh>
            <Float speed={4} rotationIntensity={0.08} floatIntensity={0.2}>
              <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.24, 0.48, 16]} />
                <meshStandardMaterial
                  color={POINTER_COLORS[pointerNames[0]] || '#38bdf8'}
                  emissive={POINTER_COLORS[pointerNames[0]] || '#0284c7'}
                  emissiveIntensity={1.2}
                />
              </mesh>
              <group position={[0, 0.55, 0]}>
                <mesh position={[0, 0, -0.01]}>
                  <planeGeometry args={[Math.max(0.85, pointerNames.join(', ').length * 0.16), 0.34]} />
                  <meshBasicMaterial color="#0b0f19" transparent opacity={0.85} />
                </mesh>
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.22}
                  color={POINTER_COLORS[pointerNames[0]] || '#38bdf8'}
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  {pointerNames.join(', ')}
                </Text>
              </group>
            </Float>
          </group>
        )}
      </group>

      {/* Index Label beneath each cell */}
      <group position={[0, -1.0, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color={isNegative ? '#f87171' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
        >
          {`[${index}]`}
        </Text>
        <Text
          position={[0, -0.34, 0]}
          fontSize={0.2}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          INDEX
        </Text>
        {dpValue !== null && (
          <Text
            position={[0, -0.68, 0]}
            fontSize={0.22}
            color="#10b981"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            {`DP: ${dpValue}`}
          </Text>
        )}
        {isXRayMode && (
          <group position={[0, dpValue !== null ? -1.02 : -0.68, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.16}
              color="#38bdf8"
              fontWeight="bold"
              anchorX="center"
              anchorY="middle"
            >
              {`0x${(0x7F00 + index * 4).toString(16).toUpperCase()}`}
            </Text>
            <Text
              position={[0, -0.2, 0]}
              fontSize={0.1}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              Conceptual Memory
            </Text>
          </group>
        )}
      </group>
    </group>
  );
}

/**
 * Holographic 3D Subarray Bounding Frame (for Kadane's and Sliding Window)
 */
function SubarrayBoundingFrame({ startX, spacing, startIdx, endIdx, isMaxWindow }) {
  if (startIdx === null || endIdx === null || startIdx > endIdx) return null;

  const leftX = startX + startIdx * spacing - 0.9;
  const rightX = startX + endIdx * spacing + 0.9;
  const width = rightX - leftX;
  const centerX = (leftX + rightX) / 2;
  const frameColor = isMaxWindow ? '#facc15' : '#22d3ee';

  return (
    <group position={[centerX, 0.8, 0]}>
      <mesh position={[0, -0.72, 0]}>
        <boxGeometry args={[width, 0.08, 1.8]} />
        <meshStandardMaterial
          color={frameColor}
          emissive={frameColor}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      <Float speed={3} floatIntensity={0.15}>
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.26}
          color={frameColor}
          fontWeight="bold"
        >
          {isMaxWindow ? `★ OPTIMAL SUBARRAY [${startIdx}..${endIdx}] ★` : `ACTIVE WINDOW [${startIdx}..${endIdx}]`}
        </Text>
      </Float>
    </group>
  );
}

/**
 * ArrayVisualizer3D renders linear, subarray, Container With Most Water, Trapping Rain Water,
 * and Longest Increasing Subsequence structures in 3D WebGL space.
 */
export default function ArrayVisualizer3D({ dataStructureState, isXRayMode = false, onSelectElement = null }) {
  const effectiveXRay = isXRayMode || !!dataStructureState?.isXRayMode;
  const {
    values = [],
    activeIndex = null,
    previousIndex = null,
    pointers = {},
    window = null,
    type = 'array',
    waterVolume = null,
    trappedWater = [],
    dpValues = [],
    lisIndices = [],
    targetFound = false,
  } = dataStructureState || {};

  const isTrappingRainWater = type === 'trapping-rain-water' || (trappedWater && trappedWater.length > 0);
  const isContainerWater = type === 'container-water' || type === 'most-water' || (waterVolume !== null && !isTrappingRainWater);
  const spacing = values.length > 25 ? 1.6 : 2.1;
  const totalWidth = values.length > 0 ? (values.length - 1) * spacing : 0;
  const startX = -totalWidth / 2;

  // Compute pointers per index
  const pointersByIndex = {};
  if (pointers) {
    Object.entries(pointers).forEach(([name, idx]) => {
      if (typeof idx === 'number' && idx >= 0 && idx < values.length) {
        if (!pointersByIndex[idx]) pointersByIndex[idx] = [];
        pointersByIndex[idx].push(name);
      }
    });
  }

  // Active or optimal subarray window
  const windowStart = window?.start ?? null;
  const windowEnd = window?.end ?? null;
  const maxStart = window?.maxStart ?? pointers?.maxStart ?? null;
  const maxEnd = window?.maxEnd ?? pointers?.maxEnd ?? null;

  // Container With Most Water pointers & calculations
  const leftPointer = waterVolume?.left ?? pointers?.left ?? (pointers?.start ?? null);
  const rightPointer = waterVolume?.right ?? pointers?.right ?? (pointers?.end ?? null);
  const currentArea = waterVolume?.area ?? ((leftPointer !== null && rightPointer !== null && values[leftPointer] !== undefined && values[rightPointer] !== undefined)
    ? Math.min(values[leftPointer], values[rightPointer]) * (rightPointer - leftPointer)
    : 0);
  const maxArea = waterVolume?.maxArea ?? pointers?.maxArea ?? null;

  return (
    <group position={[0, 0.8, 0]}>
      {/* Base Foundation Rail */}
      {values.length > 0 ? (
        <mesh position={[0, -0.75, 0]} receiveShadow>
          <boxGeometry args={[totalWidth + 2.5, 0.12, 1.8]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      ) : (
        <group position={[0, 0, 0]}>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[4.2, 0.14, 1.8]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <Text position={[0, 0.4, 0]} fontSize={0.32} color="#94a3b8" fontWeight="bold">
            [EMPTY ARRAY: length = 0]
          </Text>
        </group>
      )}

      {/* Floating HUD for Trapping Rain Water */}
      {isTrappingRainWater && (
        <Float speed={2} floatIntensity={0.15}>
          <group position={[0, 3.8, 0]}>
            <Text
              fontSize={0.34}
              color="#22d3ee"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {`💧 Total Water Retained: ${typeof waterVolume === 'number' ? waterVolume : (trappedWater.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0))} Units`}
            </Text>
          </group>
        </Float>
      )}

      {/* Subarray Window Highlights */}
      {!isContainerWater && !isTrappingRainWater && windowStart !== null && windowEnd !== null && (
        <SubarrayBoundingFrame
          startX={startX}
          spacing={spacing}
          startIdx={windowStart}
          endIdx={windowEnd}
          isMaxWindow={false}
        />
      )}
      {!isContainerWater && !isTrappingRainWater && maxStart !== null && maxEnd !== null && (
        <SubarrayBoundingFrame
          startX={startX}
          spacing={spacing}
          startIdx={maxStart}
          endIdx={maxEnd}
          isMaxWindow={true}
        />
      )}

      {/* 3D Volumetric Water Rendering for Container With Most Water */}
      {isContainerWater && leftPointer !== null && rightPointer !== null && (
        <WaterVolumeMesh
          startX={startX}
          spacing={spacing}
          leftIdx={leftPointer}
          rightIdx={rightPointer}
          leftHeight={values[leftPointer] || 0}
          rightHeight={values[rightPointer] || 0}
          currentArea={currentArea}
          maxArea={maxArea}
        />
      )}

      {/* Array Elements / Pillars */}
      {values.map((val, idx) => {
        const posX = startX + idx * spacing;
        const isActive = activeIndex === idx || idx === leftPointer || idx === rightPointer;
        const isPrevious = previousIndex === idx;
        const isInWindow = windowStart !== null && windowEnd !== null && idx >= windowStart && idx <= windowEnd;
        const cellPointers = pointersByIndex[idx] || [];
        const isCellTargetFound = targetFound && (pointers?.target === idx || activeIndex === idx);
        const isCellLisActive = lisIndices && lisIndices.includes(idx);
        const cellTrappedWater = isTrappingRainWater && trappedWater ? (trappedWater[idx] || 0) : null;
        const cellDpValue = dpValues && dpValues[idx] !== undefined ? dpValues[idx] : null;

        return (
          <ArrayCell
            key={`cell-${idx}`}
            index={idx}
            value={val}
            isActive={isActive}
            isPrevious={isPrevious}
            isInWindow={isInWindow}
            positionX={posX}
            pointerNames={cellPointers}
            customHeight={(isContainerWater || isTrappingRainWater) ? val : null}
            trappedWaterHeight={cellTrappedWater}
            isTargetFound={isCellTargetFound}
            isLisActive={isCellLisActive}
            dpValue={cellDpValue}
            isXRayMode={effectiveXRay}
            onSelectCell={onSelectElement}
          />
        );
      })}
    </group>
  );
}
