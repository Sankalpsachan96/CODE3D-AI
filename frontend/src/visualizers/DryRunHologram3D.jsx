import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';

/**
 * DryRunHologram3D
 *
 * Renders a futuristic 3D holographic dry-run board inside the 3D WebGL scene.
 * Visualizes the currently executing line of code, live variable mutation registry,
 * condition evaluation, and algorithm commentary in 3D space.
 */
export default function DryRunHologram3D({
  currentStep,
  activeCodeLine = null,
  position = [0, 4.2, -1.5],
  visible = true,
}) {
  const panelRef = useRef();

  useFrame((_, delta) => {
    if (panelRef.current) {
      panelRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.04;
    }
  });

  if (!visible || !currentStep) return null;

  const lineNumber = currentStep.lineNumber || null;
  const eventType = (currentStep.eventType || 'EXECUTION_STEP').replace(/_/g, ' ');
  const explanation = currentStep.explanation || 'Stepping through code execution...';
  const cleanExplanation = explanation.length > 75 ? explanation.slice(0, 72) + '...' : explanation;

  // Format variables watch list: e.g. "i: 1 | j: 2 | temp: 45"
  const vars = currentStep.variables || {};
  const varEntries = Object.entries(vars)
    .filter(([k]) => k !== 'arr' && k !== 'matrix' && k !== 'lang' && k !== 'size')
    .slice(0, 4)
    .map(([k, v]) => `${k}=${v}`);
  const varString = varEntries.length > 0 ? varEntries.join('  •  ') : 'Scanning registers...';

  // Format condition evaluation if present
  const cond = currentStep.condition;
  const condText = cond
    ? `${cond.expression || ''} (${cond.evaluation || ''}) → ${cond.result ? 'TRUE ✓' : 'FALSE ✗'}`
    : null;

  const cleanCode = activeCodeLine
    ? (activeCodeLine.length > 52 ? activeCodeLine.slice(0, 49) + '...' : activeCodeLine)
    : null;

  // Calculate dynamic hologram billboard height
  let boardHeight = 1.35;
  if (condText && cleanCode) boardHeight = 1.95;
  else if (condText || cleanCode) boardHeight = 1.65;

  const topY = boardHeight / 2 - 0.2;

  return (
    <group position={position} ref={panelRef}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Float speed={2} rotationIntensity={0.04} floatIntensity={0.15}>
          {/* Main 3D Hologram Glass Plate */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[5.2, boardHeight]} />
            <meshStandardMaterial
              color="#041226"
              emissive="#0284c7"
              emissiveIntensity={0.45}
              transparent
              opacity={0.8}
              roughness={0.15}
              metalness={0.8}
            />
          </mesh>

          {/* Neon Border Outline */}
          <lineSegments position={[0, 0, -0.04]}>
            <edgesGeometry
              args={[new THREE.BoxGeometry(5.22, boardHeight + 0.02, 0.02)]}
            />
            <lineBasicMaterial color="#00f2fe" linewidth={2} />
          </lineSegments>

          {/* Top Header Bar: Step Number & Event Type */}
          <Text
            position={[-2.3, topY, 0.05]}
            fontSize={0.14}
            color="#38bdf8"
            anchorX="left"
            anchorY="middle"
            fontWeight="bold"
          >
            {`⚡ DRY RUN [STEP ${currentStep.stepNumber || 1}] • ${eventType}`}
          </Text>

          {lineNumber && (
            <Text
              position={[2.3, topY, 0.05]}
              fontSize={0.14}
              color="#fbbf24"
              anchorX="right"
              anchorY="middle"
              fontWeight="bold"
            >
              {`LINE ${lineNumber}`}
            </Text>
          )}

          {/* Center-Top: Live Variable State Watch */}
          <Text
            position={[0, topY - 0.32, 0.05]}
            fontSize={0.17}
            color="#34d399"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {varString}
          </Text>

          {/* Active Executing Code Line (If present) */}
          {cleanCode && (
            <Text
              position={[0, topY - 0.62, 0.05]}
              fontSize={0.14}
              color="#fbbf24"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {`> ${cleanCode}`}
            </Text>
          )}

          {/* Condition Evaluation (If present) */}
          {condText && (
            <Text
              position={[0, cleanCode ? topY - 0.92 : topY - 0.62, 0.05]}
              fontSize={0.13}
              color={cond.result ? '#a7f3d0' : '#fca5a5'}
              anchorX="center"
              anchorY="middle"
              fontStyle="italic"
            >
              {condText}
            </Text>
          )}

          {/* Bottom Commentary & Execution Detail */}
          <Text
            position={[0, -boardHeight / 2 + 0.22, 0.05]}
            fontSize={0.125}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
            maxWidth={4.9}
            textAlign="center"
          >
            {cleanExplanation}
          </Text>
        </Float>
      </Billboard>
    </group>
  );
}
