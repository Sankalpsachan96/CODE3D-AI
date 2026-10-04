import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Gauge,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Timeline({
  currentStepIndex,
  totalSteps,
  isPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onReset,
  onGoToStep,
  onGoToFirst,
  onGoToLast,
  isAtStart,
  isAtEnd,
  isCodeDirty = false,
  currentStep = null,
  trace = [],
}) {
  const { isBright } = useTheme();
  const speeds = [0.25, 0.5, 1, 1.5, 2, 4];
  const stepListRef = useRef(null);

  // Auto-scroll the active step node into view
  useEffect(() => {
    if (!stepListRef.current) return;
    const activeNode = stepListRef.current.querySelector(`[data-step-index="${currentStepIndex}"]`);
    if (activeNode) {
      activeNode.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentStepIndex]);

  return (
    <div className={`border-t px-4 py-2 select-none flex flex-col gap-1.5 transition-colors ${
      isBright
        ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
        : 'bg-[#070b14]/95 border-slate-800/90 text-slate-200'
    }`}>
      {/* Top Bar: Playback Controls, Active Step Info & Speed Switcher */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Playback Buttons Group (First, Prev, Play/Pause, Next, Last, Reset) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* First Step */}
          {onGoToFirst && (
            <button
              onClick={onGoToFirst}
              disabled={isAtStart || totalSteps <= 1}
              className={`p-1.5 rounded-lg border transition ${
                isAtStart || totalSteps <= 1
                  ? isBright ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-700 cursor-not-allowed'
                  : isBright ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="First Step (Step 1)"
            >
              <ChevronsLeft size={14} />
            </button>
          )}

          {/* Previous Step */}
          <button
            onClick={onPrev}
            disabled={isAtStart || totalSteps <= 1}
            className={`p-1.5 rounded-lg border transition ${
              isAtStart || totalSteps <= 1
                ? isBright ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-700 cursor-not-allowed'
                : isBright ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
            }`}
            title="Step Back"
          >
            <SkipBack size={14} />
          </button>

          {/* Play / Pause */}
          {isPlaying ? (
            <button
              onClick={onPause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                isBright
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title="Pause Simulation"
            >
              <Pause size={14} className="fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={totalSteps <= 1}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-md cursor-pointer ${
                totalSteps <= 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-400'
                  : isCodeDirty
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/40 animate-pulse'
                  : isBright
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-600/30'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
              }`}
              title={isCodeDirty ? 'Execute modified code in 3D (Ctrl+Enter)' : isAtEnd ? 'Replay Simulation' : 'Play Simulation'}
            >
              <Play size={14} className="fill-current" />
              <span>{isCodeDirty ? 'Run ⚡' : isAtEnd ? 'Replay' : 'Play'}</span>
            </button>
          )}

          {/* Next Step */}
          <button
            onClick={onNext}
            disabled={isAtEnd || totalSteps <= 1}
            className={`p-1.5 rounded-lg border transition ${
              isAtEnd || totalSteps <= 1
                ? isBright ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-700 cursor-not-allowed'
                : isBright ? 'border-cyan-500 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 cursor-pointer' : 'border-cyan-600/70 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 cursor-pointer'
            }`}
            title="Step Forward"
          >
            <SkipForward size={14} />
          </button>

          {/* Last Step */}
          {onGoToLast && (
            <button
              onClick={onGoToLast}
              disabled={isAtEnd || totalSteps <= 1}
              className={`p-1.5 rounded-lg border transition ${
                isAtEnd || totalSteps <= 1
                  ? isBright ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-800 text-slate-700 cursor-not-allowed'
                  : isBright ? 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer' : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer'
              }`}
              title="Last Step"
            >
              <ChevronsRight size={14} />
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isBright
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Reset to Step 1"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Current Step Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <Clock size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`text-xs font-semibold tracking-wider uppercase ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
            Step
          </span>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
            isBright
              ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
              : 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
          }`}>
            {totalSteps > 0 ? currentStepIndex + 1 : 0} / {totalSteps}
          </span>
          {currentStep?.eventType && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border hidden sm:inline ${
              isBright ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {currentStep.eventType}
            </span>
          )}
        </div>

        {/* Playback Speed Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Gauge size={13} className={isBright ? 'text-slate-400' : 'text-slate-500'} />
          <span className={`text-[11px] mr-0.5 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition cursor-pointer ${
                playbackSpeed === s
                  ? isBright
                    ? 'bg-cyan-100 text-cyan-800 border border-cyan-400 font-bold'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrubber Progress Slider */}
      <div className="relative flex items-center w-full px-1">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onGoToStep(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
        />
      </div>

      {/* Horizontally Scrollable Step Badges List for High-Density Traces */}
      {totalSteps > 0 && (
        <div
          ref={stepListRef}
          className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth no-scrollbar"
        >
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const stepObj = trace && trace[idx];

            return (
              <button
                key={idx}
                data-step-index={idx}
                onClick={() => onGoToStep(idx)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono shrink-0 border transition-all cursor-pointer ${
                  isActive
                    ? isBright
                      ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow-sm scale-105'
                      : 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-500/30 scale-105'
                    : isCompleted
                    ? isBright
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100'
                      : 'bg-slate-900/90 text-cyan-400 border-cyan-900/50 hover:bg-slate-800'
                    : isBright
                    ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-slate-300'
                }`}
                title={`Jump to Step ${idx + 1}${stepObj?.explanation ? `: ${stepObj.explanation}` : ''}`}
              >
                <span>{idx + 1}</span>
                {stepObj?.lineNumber && (
                  <span className="opacity-70 text-[9px]">L{stepObj.lineNumber}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
