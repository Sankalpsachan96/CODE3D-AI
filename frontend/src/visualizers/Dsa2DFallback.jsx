/**
 * CODE3D-AI - 2D Accessible Fallback Visualizer
 * 
 * Provides a clean SVG/HTML 2D visualization when WebGL is unavailable,
 * lost, or when user chooses 2D mode. Satisfies Section 34 & 38 (Accessibility).
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Box, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Dsa2DFallback({ currentStep }) {
  const { isBright } = useTheme();

  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <Box size={36} className="mb-2 opacity-50" />
        <p className="text-xs font-mono">No active execution state.</p>
      </div>
    );
  }

  const ds = currentStep.dataStructureState || {};
  const type = (ds.type || 'array').toLowerCase();
  const values = ds.values || [];
  const activeIdx = ds.activeIndex;
  const prevIdx = ds.previousIndex;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-6 overflow-auto ${
      isBright ? 'bg-slate-50 text-slate-800' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 2D Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          2D Accessible View ({type.toUpperCase()})
        </span>
        <span className="text-xs text-slate-400 font-mono">
          Step {currentStep.stepNumber} • Line {currentStep.lineNumber}
        </span>
      </div>

      {/* Render based on data structure */}
      {type === 'array' || type === 'sorting' || type === 'searching' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-2 p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl max-w-full overflow-x-auto">
            {values.map((val, idx) => {
              const isActive = idx === activeIdx;
              const isPrev = idx === prevIdx;

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-12 h-16 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all border ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 scale-105 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-400'
                        : isPrev
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : isBright
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    [{idx}]
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-bold text-cyan-400 animate-bounce">
                      ▲
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Text summary for screen readers & accessibility */}
          <div className="mt-4 p-3 rounded-lg border border-slate-800/80 bg-slate-900/40 max-w-lg text-center text-xs font-mono text-slate-300">
            {currentStep.explanation || `Array state: [${values.join(', ')}]`}
          </div>
        </div>
      ) : type === 'matrix' ? (
        <div className="flex flex-col items-center gap-2">
          {(ds.matrix || [[1, 2], [3, 4]]).map((row, r) => (
            <div key={r} className="flex gap-2">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-xs font-bold ${
                    isBright ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700 text-cyan-300'
                  }`}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        /* Universal / Stack / Linked List fallback representation */
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 font-mono text-xs text-cyan-200 font-bold">
                {String(v)}
              </div>
              {i < values.length - 1 && <ArrowRight size={12} className="text-slate-500" />}
            </div>
          ))}
        </div>
      )}

      {/* Accessible textual equivalent */}
      <div className="sr-only" aria-live="polite">
        Current step {currentStep.stepNumber}, line {currentStep.lineNumber}.
        {currentStep.explanation}
      </div>
    </div>
  );
}
