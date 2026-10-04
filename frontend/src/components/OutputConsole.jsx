import React, { useState } from 'react';
import { Terminal, Copy, Check, Trophy, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OutputConsole({ output = [], correctOutput = null, isAtEnd = false }) {
  const { isBright } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = [...output, correctOutput ? `Correct Output: ${correctOutput}` : ''].filter(Boolean).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col h-full border-t font-mono text-xs transition-colors duration-200 ${
      isBright
        ? 'bg-slate-50 border-slate-200 text-slate-800'
        : 'bg-[#070b14] border-slate-800/80 text-slate-300'
    }`}>
      {/* Console Header */}
      <div className={`h-8 border-b px-3 flex items-center justify-between transition-colors shrink-0 ${
        isBright
          ? 'bg-white border-slate-200 text-slate-700 shadow-2xs'
          : 'bg-slate-900/90 border-slate-800/80 text-slate-400'
      }`}>
        <div className="flex items-center gap-2">
          <Terminal size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`text-[11px] font-semibold tracking-wide uppercase ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
            Standard Output Stream
          </span>
          {isAtEnd && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              ✓ Process Finished (0)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
            {output.length} line(s) printed
          </span>
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition hover:text-cyan-400 flex items-center gap-1 text-[10px] ${
              isBright ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Copy Output Console"
          >
            {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Output Content Stream */}
      <div className={`flex-1 p-3 overflow-y-auto space-y-1.5 font-mono select-text transition-colors ${
        isBright ? 'bg-white' : 'bg-[#070b14]'
      }`}>
        <div className={`text-[11px] select-none ${isBright ? 'text-slate-400' : 'text-slate-600'}`}>
          $ code3d-run --target=3D --interactive
        </div>

        {output.length === 0 && !correctOutput ? (
          <div className={`italic text-[11px] py-1 ${isBright ? 'text-slate-400' : 'text-slate-600'}`}>
            Program executing in 3D WebGL space... No standard output lines produced yet.
          </div>
        ) : (
          output.map((line, idx) => (
            <div key={idx} className={`flex items-start gap-2 text-xs leading-relaxed ${
              isBright ? 'text-slate-800 font-medium' : 'text-slate-200'
            }`}>
              <span className={`select-none text-[10px] mt-0.5 ${isBright ? 'text-cyan-600' : 'text-cyan-400'}`}>&gt;</span>
              <span>{line}</span>
            </div>
          ))
        )}

        {/* Highlighted Verified Correct Output Banner */}
        {correctOutput && (
          <div className={`mt-2 p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all animate-fadeIn ${
            isAtEnd
              ? isBright
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-sm'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
              : isBright
                ? 'bg-cyan-50/90 border-cyan-300 text-cyan-900'
                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2">
              <Trophy size={14} className={isAtEnd ? 'text-emerald-500' : 'text-cyan-400 animate-pulse'} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">
                  {isAtEnd ? '🏆 Verified Correct Output' : '⚡ Current Result'}
                </span>
                <span className="text-xs font-bold font-mono mt-0.5 block">
                  {correctOutput}
                </span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
              isAtEnd
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30'
            }`}>
              {isAtEnd ? 'VERIFIED ✓' : 'COMPUTING'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
