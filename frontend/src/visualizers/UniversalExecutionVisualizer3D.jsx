import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Pulsing Halo Ring for the currently active variable in execution
 */
function ActiveVariableHalo({ color = '#00f2fe' }) {
  const haloRef = useRef();

  useFrame((_, delta) => {
    if (haloRef.current) {
      haloRef.current.rotation.y += delta * 2.2;
      haloRef.current.rotation.x += delta * 0.9;
    }
  });

  return (
    <group position={[0, 0.4, 0]}>
      <mesh ref={haloRef}>
        <torusGeometry args={[1.05, 0.035, 16, 36]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
          wireframe
        />
      </mesh>
    </group>
  );
}

/**
 * Floating 3D Arithmetic Logic Unit (ALU) Reactor
 * Displays active expression evaluation: e.g. total = java + python + maths
 */
function AluReactor3D({ calculationInfo }) {
  const coreRef = useRef();

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 1.5;
      coreRef.current.rotation.z += delta * 0.8;
    }
  });

  if (!calculationInfo) return null;

  return (
    <group position={[0, 3.4, -0.6]}>
      {/* Outer Hologram Energy Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.8}
          wireframe
        />
      </mesh>

      {/* Floating Calculation Banner */}
      <Float speed={2} floatIntensity={0.12}>
        <group position={[0, 0.85, 0]}>
          {/* Backdrop plate */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[4.4, 0.85]} />
            <meshBasicMaterial color="#030712" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[4.44, 0.89]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} wireframe />
          </mesh>

          <Text
            position={[0, 0.16, 0]}
            fontSize={0.22}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`⚡ ALU Evaluation: ${calculationInfo.targetVar || 'Result'}`}
          </Text>
          <Text
            position={[0, -0.16, 0]}
            fontSize={0.26}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`${calculationInfo.expression || ''} = ${calculationInfo.result ?? ''}`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

/**
 * Floating 3D Decision Diamond for Condition Evaluation (if / else if)
 */
function ConditionDecisionGate3D({ conditionInfo }) {
  const gateRef = useRef();

  useFrame((_, delta) => {
    if (gateRef.current) {
      gateRef.current.rotation.y += delta * 1.2;
    }
  });

  if (!conditionInfo) return null;

  const isTrue = Boolean(conditionInfo.result);
  const color = isTrue ? '#10b981' : '#f43f5e';
  const label = isTrue ? '✓ TRUE: BRANCH TAKEN' : '✗ FALSE: BRANCH SKIPPED';

  return (
    <group position={[0, 3.2, 0]}>
      {/* 3D Decision Diamond */}
      <mesh ref={gateRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTrue ? 2.0 : 1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Decision Result Tag */}
      <Float speed={2.5} floatIntensity={0.15}>
        <group position={[0, 0.85, 0]}>
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[4.2, 0.8]} />
            <meshBasicMaterial color="#020617" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[4.24, 0.84]} />
            <meshBasicMaterial color={color} transparent opacity={0.35} wireframe />
          </mesh>

          <Text
            position={[0, 0.16, 0]}
            fontSize={0.24}
            color={color}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {label}
          </Text>
          <Text
            position={[0, -0.16, 0]}
            fontSize={0.2}
            color="#cbd5e1"
            anchorX="center"
            anchorY="middle"
          >
            {`${conditionInfo.evaluation || conditionInfo.expression || ''}`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

/**
 * Clean In-Scene 3D Terminal Streamer Board
 */
function HologramTerminalBoard({ outputStream = [] }) {
  if (!outputStream || outputStream.length === 0) return null;

  const lastLines = outputStream.slice(-4);

  return (
    <group position={[0, 4.3, -3.2]}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[6.6, 1.4]} />
        <meshBasicMaterial color="#090d16" transparent opacity={0.82} />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[6.64, 1.44]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} wireframe />
      </mesh>

      <Text
        position={[-3.1, 0.5, 0]}
        fontSize={0.16}
        color="#38bdf8"
        anchorX="left"
        anchorY="middle"
        fontWeight="bold"
      >
        {`💻 Console Stream [Step Output]:`}
      </Text>

      {lastLines.map((line, idx) => (
        <Text
          key={idx}
          position={[-3.0, 0.22 - idx * 0.24, 0]}
          fontSize={0.17}
          color={idx === lastLines.length - 1 ? '#4ade80' : '#94a3b8'}
          anchorX="left"
          anchorY="middle"
          fontWeight={idx === lastLines.length - 1 ? 'bold' : 'normal'}
        >
          {`> ${String(line).replace(/\n/g, ' ')}`}
        </Text>
      ))}
    </group>
  );
}

/**
 * Universal 3D Execution & Variable Memory Visualizer
 * Renders arbitrary procedural code, variables, calculations, decision branches, and outputs
 */
export default function UniversalExecutionVisualizer3D({ dataStructureState }) {
  if (!dataStructureState) return null;

  // Include parsed arrays alongside scalar variables so generic source models still have visible memory state.
  const rawVars = { ...(dataStructureState.arrays || {}), ...(dataStructureState.variables || {}) };
  const varTypes = dataStructureState.variableTypes || {};
  const activeVar = dataStructureState.activeVariable || null;
  const calcInfo = dataStructureState.calculationInfo || null;
  const condInfo = dataStructureState.conditionInfo || null;
  const outputStream = dataStructureState.outputStream || [];
  const errorInfo = dataStructureState.errorInfo || null;

  // Filter out internal simulator tokens
  const varEntries = Object.entries(rawVars).filter(([key]) => {
    return !['output', '__stream', 'result'].includes(key) && !key.includes('[');
  });

  // Calculate layout coordinates
  const count = varEntries.length;
  const isMultiRow = count > 5;
  const spacing = count <= 3 ? 2.5 : count <= 5 ? 2.0 : 1.8;

  return (
    <group position={[0, -0.4, 0]}>
      {errorInfo && (
        <Float speed={1.4} floatIntensity={0.08}>
          <group position={[0, 3.8, 0]}>
            <mesh position={[0, 0, -0.08]}>
              <planeGeometry args={[7.6, 1.45]} />
              <meshBasicMaterial color="#2a0505" transparent opacity={0.9} />
            </mesh>
            <mesh position={[0, 0, -0.06]}>
              <planeGeometry args={[7.68, 1.53]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.25} wireframe />
            </mesh>
            <Text position={[0, 0.3, 0]} fontSize={0.25} color="#f87171" anchorX="center" anchorY="middle" fontWeight="bold">
              {`EXECUTION ERROR — Line ${errorInfo.line || '?'}${errorInfo.code ? ` • ${errorInfo.code}` : ''}`}
            </Text>
            <Text position={[0, -0.08, 0]} fontSize={0.18} color="#fee2e2" anchorX="center" anchorY="middle">
              {String(errorInfo.message || 'Execution failed.').slice(0, 100)}
            </Text>
          </group>
        </Float>
      )}

      {/* Grid Floor Pedestal Stage */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[Math.max(10, count * 2.2), 0.2, 5.0]} />
        <meshStandardMaterial
          color="#0b1120"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Floating ALU Expression Reactor */}
      {calcInfo && <AluReactor3D calculationInfo={calcInfo} />}

      {/* Floating Decision Diamond for If/Else Branches */}
      {condInfo && <ConditionDecisionGate3D conditionInfo={condInfo} />}

      {/* In-Scene Holographic Terminal Streamer */}
      <HologramTerminalBoard outputStream={outputStream} />

      {/* Render 3D Variable Memory Pedestals */}
      {varEntries.map(([name, val], index) => {
        let posX = 0;
        let posZ = 0;

        if (!isMultiRow) {
          posX = (index - (count - 1) / 2) * spacing;
          posZ = 0;
        } else {
          const row = Math.floor(index / 4);
          const col = index % 4;
          const rowCount = row === 0 ? Math.min(4, count) : count - 4;
          posX = (col - (rowCount - 1) / 2) * spacing;
          posZ = row === 0 ? 0.8 : -1.0;
        }

        const isActive = activeVar === name;
        const valType = varTypes[name] || (typeof val === 'number' ? (Number.isInteger(val) ? 'int' : 'double') : typeof val);
        const isNumeric = typeof val === 'number' && !isNaN(val);

        // Height gauge for numbers (normalized between 0.35 and 2.0)
        let barHeight = 0.5;
        if (isNumeric) {
          if (name.toLowerCase().includes('percentage')) {
            barHeight = Math.max(0.4, Math.min(2.2, (val / 100) * 2.0));
          } else if (name.toLowerCase().includes('total')) {
            barHeight = Math.max(0.4, Math.min(2.4, (val / 300) * 2.2));
          } else {
            barHeight = Math.max(0.35, Math.min(2.0, (val / 100) * 1.8));
          }
        }

        // Color coding
        let baseColor = '#0284c7';
        let emissiveColor = '#0369a1';
        if (isActive) {
          baseColor = '#06b6d4';
          emissiveColor = '#0891b2';
        } else if (name.toLowerCase().includes('total') || name.toLowerCase().includes('percentage')) {
          baseColor = '#f59e0b';
          emissiveColor = '#d97706';
        } else if (typeof val === 'string') {
          baseColor = '#8b5cf6';
          emissiveColor = '#7c3aed';
        }

        const displayVal = typeof val === 'string' ? `"${val}"` : (typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : String(val));

        return (
          <group key={name} position={[posX, 0, posZ]}>
            {/* Active Glow Ring */}
            {isActive && <ActiveVariableHalo color="#00f2fe" />}

            {/* Base Pedestal Cyber Block */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.75, 0.85, 0.18, 24]} />
              <meshStandardMaterial
                color={isActive ? '#0e7490' : '#1e293b'}
                emissive={isActive ? '#06b6d4' : '#0f172a'}
                emissiveIntensity={isActive ? 0.8 : 0.2}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Value Cylinder / Column or Identity Crystal */}
            {isNumeric ? (
              <mesh position={[0, barHeight / 2 + 0.14, 0]}>
                <cylinderGeometry args={[0.38, 0.44, barHeight, 20]} />
                <meshStandardMaterial
                  color={baseColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isActive ? 1.6 : 0.6}
                  metalness={0.3}
                  roughness={0.2}
                  transparent
                  opacity={0.92}
                />
              </mesh>
            ) : (
              <mesh position={[0, 0.6, 0]}>
                <octahedronGeometry args={[0.42, 0]} />
                <meshStandardMaterial
                  color={baseColor}
                  emissive={emissiveColor}
                  emissiveIntensity={isActive ? 1.8 : 0.7}
                  metalness={0.5}
                  roughness={0.2}
                />
              </mesh>
            )}

            {/* Top Light Cap for Cylinder */}
            {isNumeric && (
              <mesh position={[0, barHeight + 0.14, 0]}>
                <cylinderGeometry args={[0.385, 0.385, 0.04, 20]} />
                <meshBasicMaterial color={isActive ? '#a5f3fc' : '#38bdf8'} />
              </mesh>
            )}

            {/* Floating Variable Card & Information Tag */}
            <Float speed={1.8} floatIntensity={0.08}>
              <group position={[0, (isNumeric ? barHeight : 0.8) + 0.7, 0]}>
                {/* Background Glass Pill */}
                <mesh position={[0, 0, -0.02]}>
                  <planeGeometry args={[1.7, 0.72]} />
                  <meshBasicMaterial color="#020617" transparent opacity={0.86} />
                </mesh>
                <mesh position={[0, 0, -0.015]}>
                  <planeGeometry args={[1.74, 0.76]} />
                  <meshBasicMaterial
                    color={isActive ? '#22d3ee' : '#475569'}
                    transparent
                    opacity={isActive ? 0.7 : 0.25}
                    wireframe
                  />
                </mesh>

                {/* Variable Name + Type Pill */}
                <Text
                  position={[0, 0.18, 0]}
                  fontSize={0.16}
                  color={isActive ? '#38bdf8' : '#e2e8f0'}
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  {`${name} (${valType})`}
                </Text>

                {/* Live Value in High Contrast */}
                <Text
                  position={[0, -0.14, 0]}
                  fontSize={0.24}
                  color={isActive ? '#facc15' : '#ffffff'}
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  {displayVal}
                </Text>
              </group>
            </Float>
          </group>
        );
      })}
    </group>
  );
}
