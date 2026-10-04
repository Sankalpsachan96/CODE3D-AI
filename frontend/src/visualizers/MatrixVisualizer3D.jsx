import React, { useRef, useState } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Golden Queen Chess Piece for N-Queens Backtracking
function QueenPiece({ position, isActive }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.8;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Queen Base Pedestal */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.52, 0.25, 24]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.85}
          roughness={0.2}
          emissive="#d97706"
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </mesh>

      {/* Queen Tapered Stem */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.38, 0.55, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.15}
          emissive="#f59e0b"
          emissiveIntensity={isActive ? 0.9 : 0.4}
        />
      </mesh>

      {/* Queen Crown Spire */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <coneGeometry args={[0.38, 0.45, 8]} />
        <meshStandardMaterial
          color="#fef08a"
          metalness={0.95}
          roughness={0.1}
          emissive="#f59e0b"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Crown Jewel Orb */}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fbbf24"
          emissiveIntensity={2.0}
        />
      </mesh>
      <pointLight color="#fbbf24" intensity={1.8} distance={3.5} />
    </group>
  );
}

// 3D Fresh / Rotten Orange Spheres
function OrangeOrb({ position, type, isActive }) {
  const isRotten = type === 2;
  const color = isRotten ? '#ef4444' : '#10b981';
  const emissive = isRotten ? '#f97316' : '#059669';

  return (
    <group position={position}>
      <Float speed={isRotten ? 3 : 1.5} floatIntensity={0.2}>
        <mesh castShadow>
          <sphereGeometry args={[0.42, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={isActive ? 1.2 : 0.5}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
        {isRotten && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.55, 0.03, 16, 32]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.7} />
          </mesh>
        )}
      </Float>
      <pointLight color={color} intensity={isActive ? 1.5 : 0.6} distance={2.5} />
    </group>
  );
}

export default function MatrixVisualizer3D({ dataStructureState }) {
  const { matrix = [], pointers = {}, label, focusInfo } = dataStructureState || {};
  const [hoveredCell, setHoveredCell] = useState(null);
  const activeRow = pointers?.activeRow ?? pointers?.R ?? pointers?.r ?? -1;
  const activeCol = pointers?.activeCol ?? pointers?.C ?? pointers?.c ?? -1;
  const conflictRow = pointers?.conflictRow ?? -1;
  const conflictCol = pointers?.conflictCol ?? -1;
  const path = pointers?.path || []; // For Word Search / Grid DFS
  const isQueensBoard = pointers?.isQueens || pointers?.boardType === 'queens';
  const isRottenOranges = pointers?.isRottenOranges || pointers?.problemType === 'rotten-oranges';

  const rows = matrix.length;
  const cols = rows > 0 ? matrix[0].length : 0;
  const spacing = 1.75;

  let activeVal = null;
  if (activeRow >= 0 && activeRow < rows && activeCol >= 0 && activeCol < cols) {
    activeVal = matrix[activeRow][activeCol];
  }

  const activePosX = (activeCol - (cols - 1) / 2) * spacing;
  const activePosZ = (activeRow - (rows - 1) / 2) * spacing;

  return (
    <group position={[0, 0.3, 0]}>
      {/* Base Checkered Foundation Floor */}
      {rows > 0 && cols > 0 && (
        <mesh position={[0, -0.32, 0]} receiveShadow>
          <boxGeometry args={[cols * spacing + 1.2, 0.16, rows * spacing + 1.2]} />
          <meshStandardMaterial color="#080c16" metalness={0.8} roughness={0.25} />
        </mesh>
      )}

      {/* Active Vertical Laser Guide Column */}
      {activeRow >= 0 && activeCol >= 0 && (
        <group position={[activePosX, 1.3, activePosZ]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 2.6, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
          </mesh>
          <pointLight color="#38bdf8" intensity={1.8} distance={4.5} />

          <Float speed={4} floatIntensity={0.25}>
            <group position={[0, 1.5, 0]}>
              <Text fontSize={0.28} color="#22d3ee" fontWeight="bold">
                {`[${activeRow}][${activeCol}] = ${activeVal}`}
              </Text>
            </group>
          </Float>
        </group>
      )}

      {/* 3D Matrix Grid Blocks */}
      {matrix.map((rowArr, r) => (
        <group key={`r-${r}`} position={[0, 0, (r - (rows - 1) / 2) * spacing]}>
          {rowArr.map((val, c) => {
            const isActive = r === activeRow && c === activeCol;
            const isConflict = r === conflictRow && c === conflictCol;
            const inPath = path.some((pt) => pt[0] === r && pt[1] === c);
            const isQueen = val === 'Q' || val === '👑' || (isQueensBoard && val === 1);
            const isOrangeCell = isRottenOranges && (val === 1 || val === 2);
            const posX = (c - (cols - 1) / 2) * spacing;

            // Checkered alternating tile base
            const isAlternateTile = (r + c) % 2 === 0;
            const baseTileColor = isAlternateTile ? '#131b2e' : '#1e293b';

            // Tile color determination
            let tileColor = baseTileColor;
            let emissiveColor = '#0f172a';
            let emissiveIntensity = 0.2;

            if (isConflict) {
              tileColor = '#7f1d1d';
              emissiveColor = '#ef4444';
              emissiveIntensity = 1.0;
            } else if (isActive) {
              tileColor = '#0891b2';
              emissiveColor = '#06b6d4';
              emissiveIntensity = 0.95;
            } else if (inPath) {
              tileColor = '#5b21b6';
              emissiveColor = '#8b5cf6';
              emissiveIntensity = 0.8;
            } else if (isQueen) {
              tileColor = '#78350f';
              emissiveColor = '#f59e0b';
              emissiveIntensity = 0.6;
            }

            const numericVal = typeof val === 'number' ? val : 0;
            const blockHeight = isQueen ? 0.35 : Math.max(0.4, Math.min(2.2, 0.4 + (numericVal / 25) * 1.4));
            const isHovered = hoveredCell && hoveredCell[0] === r && hoveredCell[1] === c;
            const hoverScale = isHovered ? 1.3 : 1.0;
            const hoverElevation = isHovered ? 0.35 : 0;

            return (
              <group
                key={`c-${c}`}
                position={[posX, (isActive ? 0.3 : 0) + hoverElevation, 0]}
                scale={[hoverScale, hoverScale, hoverScale]}
              >
                {/* Base Tile Box */}
                <mesh
                  castShadow
                  receiveShadow
                  position={[0, blockHeight / 2, 0]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredCell([r, c]);
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    setHoveredCell(null);
                    document.body.style.cursor = 'default';
                  }}
                >
                  <boxGeometry args={[1.4, blockHeight, 1.4]} />
                  <meshStandardMaterial
                    color={isHovered ? '#0284c7' : tileColor}
                    emissive={isHovered ? '#38bdf8' : emissiveColor}
                    emissiveIntensity={isHovered ? 1.8 : emissiveIntensity}
                    metalness={0.5}
                    roughness={0.25}
                  />
                </mesh>

                {/* Glowing Wireframe Border */}
                <lineSegments position={[0, blockHeight / 2, 0]}>
                  <edgesGeometry args={[new THREE.BoxGeometry(1.41, blockHeight + 0.01, 1.41)]} />
                  <lineBasicMaterial
                    color={
                      isHovered
                        ? '#38bdf8'
                        : isConflict
                        ? '#ef4444'
                        : isActive
                        ? '#67e8f9'
                        : inPath
                        ? '#c084fc'
                        : isQueen
                        ? '#fbbf24'
                        : '#334155'
                    }
                  />
                </lineSegments>

                {/* Interactive Mouse Hover 3D Inspection Tooltip */}
                {isHovered && (
                  <Float speed={5} floatIntensity={0.15}>
                    <group position={[0, blockHeight + 1.25, 0]}>
                      <mesh position={[0, 0, -0.02]}>
                        <planeGeometry args={[2.7, 1.05]} />
                        <meshBasicMaterial color="#080e1e" transparent opacity={0.95} />
                      </mesh>
                      <lineSegments position={[0, 0, -0.01]}>
                        <edgesGeometry args={[new THREE.BoxGeometry(2.72, 1.07, 0.01)]} />
                        <lineBasicMaterial color="#38bdf8" />
                      </lineSegments>
                      <Text position={[0, 0.32, 0.05]} fontSize={0.21} color="#38bdf8" fontWeight="bold">
                        {`Grid [${r}, ${c}] = ${val}`}
                      </Text>
                      <Text position={[0, 0.04, 0.05]} fontSize={0.14} color="#94a3b8">
                        {`Box Size: 1.4 × ${blockHeight.toFixed(2)} × 1.4`}
                      </Text>
                      <Text position={[0, -0.24, 0.05]} fontSize={0.13} color="#22c55e" fontStyle="italic">
                        {`⚡ Scaled 130% on Mouse Over`}
                      </Text>
                    </group>
                  </Float>
                )}

                {/* N-Queens: Render 3D Queen Crown */}
                {isQueen && (
                  <QueenPiece position={[0, blockHeight, 0]} isActive={isActive} />
                )}

                {/* Rotten Oranges: Render 3D Orange Spheres */}
                {isOrangeCell && (
                  <OrangeOrb position={[0, blockHeight + 0.35, 0]} type={val} isActive={isActive} />
                )}

                {/* Regular Text on Top Face (if not Queen or Orange) */}
                {!isQueen && !isOrangeCell && (
                  <Text
                    position={[0, blockHeight + 0.02, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.42}
                    color="#ffffff"
                    fontWeight="bold"
                  >
                    {String(val)}
                  </Text>
                )}

                {/* Regular Text on Front Face for front/isometric angles */}
                {!isQueen && !isOrangeCell && (
                  <Text
                    position={[0, blockHeight / 2, 0.72]}
                    fontSize={0.38}
                    color="#ffffff"
                    fontWeight="bold"
                  >
                    {String(val)}
                  </Text>
                )}

                {/* Coordinate label beneath */}
                <Text
                  position={[0, 0.02, 0.85]}
                  rotation={[-Math.PI / 3, 0, 0]}
                  fontSize={0.2}
                  color={isActive ? '#38bdf8' : '#64748b'}
                >
                  {`[${r}][${c}]`}
                </Text>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}
