import React from 'react';
import { Play, BookOpen, Clock, HardDrive, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AlgorithmCard({ algorithm, onVisualize, onOpenDetails }) {
  const { isBright } = useTheme();

  if (!algorithm) return null;

  const {
    id,
    name,
    category,
    description,
    complexity = {},
  } = algorithm;

  const timeComplexity = complexity?.time?.average || complexity?.time?.worst || 'O(n)';
  const spaceComplexity = complexity?.space || 'O(1)';

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Sorting':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Searching':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'Data Structures':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${
      isBright
        ? 'bg-white border-slate-200 hover:border-cyan-400 text-slate-800'
        : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 text-slate-100 hover:bg-slate-900/90'
    }`}>
      {/* Top: Category & Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(category)}`}>
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-500 dark:text-cyan-400">
            <Clock size={12} />
            <span>{timeComplexity}</span>
          </div>
        </div>

        <h3 className={`font-bold text-sm leading-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
          {name}
        </h3>

        <p className={`text-xs leading-relaxed line-clamp-2 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
          {description}
        </p>
      </div>

      {/* Bottom: Complexity badges & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Time: <strong className={isBright ? 'text-slate-800' : 'text-slate-300'}>{timeComplexity}</strong></span>
          <span>Space: <strong className={isBright ? 'text-slate-800' : 'text-slate-300'}>{spaceComplexity}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(algorithm)}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                isBright
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title="View algorithmic theory, examples, advantages, and limitations"
            >
              <BookOpen size={12} />
              <span>Details</span>
            </button>
          )}

          <button
            onClick={() => onVisualize(algorithm)}
            className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-sm shadow-cyan-500/20 transition cursor-pointer"
            title="Launch step-by-step 3D WebGL algorithm visualization"
          >
            <Play size={12} fill="currentColor" />
            <span>Visualize ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
}
