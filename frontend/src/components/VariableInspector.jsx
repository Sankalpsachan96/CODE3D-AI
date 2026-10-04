import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Cpu, Sparkles, Hash, Type, Brackets } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'string') return `"${val}"`;
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function getTypeIcon(val) {
  if (typeof val === 'number') return <Hash size={11} className="text-cyan-400" />;
  if (typeof val === 'string') return <Type size={11} className="text-emerald-400" />;
  if (Array.isArray(val)) return <Brackets size={11} className="text-purple-400" />;
  return <Sparkles size={11} className="text-amber-400" />;
}

export default function VariableInspector({ variables = {}, scope = 'main', changedVariable = null }) {
  const { isBright } = useTheme();
  const [expandedArrays, setExpandedArrays] = useState({});

  const toggleArray = (name) => {
    setExpandedArrays((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const entries = Object.entries(variables || {});

  return (
    <div className={`p-3.5 rounded-xl border select-none transition-colors ${
      isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
          <Cpu size={14} />
          <span>Variable Inspector</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          scope: {scope}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-4 text-center text-slate-500 text-xs italic">
          No active variables in current frame.
        </div>
      ) : (
        <div className="space-y-1.5 font-mono text-xs">
          {entries.map(([name, val], index) => {
            const isChanged = changedVariable === name;
            const isArray = Array.isArray(val);
            const isExpanded = expandedArrays[name];

            return (
              <div
                key={name}
                className={`p-2 rounded-lg border transition-all ${
                  isChanged
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-xs shadow-amber-500/20'
                    : isBright
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/60 border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isArray ? (
                      <button
                        onClick={() => toggleArray(name)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                    ) : (
                      getTypeIcon(val)
                    )}

                    <span className="font-bold text-slate-200">{name}</span>
                    <span className="text-slate-500 text-[10px] font-sans">
                      ({typeof val === 'object' ? (isArray ? `arr[${val.length}]` : 'obj') : typeof val})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isChanged && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-bold bg-amber-500 text-slate-950 animate-pulse">
                        UPDATED
                      </span>
                    )}
                    <span className={`font-bold ${isChanged ? 'text-amber-300' : 'text-cyan-300'}`}>
                      {isArray ? `Array (${val.length})` : formatValue(val)}
                    </span>
                  </div>
                </div>

                {/* Expandable array slots */}
                {isArray && isExpanded && (
                  <div className="mt-2 pl-4 pt-2 border-t border-slate-800 space-y-1">
                    {val.map((elem, slotIdx) => (
                      <div key={slotIdx} className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>[{slotIdx}]:</span>
                        <span className="font-bold text-slate-200">{String(elem)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
