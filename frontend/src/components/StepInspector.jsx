import React from 'react';
import { Cpu, Variable, Layers, CheckCircle2, ArrowRight, CornerDownRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function StepInspector({ currentStep, totalSteps }) {
  const { isBright } = useTheme();

  if (!currentStep) return null;

  const {
    stepNumber,
    lineNumber,
    eventType = 'STEP',
    variables = {},
    condition = null,
    metadata = {},
    dataStructure = currentStep.dataStructureState || {},
    output = [],
  } = currentStep;

  const operation = metadata?.operation || eventType || 'STEP';
  const comparedIndices = metadata?.comparedIndices || dataStructure?.comparedIndices || [];
  const swappedIndices = metadata?.swappedIndices || dataStructure?.swappedIndices || [];
  const activeIndex = metadata?.activeIndex ?? dataStructure?.activeIndex ?? null;
  const values = Array.isArray(dataStructure?.values) ? dataStructure.values : [];

  const getOperationBadgeColor = (op) => {
    switch (op) {
      case 'COMPARE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SWAP':
      case 'PARTITION_SWAP':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'SELECT':
      case 'SET_MIN':
      case 'PICK_KEY':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'INSERT':
      case 'INSERT_KEY':
      case 'SHIFT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'MERGE':
      case 'BEGIN_MERGE':
      case 'MERGE_WRITE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'PARTITION':
      case 'SELECT_PIVOT':
      case 'PLACE_PIVOT':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      case 'SORTED':
      case 'COMPLETE':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'FOUND':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'NOT_FOUND':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className={`border rounded-xl p-3.5 space-y-3 select-none transition-colors text-xs ${
      isBright ? 'bg-white border-slate-200 text-slate-800 shadow-xs' : 'bg-slate-900/60 border-slate-800 text-slate-200'
    }`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className="font-bold text-xs uppercase tracking-wider">Step Inspector</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${
            isBright ? 'bg-cyan-50 border-cyan-300 text-cyan-800' : 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
          }`}>
            STEP {stepNumber} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Operation & Line Number row */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Operation</div>
          <div className="mt-1">
            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border inline-block ${getOperationBadgeColor(operation)}`}>
              {operation}
            </span>
          </div>
        </div>

        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Source Line</div>
          <div className={`font-mono font-bold text-xs mt-1 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>
            {lineNumber ? `Line ${lineNumber}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Comparison Detail if Active */}
      {condition && (
        <div className={`p-2.5 rounded-lg border font-mono ${
          isBright ? 'bg-amber-50/70 border-amber-200 text-slate-800' : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
        }`}>
          <div className="text-[10px] font-sans font-semibold uppercase text-amber-600 dark:text-amber-400 mb-1">
            Comparison Evaluation
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>{condition.expression}</span>
            <span className="font-bold text-cyan-400">{condition.evaluation}</span>
          </div>
          <div className="text-[10px] mt-1 pt-1 border-t border-amber-300/30 flex items-center justify-between">
            <span className="opacity-75">Result:</span>
            <span className={`font-bold ${condition.result ? 'text-emerald-400' : 'text-rose-400'}`}>
              {condition.result ? 'TRUE' : 'FALSE'} ({condition.branch || ''})
            </span>
          </div>
        </div>
      )}

      {/* Variables & Indices */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold flex items-center gap-1">
          <Variable size={11} /> Variables in Scope
        </div>
        <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
          {Object.entries(variables)
            .filter(([k]) => k !== 'arr' && k !== 'stack' && k !== 'queue')
            .map(([k, v]) => (
              <span
                key={k}
                className={`px-2 py-0.5 rounded border ${
                  isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-cyan-500 font-semibold">{k}</span> = {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            ))}
        </div>
      </div>

      {/* Active Array Slots */}
      {values.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold flex items-center gap-1">
            <Layers size={11} /> Array State ({values.length} items)
          </div>
          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
            {values.map((val, idx) => {
              const isComp = comparedIndices.includes(idx);
              const isSwap = swappedIndices.includes(idx);
              const isAct = activeIndex === idx;

              let style = isBright ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400';
              if (isSwap) {
                style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
              } else if (isComp) {
                style = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
              } else if (isAct) {
                style = 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold';
              }

              return (
                <div key={idx} className={`px-1.5 py-0.5 rounded border transition ${style}`}>
                  <span className="opacity-60">[{idx}]:</span> {val}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      {Array.isArray(output) && output.length > 0 && (
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Terminal Output</div>
          <div className={`p-2 rounded font-mono text-[10px] border ${
            isBright ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-black/60 border-slate-800 text-emerald-400'
          }`}>
            {output.map((line, idx) => (
              <div key={idx}>&gt; {line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
