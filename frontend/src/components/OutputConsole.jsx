import React, { useState } from 'react';
import { Terminal, Copy, Check, Trophy, Maximize2, Minimize2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OutputConsole({
  output = [],
  correctOutput = null,
  isAtEnd = false,
  input = '',
  currentStep = null,
  executionStatus = null,
  error = null,
  language = 'java',
  executionTimeMs = null,
  inputLabel = 'Input',
  inputHint = null,
  hideInput = false,
}) {
  const { isBright } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    const textToCopy = [...output, correctOutput ? `Correct Output: ${correctOutput}` : ''].filter(Boolean).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const normalizedInput = Array.isArray(input)
    ? input.join(', ')
    : String(input || '').trim();

  const stepLabel = currentStep?.dataStructureState?.label || currentStep?.eventType || '';
  const stepInfo = currentStep?.dataStructureState?.focusInfo || currentStep?.explanation || '';

  return (
    <div className={isExpanded
      ? `fixed inset-4 z-[130] rounded-2xl border shadow-2xl overflow-hidden flex flex-col font-mono text-xs transition-colors duration-200 ${
          isBright
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-900/20'
            : 'bg-[#070b14] border-slate-700/80 text-slate-300 shadow-black/70'
        }`
      : `flex flex-col h-full border-t font-mono text-xs transition-colors duration-200 ${

      isBright
        ? 'bg-slate-50 border-slate-200 text-slate-800'
        : 'bg-[#070b14] border-slate-800/80 text-slate-300'
    }`}>
      {/* Console Header */}
      <div className={`h-9 border-b px-3 flex items-center justify-between transition-colors shrink-0 ${
        isBright
          ? 'bg-white border-slate-200 text-slate-700 shadow-2xs'
          : 'bg-slate-900/90 border-slate-800/80 text-slate-400'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <Terminal size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`text-[11px] font-semibold tracking-wide uppercase truncate ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
            Standard Output Stream
          </span>
          {isAtEnd && (!executionStatus || executionStatus === 'COMPLETED') && (
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
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`p-1 rounded transition flex items-center gap-1 text-[10px] ${
              isBright ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title={isExpanded ? 'Restore Output Stream' : 'Expand Output Stream'}
            aria-label={isExpanded ? 'Restore Output Stream' : 'Expand Output Stream'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          {isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className={`p-1 rounded transition ${
                isBright ? 'hover:bg-rose-50 text-slate-500 hover:text-rose-700' : 'hover:bg-rose-950/50 text-slate-400 hover:text-rose-300'
              }`}
              title="Close expanded Output Stream"
              aria-label="Close expanded Output Stream"
            >
              <X size={12} />
            </button>
          )}
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

        {/* Runtime context: shows the exact input used even when the program
            intentionally prints nothing (e.g. search/insert/return-only code). */}
        <div className={`grid grid-cols-1 ${isExpanded ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-2 mb-2`}>
          {!hideInput && (<div className={`rounded-lg border p-2 ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
            <div className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>{inputLabel}</div>
            <div className={`font-mono text-[11px] break-all ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
              {normalizedInput || 'No stdin supplied'}
            </div>
            {inputHint && <div className={`mt-1 text-[9px] leading-relaxed ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>{inputHint}</div>}
          </div>)}
          <div className={`rounded-lg border p-2 ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
            <div className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Execution</div>
            <div className={`font-mono text-[11px] ${executionStatus === 'COMPLETED' ? 'text-emerald-400' : isBright ? 'text-slate-800' : 'text-slate-200'}`}>
              {executionStatus || '3D simulation'}
              <span className={`ml-2 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>{language.toUpperCase()}</span>
              {Number.isFinite(executionTimeMs) && <span className={`ml-2 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>{executionTimeMs} ms</span>}
            </div>
          </div>
          {isExpanded && (
            <div className={`rounded-lg border p-2 ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'}`}>
              <div className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Current Step</div>
              <div className={`font-mono text-[11px] truncate ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
                {stepLabel || 'Execution ready'}
              </div>
            </div>
          )}
        </div>

        {stepInfo && (
          <div className={`mb-2 rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed ${isBright ? 'bg-cyan-50/60 border-cyan-100 text-slate-600' : 'bg-cyan-950/20 border-cyan-900/40 text-slate-400'}`}>
            <span className="font-bold text-cyan-400">TRACE:</span> {stepInfo}
          </div>
        )}

        {error && (
          <div className="mb-2 rounded-lg border border-rose-500/30 bg-rose-950/20 px-2.5 py-2 text-[10px] text-rose-300">
            <span className="font-bold">ERROR:</span> {error}
          </div>
        )}

        <div className={`text-[9px] uppercase tracking-wider font-bold mb-1 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
          Standard Output
        </div>

        {output.length === 0 && !correctOutput ? (
          <div className={`italic text-[11px] py-1 ${isBright ? 'text-slate-400' : 'text-slate-600'}`}>
            No stdout lines produced by the program.
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
