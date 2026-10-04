import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Trophy, CheckCircle2, Circle, ChevronRight, ArrowLeft, Play, Clock3, Database, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { STRIVER_DAYS, STRIVER_PROBLEMS } from '../utils/striverCatalog';
import { buildStarterCode, buildProblemMeta } from '../utils/striverProblemUtils';

const STATUS_KEY = 'code3d_striver_status_v3';

export default function StriverSheetDrawer({ isOpen, onToggle, onSelectProblem, currentLanguage = 'java' }) {
  const { isBright } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('All Days (180+)');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    try { setStatusMap(JSON.parse(localStorage.getItem(STATUS_KEY) || '{}')); } catch { setStatusMap({}); }
  }, [isOpen]);

  const filtered = useMemo(() => STRIVER_PROBLEMS.filter((p) => {
    if (selectedDay !== 'All Days (180+)' && p.day !== selectedDay) return false;
    if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return `${p.id} ${p.title} ${p.category} ${p.description}`.toLowerCase().includes(q);
  }), [searchQuery, selectedDay, selectedDifficulty]);

  const solvedCount = useMemo(() => Object.values(statusMap).filter(v => v?.status === 'SOLVED').length, [statusMap]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 px-3 py-3 rounded-r-xl border shadow-xl font-mono text-xs font-bold ${isBright ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-amber-300'}`}>
        <Trophy size={16} />
      </button>
    );
  }

  const openProblem = (p) => { setSelectedProblem(p); setShowSolution(false); };
  const solve = (p) => {
    const starterCode = buildStarterCode(p, currentLanguage);
    onSelectProblem({ ...p, starterCode, code: starterCode, language: currentLanguage, ...buildProblemMeta(p) });
    onToggle?.();
  };

  return (
    <div className="fixed inset-0 top-14 z-[60] bg-black/70 backdrop-blur-sm flex">
      <div className={`w-full h-full flex flex-col ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#060a12] text-slate-100'}`}>
        <header className={`h-16 shrink-0 border-b flex items-center justify-between px-5 ${isBright ? 'bg-white border-slate-200' : 'bg-[#0b0f19] border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white"><Trophy size={18}/></div>
            <div><h2 className="font-bold">Striver SDE Sheet</h2><p className="text-[11px] opacity-60">{STRIVER_PROBLEMS.length} interview problems · {solvedCount} solved</p></div>
          </div>
          <button onClick={onToggle} className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800"><X size={18}/></button>
        </header>

        <div className="flex flex-1 min-h-0">
          <aside className={`w-[360px] shrink-0 border-r flex flex-col ${isBright ? 'bg-white border-slate-200' : 'bg-[#080d17] border-slate-800'}`}>
            <div className="p-3 space-y-2 border-b border-inherit">
              <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search problems..." className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs outline-none ${isBright ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'}`}/></div>
              <div className="flex gap-2"><select value={selectedDay} onChange={e=>setSelectedDay(e.target.value)} className={`flex-1 rounded-lg border px-2 py-2 text-[11px] ${isBright ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'}`}>{STRIVER_DAYS.map(d=><option key={d}>{d}</option>)}</select><select value={selectedDifficulty} onChange={e=>setSelectedDifficulty(e.target.value)} className={`w-28 rounded-lg border px-2 text-[11px] ${isBright ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700'}`}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filtered.map(p => {
                const status = statusMap[p.id]?.status;
                return <button key={p.id} onClick={()=>openProblem(p)} className={`w-full text-left p-3 rounded-lg mb-1 border transition ${selectedProblem?.id===p.id ? (isBright?'bg-cyan-50 border-cyan-300':'bg-cyan-500/10 border-cyan-500/40') : (isBright?'border-transparent hover:bg-slate-100':'border-transparent hover:bg-slate-900')}`}>
                  <div className="flex items-start gap-2"><div className="pt-0.5">{status==='SOLVED'?<CheckCircle2 size={15} className="text-emerald-500"/>:<Circle size={15} className="opacity-40"/>}</div><div className="min-w-0 flex-1"><div className="text-xs font-semibold truncate">{p.title}</div><div className="mt-1 flex gap-2 text-[10px] opacity-60"><span>{p.category}</span><span>·</span><span>{p.difficulty}</span></div></div><ChevronRight size={14} className="opacity-40 mt-0.5"/></div>
                </button>;
              })}
            </div>
          </aside>

          <main className="flex-1 min-w-0 overflow-y-auto">
            {!selectedProblem ? (
              <div className="h-full flex items-center justify-center p-8 text-center"><div className="max-w-lg"><Trophy size={42} className="mx-auto text-amber-500 mb-4"/><h3 className="text-2xl font-bold">Choose a problem to start</h3><p className="mt-2 text-sm opacity-60">Select a question from the sheet. You will see the statement first; the solution is never pre-filled.</p></div></div>
            ) : (
              <div className="max-w-4xl mx-auto p-8 space-y-6">
                <button onClick={()=>setSelectedProblem(null)} className="inline-flex items-center gap-2 text-xs opacity-60 hover:opacity-100"><ArrowLeft size={14}/> Back to problems</button>
                <div className="flex items-start justify-between gap-5"><div><div className="text-[11px] uppercase tracking-wider text-cyan-500 font-bold">{selectedProblem.day} · {selectedProblem.category}</div><h1 className="text-3xl font-extrabold mt-1">{selectedProblem.title}</h1><div className="flex items-center gap-3 mt-3 text-xs opacity-70"><span className="px-2 py-1 rounded border border-inherit">{selectedProblem.difficulty}</span><span className="flex items-center gap-1"><Clock3 size={13}/>{selectedProblem.timeComplexity}</span><span className="flex items-center gap-1"><Database size={13}/>{selectedProblem.spaceComplexity}</span></div></div><button onClick={()=>solve(selectedProblem)} className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg"><Play size={15} fill="currentColor"/> Solve in Editor</button></div>
                <section className={`rounded-2xl border p-6 ${isBright?'bg-white border-slate-200':'bg-slate-900/50 border-slate-800'}`}><h2 className="font-bold mb-3">Problem</h2><p className="text-sm leading-7 opacity-85">{selectedProblem.description}</p></section>
                <section className={`rounded-2xl border p-6 ${isBright?'bg-white border-slate-200':'bg-slate-900/50 border-slate-800'}`}><h2 className="font-bold mb-3">Example</h2><div className={`rounded-xl p-4 font-mono text-xs ${isBright?'bg-slate-50':'bg-slate-950'}`}><div className="opacity-50 mb-1">Input</div><div>{selectedProblem.defaultInput || 'No fixed sample input'}</div><div className="opacity-50 mt-4 mb-1">Expected behavior</div><div>Return the correct result for the problem; do not hard-code this example.</div></div></section>
                <section className={`rounded-2xl border p-6 ${isBright?'bg-white border-slate-200':'bg-slate-900/50 border-slate-800'}`}>
                  <div className="flex items-center justify-between gap-3"><h2 className="font-bold">Reference Solution</h2><button onClick={()=>setShowSolution(v=>!v)} className="px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-400 text-xs font-bold hover:bg-cyan-500/10">{showSolution?'Hide Solution':'View Solution'}</button></div>
                  {showSolution && <pre className={`mt-4 rounded-xl p-4 overflow-auto text-xs leading-5 font-mono whitespace-pre ${isBright?'bg-slate-950 text-slate-100':'bg-black text-slate-200'}`}>{selectedProblem.javaCode || 'Reference solution is not available for this problem.'}</pre>}
                </section>
                <section className={`rounded-2xl border p-6 ${isBright?'bg-white border-slate-200':'bg-slate-900/50 border-slate-800'}`}><h2 className="font-bold mb-3">Constraints & expectations</h2><ul className="space-y-2 text-sm opacity-75"><li>• Difficulty: {selectedProblem.difficulty}</li><li>• Target time complexity: {selectedProblem.timeComplexity}</li><li>• Target auxiliary space: {selectedProblem.spaceComplexity}</li><li>• Your implementation should work beyond the displayed example and handle edge cases.</li></ul></section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
