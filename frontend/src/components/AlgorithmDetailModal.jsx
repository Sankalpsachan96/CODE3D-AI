import React, { useState } from 'react';
import { X, BookOpen, Clock, CheckCircle2, AlertTriangle, Play, Code2, Copy, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ComplexityGraph from './ComplexityGraph';

export default function AlgorithmDetailModal({ isOpen, onClose, algorithm, onLaunchVisualization }) {
  const { isBright } = useTheme();
  const [selectedLang, setSelectedLang] = useState('java');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !algorithm) return null;

  const {
    name = 'Algorithm',
    category = 'Algorithm',
    description = '',
    howItWorks = '',
    example = '',
    complexity = {},
    advantages = [],
    limitations = [],
    code = {},
  } = algorithm;

  const activeCode = code[selectedLang] || code.java || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isBright ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-sm">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-base ${isBright ? 'text-slate-900' : 'text-white'}`}>{name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLaunchVisualization && (
              <button
                onClick={() => {
                  onLaunchVisualization(algorithm);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
              >
                <Play size={13} fill="currentColor" />
                <span>Launch in 3D</span>
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isBright ? 'hover:bg-slate-200 border-slate-300' : 'hover:bg-slate-800 border-slate-700'
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* What is it? */}
          <section className="space-y-1">
            <h3 className={`font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400`}>
              What is it?
            </h3>
            <p className={`${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              {description}
            </p>
          </section>

          {/* How it works */}
          <section className="space-y-1">
            <h3 className={`font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400`}>
              How It Works
            </h3>
            <p className={`${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              {howItWorks}
            </p>
          </section>

          {/* Example */}
          {example && (
            <section className={`p-3 rounded-xl border font-mono text-[11px] ${
              isBright ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-cyan-300'
            }`}>
              <div className="text-[10px] font-sans font-bold uppercase text-slate-500 mb-1">Concrete Example</div>
              <div>{example}</div>
            </section>
          )}

          {/* Complexity Matrix */}
          <section className="space-y-2">
            <h3 className={`font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400`}>
              Complexity Analysis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className={`p-2.5 rounded-xl border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="text-[10px] font-sans text-slate-500 uppercase">Best Time</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">{complexity?.time?.best || 'O(n)'}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="text-[10px] font-sans text-slate-500 uppercase">Average Time</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">{complexity?.time?.average || 'O(n²)'}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="text-[10px] font-sans text-slate-500 uppercase">Worst Time</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">{complexity?.time?.worst || 'O(n²)'}</div>
              </div>
              <div className={`p-2.5 rounded-xl border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <div className="text-[10px] font-sans text-slate-500 uppercase">Space</div>
                <div className="text-sm font-bold text-purple-400 mt-0.5">{complexity?.space || 'O(1)'}</div>
              </div>
            </div>
            <div className="flex gap-4 pt-1 font-mono text-[11px] text-slate-400">
              <div>Stable: <strong className="text-emerald-400">{complexity?.stable || 'Yes'}</strong></div>
              <div>In-Place: <strong className="text-emerald-400">{complexity?.inPlace || 'Yes'}</strong></div>
            </div>
          </section>

          {/* Big-O Graph */}
          <ComplexityGraph activeComplexity={complexity?.time?.average || 'O(n²)'} />

          {/* Advantages & Limitations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Advantages */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isBright ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
            }`}>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Advantages</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-300">
                {advantages.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>

            {/* Limitations */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isBright ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-500/30'
            }`}>
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                <span>Limitations</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-300">
                {limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reference Source Code Tabs */}
          {activeCode && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  <Code2 size={14} />
                  <span>Reference Implementation</span>
                </div>
                <div className="flex items-center gap-1">
                  {['java', 'python', 'cpp', 'javascript'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border transition cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : isBright ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {lang === 'javascript' ? 'JS' : lang}
                    </button>
                  ))}
                  <button
                    onClick={handleCopy}
                    className={`ml-2 p-1 rounded border text-[10px] flex items-center gap-1 cursor-pointer ${
                      copied ? 'bg-emerald-500 text-white border-emerald-400' : isBright ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className={`p-3 rounded-xl border font-mono text-[11px] overflow-x-auto ${
                isBright ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <pre>{activeCode}</pre>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
