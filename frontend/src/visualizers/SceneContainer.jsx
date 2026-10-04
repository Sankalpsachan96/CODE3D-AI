import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Grid, Sparkles, ContactShadows, Text, Float } from '@react-three/drei';
import { Compass, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Camera, RefreshCw, Trophy, Sparkles as SparklesIcon, Cpu, Terminal, Eye, Layers, Box, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import OutputHologram3D from './OutputHologram3D';
import DryRunHologram3D from './DryRunHologram3D';
import Dsa2DFallback from './Dsa2DFallback';
import * as THREE from 'three';

/**
 * 3D Conceptual CPU Core Hologram (Section 34)
 * Represents execution core state: Opcode, instruction register, and clock cycle.
 * Clearly presented as an educational abstraction.
 */
function CpuCoreHologram3D({ currentStep, activeCodeLine, visible = true, position = [-6.2, 2.5, 0] }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const { isBright } = useTheme();

  // Opcode detection based on step type, condition, or code
  let opcode = 'EXEC';
  let opcodeColor = '#38bdf8';
  if (currentStep?.condition) {
    opcode = 'CMP';
    opcodeColor = currentStep.condition.result ? '#10b981' : '#f43f5e';
  } else if (currentStep?.changedVariable) {
    opcode = 'STORE';
    opcodeColor = '#f59e0b';
  } else if (activeCodeLine && (activeCodeLine.includes('return') || activeCodeLine.includes('break'))) {
    opcode = 'JMP';
    opcodeColor = '#a855f7';
  } else if (activeCodeLine && (activeCodeLine.includes('System.out') || activeCodeLine.includes('print'))) {
    opcode = 'OUT';
    opcodeColor = '#06b6d4';
  }

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 1.2;
      ringRef.current.rotation.z += delta * 0.6;
    }
  });

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Central Cybernetic CPU Microchip */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.4, 0.35, 1.4]} />
        <meshStandardMaterial
          color={isBright ? '#334155' : '#0f172a'}
          metalness={0.8}
          roughness={0.2}
          emissive={opcodeColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Orbiting Quantum Logic Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.1, 0.025, 16, 32]} />
        <meshBasicMaterial color={opcodeColor} wireframe />
      </mesh>

      {/* Floating Holographic CPU Header & Opcode */}
      <Float speed={3} floatIntensity={0.15}>
        <group position={[0, 0.95, 0]}>
          <Text fontSize={0.22} color={opcodeColor} fontWeight="bold" anchorX="center" anchorY="middle">
            {`[CPU] ${opcode}`}
          </Text>
          <Text position={[0, -0.28, 0]} fontSize={0.13} color="#94a3b8" anchorX="center" anchorY="middle">
            {currentStep?.lineNumber ? `IP: Line ${currentStep.lineNumber}` : 'CYCLE ACTIVE'}
          </Text>
          <Text position={[0, -0.48, 0]} fontSize={0.1} color="#64748b" anchorX="center" anchorY="middle">
            Conceptual Core
          </Text>
        </group>
      </Float>
    </group>
  );
}

/**
 * 3D Decision Gate for if / while / for conditionals (Section 37)
 * Evaluated gate with TRUE (open emerald portal) / FALSE (barrier rose shield).
 */
function ConditionGate3D({ condition, visible = true, position = [0, 4.2, -2.5] }) {
  const gateRef = useRef();

  useFrame((_, delta) => {
    if (gateRef.current) {
      gateRef.current.rotation.y += delta * 0.3;
    }
  });

  if (!visible || !condition) return null;

  const isTrue = !!condition.result;
  const gateColor = isTrue ? '#10b981' : '#f43f5e';

  return (
    <group position={position}>
      {/* 3D Decision Arch Gate */}
      <group ref={gateRef}>
        <mesh position={[-1.2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
          <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
          <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 16]} />
          <meshStandardMaterial color={gateColor} emissive={gateColor} emissiveIntensity={0.8} />
        </mesh>
        {/* Holographic Gate Field */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.3, 1.7]} />
          <meshBasicMaterial
            color={gateColor}
            transparent
            opacity={isTrue ? 0.22 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Floating Gate Text Banner */}
      <Float speed={4} floatIntensity={0.12}>
        <group position={[0, 1.45, 0]}>
          <Text fontSize={0.24} color={gateColor} fontWeight="bold" anchorX="center" anchorY="middle">
            {`GATE: ${isTrue ? 'TRUE (CONTINUE ✓)' : 'FALSE (EXIT ✗)'}`}
          </Text>
          <Text position={[0, -0.28, 0]} fontSize={0.16} color="#e2e8f0" anchorX="center" anchorY="middle">
            {`${condition.expression || ''} => ${condition.evaluation || (isTrue ? 'true' : 'false')}`}
          </Text>
        </group>
      </Float>
    </group>
  );
}

/**
 * 3D Floating Variable Hologram Register Bank (Section 39)
 * Floats live mutated runtime variables in 3D WebGL space.
 */
function VariableHologram3D({ variables = {}, changedVariable = null, visible = true, position = [6.2, 2.5, 0] }) {
  if (!visible) return null;

  const entries = Object.entries(variables || {})
    .filter(([k]) => k !== 'arr' && k !== 'matrix' && k !== 'lang' && k !== 'size' && k !== 'rawInput')
    .slice(0, 6);

  if (entries.length === 0) return null;

  return (
    <group position={position}>
      {/* Holographic Glass Panel Backing */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.8, Math.max(1.6, entries.length * 0.45 + 0.6)]} />
        <meshBasicMaterial color="#080e1e" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments position={[0, 0, -0.04]}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.82, Math.max(1.6, entries.length * 0.45 + 0.6), 0.02)]} />
        <lineBasicMaterial color="#38bdf8" />
      </lineSegments>

      <Text position={[0, (entries.length * 0.45) / 2 + 0.15, 0.05]} fontSize={0.18} color="#38bdf8" fontWeight="bold" anchorX="center">
        LIVE REGISTERS
      </Text>

      {entries.map(([key, val], idx) => {
        const isChanged = changedVariable === key;
        const yPos = (entries.length * 0.45) / 2 - 0.25 - idx * 0.4;
        return (
          <group key={key} position={[0, yPos, 0.05]}>
            <Text
              position={[-1.1, 0, 0]}
              fontSize={0.17}
              color={isChanged ? '#fbbf24' : '#e2e8f0'}
              fontWeight={isChanged ? 'bold' : 'normal'}
              anchorX="left"
              anchorY="middle"
            >
              {`${key} :`}
            </Text>
            <Text
              position={[1.1, 0, 0]}
              fontSize={0.18}
              color={isChanged ? '#34d399' : '#38bdf8'}
              fontWeight="bold"
              anchorX="right"
              anchorY="middle"
            >
              {String(val)}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Handles smooth dynamic camera transitions to preset viewpoints (Top, Front, Isometric, Reset, Zoom In/Out).
 */
function CameraPresetHandler({ preset, onApplied, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!preset) return;
    if (controlsRef?.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
    if (preset === 'top') {
      camera.position.set(0, 18, 0.01);
    } else if (preset === 'front') {
      camera.position.set(0, 2.5, 12);
    } else if (preset === 'iso') {
      camera.position.set(9, 9, 10);
    } else if (preset === 'zoom-in') {
      camera.position.multiplyScalar(0.8);
    } else if (preset === 'zoom-out') {
      camera.position.multiplyScalar(1.25);
    } else if (preset === 'reset') {
      camera.position.set(0, 4.5, 11);
      if (controlsRef?.current) {
        controlsRef.current.reset();
        controlsRef.current.target.set(0, 0, 0);
      }
    }
    camera.lookAt(0, 0, 0);
    if (controlsRef?.current) {
      controlsRef.current.update();
    }
    onApplied();
  }, [preset, camera, onApplied, controlsRef]);

  return null;
}

/**
 * Auto-fits camera distance and OrbitControls target dynamically based on data structure scale
 * Algorithm:
 * - calculate visual dimensions from element count
 * - calculate camera distance based on vertical FOV and horizontal aspect ratio
 * - position camera smoothly without clipping
 * - update OrbitControls limits
 */
function DynamicBoundingCamera({ count = 4, controlsRef }) {
  const { camera, size } = useThree();
  const prevCountRef = useRef(null);

  useEffect(() => {
    if (count === prevCountRef.current) return;
    prevCountRef.current = count;

    const n = Math.max(1, count || 4);
    const spacing = n > 25 ? 1.6 : 2.1;
    const estWidth = Math.max(5.5, (n - 1) * spacing + 3.0);
    const estHeight = 3.8;

    const fovRad = (camera.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(size.height, 1);

    const distV = estHeight / (2 * Math.tan(fovRad / 2));
    const distH = (estWidth / 2) / Math.tan((fovRad * aspect) / 2);
    const targetDist = Math.max(distV, distH, 6.8) * 1.28;

    camera.position.set(0, Math.max(2.8, targetDist * 0.35), Math.max(7.5, targetDist * 0.92));
    camera.lookAt(0, 0, 0);

    if (controlsRef?.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.maxDistance = Math.max(70, targetDist * 3.5);
      controlsRef.current.update();
    }
  }, [count, camera, size, controlsRef]);

  return null;
}

/**
 * SceneContainer provides the 3D viewport canvas, lighting, camera controls,
 * realistic studio cyber-pedestal stage, and 3D verified output hologram.
 */
export default function SceneContainer({
  children,
  currentStep = null,
  code = '',
  statusLabel,
  activeDetails,
  correctOutput = null,
  isAtEnd = false,
  cumulativeOutput = [],
  hoveredBoxInfo = null,
  isFull3DView = false,
  onToggleFull3D,
  onSelectElement = null,
}) {
  const { isBright } = useTheme();
  const [cameraPreset, setCameraPreset] = useState(null);
  const [showHologram, setShowHologram] = useState(true);
  const [showDryRunHologram, setShowDryRunHologram] = useState(false); // Default OFF so 3D objects are 100% visible and unobstructed
  const [isXRayMode, setIsXRayMode] = useState(false);
  const [showCpuCore, setShowCpuCore] = useState(true);
  const [showVariableHolo, setShowVariableHolo] = useState(true);
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [isFallback2D, setIsFallback2D] = useState(false);
  const [webglContextLost, setWebglContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const controlsRef = useRef(null);

  const handleContextLost = (e) => {
    e.preventDefault();
    setWebglContextLost(true);
  };

  const handleContextRestored = () => {
    setWebglContextLost(false);
    setCanvasKey((k) => k + 1);
  };

  const handleResetScene = () => {
    setWebglContextLost(false);
    setCanvasKey((k) => k + 1);
    setCameraPreset('reset');
  };

  // Compute data structure scale to dynamically auto-fit camera distance
  const dsState = currentStep?.dataStructureState;
  const elementCount = dsState?.values?.length ?? dsState?.nodes?.length ?? (dsState?.matrix ? dsState.matrix.length * (dsState.matrix[0]?.length || 1) : 4);

  // Extract the exact line of code currently being executed for the 3D dry run
  const codeLines = code ? code.split('\n') : [];
  const activeCodeLine = (currentStep?.lineNumber && codeLines[currentStep.lineNumber - 1])
    ? codeLines[currentStep.lineNumber - 1].trim()
    : null;

  return (
    <div className={`relative w-full h-full min-h-[360px] overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100' : 'bg-slate-950'
    }`}>
      {/* Top-Left: Sleek, Compact Execution Status Pill & Collapsible Details */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 max-w-[calc(100%-250px)] pointer-events-auto">
        <div className={`flex items-center gap-1.5 backdrop-blur-md border rounded-lg px-2.5 py-1 shadow-md text-xs font-mono transition-colors ${
          isBright ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-slate-200'
        }`}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
            Step {currentStep?.stepNumber || 1}
          </span>
          {currentStep?.lineNumber && (
            <span className={`px-1.5 py-0.2 rounded font-semibold text-[11px] shrink-0 ${
              isBright ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
            }`}>
              Line {currentStep.lineNumber}
            </span>
          )}
          {statusLabel && (
            <span className="truncate text-slate-500 dark:text-slate-400 font-sans text-[11px] hidden sm:inline">
              • {statusLabel}
            </span>
          )}
          {currentStep && (
            <button
              onClick={() => setIsHudExpanded((prev) => !prev)}
              className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold border transition cursor-pointer flex items-center gap-0.5 shrink-0 ${
                isHudExpanded
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : isBright
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Toggle detailed code line & condition breakdown"
            >
              <span>{isHudExpanded ? 'Less' : 'Details'}</span>
              {isHudExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>

        {/* Expanded Dry Run Details Overlay (Drops down only on click, keeping 3D canvas clean) */}
        {isHudExpanded && currentStep && (
          <div className={`backdrop-blur-md border rounded-xl p-2.5 shadow-2xl transition-all animate-fadeIn text-xs max-w-sm sm:max-w-md ${
            isBright ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-900/95 border-cyan-500/30 text-slate-100'
          }`}>
            {/* Active Code Line */}
            {activeCodeLine && (
              <div className={`text-[11px] font-mono px-2 py-0.5 rounded mb-1 flex items-center gap-1.5 border overflow-hidden ${
                isBright ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <span className="text-[10px] uppercase font-bold text-amber-500 shrink-0">Code:</span>
                <span className="truncate font-semibold">{activeCodeLine}</span>
              </div>
            )}

            {/* Condition Check */}
            {currentStep.condition && (
              <div className={`text-[11px] font-mono px-2 py-0.5 rounded mb-1 flex items-center justify-between border ${
                currentStep.condition.result
                  ? isBright ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : isBright ? 'bg-rose-50 text-rose-900 border-rose-300' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                <span className="truncate">If: {currentStep.condition.expression} ({currentStep.condition.evaluation})</span>
                <span className="font-bold shrink-0 ml-1.5">{currentStep.condition.result ? 'TRUE ✓' : 'FALSE ✗'}</span>
              </div>
            )}

            {/* Variables Watch */}
            {currentStep.variables && Object.keys(currentStep.variables).length > 0 && (
              <div className="flex items-center gap-1 flex-wrap text-[10px] font-mono mb-1">
                {Object.entries(currentStep.variables)
                  .filter(([k]) => k !== 'arr' && k !== 'matrix' && k !== 'lang' && k !== 'size')
                  .slice(0, 5)
                  .map(([k, v]) => (
                    <span key={k} className={`px-1.5 py-0.2 rounded border ${
                      currentStep.changedVariable === k
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      {k}: {String(v)}
                    </span>
                  ))}
              </div>
            )}

            {/* Commentary */}
            {currentStep.explanation && (
              <p className={`text-[11px] leading-snug line-clamp-2 ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
                {currentStep.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Top Center: Prominent Verified Correct Output HUD Banner */}
      {correctOutput && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2 backdrop-blur-md border rounded-xl px-3 py-1 shadow-lg transition-all ${
          isAtEnd
            ? 'bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-emerald-950/60 ring-1 ring-emerald-500/30'
            : isBright
              ? 'bg-white/95 border-cyan-300 text-slate-800'
              : 'bg-slate-900/90 border-cyan-500/40 text-cyan-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAtEnd ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`}></span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isAtEnd ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {isAtEnd ? '🏆 Verified Output:' : '⚡ Result:'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold tracking-tight">
            {correctOutput}
          </span>
        </div>
      )}

      {/* Hovered 3D Box HUD Inspector Details */}
      {hoveredBoxInfo && (
        <div className={`absolute bottom-12 left-3 z-10 flex items-center gap-2 backdrop-blur-md border rounded-lg px-3 py-1.5 shadow-lg transition-all animate-fadeIn ${
          isBright ? 'bg-white/95 border-amber-300 text-amber-900' : 'bg-slate-900/90 border-amber-500/40 text-amber-300'
        }`}>
          <span className="text-xs font-bold">🔍 Box Hover:</span>
          <span className="text-xs font-mono font-semibold">{hoveredBoxInfo}</span>
        </div>
      )}

      {/* Top-Right: Neatly Arranged Action Buttons Dock */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {/* Camera Angle Presets Group */}
        <div className={`flex items-center backdrop-blur-md border rounded-lg p-0.5 shadow-md ${
          isBright ? 'bg-white/90 border-slate-200 text-slate-700' : 'bg-slate-900/85 border-slate-800 text-slate-300'
        }`}>
          <button
            onClick={() => setCameraPreset('iso')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'iso' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Isometric 3D Perspective"
          >
            3D
          </button>
          <button
            onClick={() => setCameraPreset('front')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'front' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Front Elevation View"
          >
            Front
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition hover:text-cyan-500 cursor-pointer ${
              cameraPreset === 'top' ? 'bg-cyan-500/20 text-cyan-400 font-bold' : ''
            }`}
            title="Top-Down Plan View"
          >
            Top
          </button>
          <button
            onClick={() => setCameraPreset('zoom-in')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={11} />
          </button>
          <button
            onClick={() => setCameraPreset('zoom-out')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={11} />
          </button>
          <button
            onClick={() => setCameraPreset('reset')}
            className="p-1 rounded text-[11px] transition hover:text-cyan-500 text-slate-400 cursor-pointer"
            title="Reset Camera View"
          >
            <RefreshCw size={11} />
          </button>
        </div>

        {/* X-Ray Mode Toggle Button (Section 41) */}
        <button
          onClick={() => setIsXRayMode((prev) => !prev)}
          className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
            isXRayMode
              ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-violet-950/30'
              : isBright
              ? 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-slate-900/85 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle X-Ray Mode: Expose conceptual memory addresses, references & wireframes"
        >
          <Eye size={12} className={isXRayMode ? 'text-violet-400' : 'text-slate-400'} />
          <span className="hidden md:inline">X-Ray</span>
        </button>

        {/* 3D CPU Core Toggle Button (Section 34) */}
        <button
          onClick={() => setShowCpuCore((prev) => !prev)}
          className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
            showCpuCore
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-cyan-950/30'
              : isBright
              ? 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-slate-900/85 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle 3D Conceptual CPU Execution Core"
        >
          <Cpu size={12} className={showCpuCore ? 'text-cyan-400' : 'text-slate-400'} />
          <span className="hidden md:inline">CPU</span>
        </button>

        {/* 2D / 3D Fallback Mode Toggle */}
        <button
          onClick={() => setIsFallback2D((prev) => !prev)}
          className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
            isFallback2D
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-amber-950/30'
              : isBright
              ? 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-slate-900/85 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Switch between 3D WebGL Scene and Accessible 2D View"
        >
          <Box size={12} className={isFallback2D ? 'text-amber-400' : 'text-slate-400'} />
          <span className="hidden md:inline">{isFallback2D ? '3D View' : '2D View'}</span>
        </button>

        {/* 3D Billboard Toggle Button */}
        <button
          onClick={() => setShowDryRunHologram((prev) => !prev)}
          className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
            showDryRunHologram
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-cyan-950/30'
              : isBright
              ? 'bg-white/90 border-slate-200 text-slate-600 hover:text-slate-900'
              : 'bg-slate-900/85 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle 3D Floating Dry Run Billboard inside 3D Scene"
        >
          <Layers size={12} className={showDryRunHologram ? 'text-cyan-400' : 'text-slate-400'} />
          <span className="hidden md:inline">3D Board</span>
        </button>

        {/* Full 3D Theater Mode Button */}
        {onToggleFull3D && (
          <button
            onClick={onToggleFull3D}
            className={`h-7 px-2 rounded-lg text-xs font-semibold backdrop-blur-md border transition shadow-md cursor-pointer flex items-center gap-1 ${
              isFull3DView
                ? 'bg-purple-600 border-purple-400 text-white shadow-purple-600/30'
                : isBright
                  ? 'bg-white/90 border-slate-200 text-slate-700 hover:text-purple-600 hover:bg-purple-50'
                  : 'bg-slate-900/85 border-slate-800 text-slate-300 hover:text-purple-400 hover:bg-purple-950/40'
            }`}
            title={isFull3DView ? 'Exit Full 3D Theater Mode' : 'Enter Full 3D Theater Mode (Max Screen)'}
          >
            {isFull3DView ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            <span className="hidden lg:inline">{isFull3DView ? 'Exit' : 'Fullscreen'}</span>
          </button>
        )}
      </div>

      {/* 2D Fallback / 3D Canvas Viewport */}
      {isFallback2D || webglContextLost ? (
        <div className="w-full h-full relative">
          {webglContextLost && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <span>WebGL context was lost. Showing 2D fallback.</span>
              <button onClick={handleResetScene} className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold hover:bg-rose-400">
                Retry 3D
              </button>
            </div>
          )}
          <Dsa2DFallback currentStep={currentStep} />
        </div>
      ) : (
        <Canvas
          key={canvasKey}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', handleContextLost, false);
            gl.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);
          }}
          camera={{ position: [0, 3.4, 8.5], fov: 38 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={[isBright ? '#f8fafc' : '#070b14']} />
          
          {/* Dynamic Studio Lighting */}
          <ambientLight intensity={isBright ? 1.3 : 0.85} />
          <directionalLight
            position={[12, 18, 12]}
            intensity={isBright ? 2.0 : 1.6}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-12, 10, -6]} intensity={0.7} color={isBright ? '#0284c7' : '#00f2fe'} />
          <pointLight position={[12, 8, 6]} intensity={0.5} color={isBright ? '#6366f1' : '#818cf8'} />
          <pointLight position={[0, 6, 2]} intensity={0.4} color="#ffffff" />

          <Suspense fallback={null}>
            <CameraPresetHandler
              preset={cameraPreset}
              onApplied={() => setCameraPreset(null)}
              controlsRef={controlsRef}
            />

            <DynamicBoundingCamera
              count={elementCount}
              controlsRef={controlsRef}
            />

            <Center top position={[0, -0.3, 0]}>
              {React.isValidElement(children)
                ? React.cloneElement(children, {
                    isXRayMode,
                    onSelectElement: (idx, val) => {
                      if (onSelectElement) onSelectElement(idx, val);
                    },
                  })
                : children}
            </Center>

            {/* 3D Conceptual CPU Core Hologram (Section 34) */}
            <CpuCoreHologram3D
              currentStep={currentStep}
              activeCodeLine={activeCodeLine}
              visible={showCpuCore}
              position={[-Math.max(5.5, Math.min((elementCount || 4) * 1.05 + 1.5, 12)), 2.0, 0]}
            />

            {/* 3D Decision Gate for Conditionals (Section 37) */}
            <ConditionGate3D
              condition={currentStep?.condition}
              visible={!!currentStep?.condition}
              position={[0, 4.0, -2.8]}
            />

            {/* 3D Floating Variable Hologram Register Bank (Section 39) */}
            <VariableHologram3D
              variables={currentStep?.variables}
              changedVariable={currentStep?.changedVariable}
              visible={showVariableHolo}
              position={[Math.max(5.5, Math.min((elementCount || 4) * 1.05 + 1.5, 12)), 2.0, 0]}
            />

            {/* 3D Full-Code Dynamic Dry Run Hologram (Positioned comfortably behind stage) */}
            <DryRunHologram3D
              currentStep={currentStep}
              activeCodeLine={activeCodeLine}
              visible={showDryRunHologram}
              position={[0, 4.8, -3.2]}
            />

            {/* 3D Correct Output Hologram Banner & Victory Beam (Appears on completion) */}
            {showHologram && isAtEnd && correctOutput && (
              <OutputHologram3D
                correctOutput={correctOutput}
                isAtEnd={isAtEnd}
                totalOutputs={cumulativeOutput?.length || 0}
                recentLine={cumulativeOutput?.[cumulativeOutput.length - 1]}
              />
            )}

            {/* Realistic Cyber Pedestal Stage */}
            <group position={[0, -0.04, 0]}>
              <mesh receiveShadow>
                <cylinderGeometry args={[10.2, 10.8, 0.1, 64]} />
                <meshStandardMaterial
                  color={isBright ? '#e2e8f0' : '#080d1a'}
                  roughness={0.2}
                  metalness={0.85}
                />
              </mesh>
              {/* Primary Glowing Perimeter Ring */}
              <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[10.0, 10.18, 64]} />
                <meshBasicMaterial
                  color={isBright ? '#0284c7' : '#00f2fe'}
                  transparent
                  opacity={0.85}
                />
              </mesh>
              {/* Secondary Inner Cyan Pulsing Ring */}
              <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[7.2, 7.28, 64]} />
                <meshBasicMaterial
                  color={isBright ? '#6366f1' : '#38bdf8'}
                  transparent
                  opacity={0.4}
                />
              </mesh>
            </group>

            {/* Cinematic Ambient Particle Sparkles */}
            <Sparkles
              count={65}
              scale={18}
              size={3.2}
              speed={0.4}
              opacity={isBright ? 0.3 : 0.7}
              color={isBright ? '#0284c7' : '#38bdf8'}
            />

            {/* Soft Grounding Contact Shadows */}
            <ContactShadows
              position={[0, -0.02, 0]}
              opacity={isBright ? 0.5 : 0.85}
              scale={26}
              blur={2.5}
              far={4.8}
              color={isBright ? '#64748b' : '#000000'}
            />

            {/* Floor Depth Grid */}
            <Grid
              position={[0, -0.01, 0]}
              args={[32, 32]}
              cellSize={0.75}
              cellThickness={0.7}
              cellColor={isBright ? '#cbd5e1' : '#1e293b'}
              sectionSize={2.25}
              sectionThickness={1.2}
              sectionColor={isBright ? '#94a3b8' : '#334155'}
              fadeDistance={20}
              fadeStrength={1.5}
            />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.08}
            minDistance={1.8}
            maxDistance={45}
            maxPolarAngle={Math.PI / 2 - 0.02}
          />
        </Canvas>
      )}

      {/* Camera interaction tips */}
      <div className={`absolute bottom-3 left-3 z-10 flex items-center gap-3 text-[11px] backdrop-blur-sm border rounded px-2.5 py-1 transition-colors ${
        isBright
          ? 'bg-white/80 border-slate-200 text-slate-600'
          : 'bg-slate-900/70 border-slate-800/60 text-slate-400'
      }`}>
        <span className="flex items-center gap-1">
          <RotateCw size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Rotate: Left-drag
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ZoomIn size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Zoom: Scroll
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Compass size={11} className={isBright ? 'text-slate-600' : 'text-cyan-400'} /> Pan: Right-drag
        </span>
      </div>
    </div>
  );
}
