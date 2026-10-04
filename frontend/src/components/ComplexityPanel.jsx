import React, { useState } from 'react';
import { Gauge, Clock, HardDrive, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ComplexityGraph from './ComplexityGraph';

export default function ComplexityPanel({ complexity, algorithmName = 'Algorithm' }) {
  const { isBright } = useTheme();
  const [showGraph, setShowGraph] = useState(false);

  const time = complexity?.time || {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  };

  const space = complexity?.space || 'O(1)';
  const stable = complexity?.stable || 'Yes';
  const inPlace = complexity?.inPlace || 'Yes';

  return (
    <div className={`border rounded-xl p-3.5 space-y-3 select-none transition-colors ${
      isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/60 border-slate-800 text-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
          <Clock size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span>Complexity &amp; Attributes</span>
        </div>
        <button
          onClick={() => setShowGraph(!showGraph)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 transition cursor-pointer ${
            showGraph
              ? isBright ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : isBright ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="Toggle Big-O graphical comparison curves"
        >
          <BarChart2 size={12} />
          <span>{showGraph ? 'Hide Graph' : 'Compare Curves'}</span>
          {showGraph ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        {/* Time Best */}
        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Best Time</div>
          <div className={`text-sm font-bold mt-0.5 ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {time.best || 'O(n)'}
          </div>
        </div>

        {/* Time Average */}
        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Avg Time</div>
          <div className={`text-sm font-bold mt-0.5 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>
            {time.average || 'O(n²)'}
          </div>
        </div>

        {/* Time Worst */}
        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Worst Time</div>
          <div className={`text-sm font-bold mt-0.5 ${isBright ? 'text-amber-700' : 'text-amber-400'}`}>
            {time.worst || 'O(n²)'}
          </div>
        </div>

        {/* Space Complexity */}
        <div className={`p-2 rounded-lg border ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[10px] text-slate-500 uppercase font-sans">Space</div>
          <div className={`text-sm font-bold mt-0.5 ${isBright ? 'text-purple-700' : 'text-purple-400'}`}>
            {space}
          </div>
        </div>
      </div>

      {/* Stability & In-Place Badges */}
      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">Stable:</span>
          <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
            stable === 'Yes'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : stable === 'No'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {stable}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold">In-Place:</span>
          <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
            inPlace === 'Yes'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : inPlace === 'No'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {inPlace}
          </span>
        </div>
      </div>

      {/* Expandable Comparison Graph */}
      {showGraph && (
        <div className="pt-2">
          <ComplexityGraph activeComplexity={time.average || 'O(n)'} />
        </div>
      )}
    </div>
  );
}
