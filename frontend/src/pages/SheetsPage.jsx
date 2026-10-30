import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSheets, getSheetBySlug } from '../services/dsa.js';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Play, AlertCircle } from 'lucide-react';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog';

const LANGUAGES = ['java', 'cpp', 'python', 'javascript', 'c'];

function starterFor(problem, language) {
  const title = problem.title || 'DSA problem';
  const sourceField = { java: 'javaCode', cpp: 'cppCode', python: 'pythonCode', javascript: 'javascriptCode', c: 'cCode' }[language];
  const source = problem[sourceField];
  if (typeof source !== 'string' || !source.trim()) return '';
  const normalized = source.replace(/\s+/g, ' ');
  if (/return\s+sum\s*\(\s*(?:nums|arr|array|a)\s*\)/i.test(normalized) || /accumulate\s*\(/i.test(normalized)) return '';
  if (language === 'python') {
    const match = source.match(/^\s*def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/m);
    return match ? `def ${match[1]}(${match[2]}):\n    # Write your solution here\n    pass\n` : `# ${title}\ndef solve():\n    # Write your solution here\n    pass\n`;
  }
  if (language === 'javascript') return `// ${title}\nfunction solve() {\n  // Write your solution here\n}\n`;
  if (language === 'c') return `// ${title}\n#include <stdio.h>\n\nint main(void) {\n    // Write your solution here\n    return 0;\n}\n`;
  if (language === 'cpp') return `// ${title}\n#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n};\n`;
  return `// ${title}\nclass Solution {\n    // Write your solution here\n}\n`;
}

function normalizeSheetProblem(entry) {
  const p = entry?.problem || entry?.dsaProblem || entry;
  if (!p) return null;
  return {
    ...p,
    id: p.id ?? entry.id,
    title: p.title || entry.title || 'Untitled problem',
    day: entry.day || p.day || p.topic?.name || 'DSA',
    category: p.category || p.topic?.name || entry.category || 'DSA',
    difficulty: String(p.difficulty || entry.difficulty || 'Medium').toLowerCase().replace(/^./, c => c.toUpperCase()),
    timeComplexity: p.timeComplexity || p.timeComplexityExpected || 'Not specified',
    spaceComplexity: p.spaceComplexity || p.spaceComplexityExpected || 'Not specified',
    description: p.description || entry.description || '',
    defaultInput: p.defaultInput || entry.defaultInput || '',
  };
}

export default function SheetsPage({ onSelectProblem }) {
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const { sheetSlug: routeSlug } = useParams();
  const [sheets, setSheets] = useState([]);
  const [selectedSheetSlug, setSelectedSheetSlug] = useState(routeSlug || 'striver-sde');
  const [activeSheet, setActiveSheet] = useState(null);
  const [language, setLanguage] = useState('java');
  const [loadingSheets, setLoadingSheets] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSheets().then((res) => {
      if (cancelled) return;
      const items = Array.isArray(res?.sheets) ? res.sheets : [];
      setSheets(items);
      if (!routeSlug && items.length && !items.some(s => s.slug === selectedSheetSlug)) {
        setSelectedSheetSlug(items[0].slug);
      }
    }).catch(() => {
      if (!cancelled) setError('Could not load the available sheets from the server.');
    }).finally(() => { if (!cancelled) setLoadingSheets(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (routeSlug && routeSlug !== selectedSheetSlug) setSelectedSheetSlug(routeSlug);
  }, [routeSlug]);

  useEffect(() => {
    if (!selectedSheetSlug) { setActiveSheet(null); return; }
    let cancelled = false;
    setLoadingProblems(true);
    setError('');
    getSheetBySlug(selectedSheetSlug).then((res) => {
      if (cancelled) return;
      if (!res?.success || !res.sheet) throw new Error('The selected sheet was not found.');
      setActiveSheet(res.sheet);
    }).catch((err) => {
      if (cancelled) return;
      // The bundled catalog is an explicit offline fallback for the SDE sheet only.
      if (selectedSheetSlug === 'striver-sde') {
        setActiveSheet({ slug: 'striver-sde', name: "Striver's SDE Sheet", problems: STRIVER_PROBLEMS });
        setError('Showing the bundled Striver SDE catalog because the server sheet could not be loaded.');
      } else {
        setActiveSheet(null);
        setError(err?.message || 'Could not load this sheet.');
      }
    }).finally(() => { if (!cancelled) setLoadingProblems(false); });
    return () => { cancelled = true; };
  }, [selectedSheetSlug]);

  const problems = useMemo(() => {
    const entries = Array.isArray(activeSheet?.problems) ? activeSheet.problems : [];
    return entries.map(normalizeSheetProblem).filter(Boolean);
  }, [activeSheet]);

  const handleSelectSheet = (slug) => {
    setSelectedSheetSlug(slug);
    navigate(slug === 'striver-sde' ? '/sheets' : `/sheets/${slug}`, { replace: true });
  };

  const handleLaunch = (problem) => {
    const code = starterFor(problem, language);
    if (!code) {
      setError(`${language.toUpperCase()} starter template is not available for this problem. Choose a language with a source entry.`);
      return;
    }
    onSelectProblem?.({
      id: `sheet-${selectedSheetSlug}-${problem.id}`,
      striverId: problem.id,
      title: problem.title,
      day: problem.day,
      category: problem.category,
      difficulty: problem.difficulty,
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity,
      description: problem.description,
      defaultInput: problem.defaultInput,
      code,
      language,
      trace: null,
    });
    if (!onSelectProblem) navigate('/visualizer');
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 transition-colors ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 text-xs font-mono text-amber-500"><BookOpen size={14}/> Curated DSA Sheets</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">Curated Sheets &amp; Striver SDE Roadmaps</h1>
          <p className={`text-xs max-w-2xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Choose a sheet, load its actual problem list, select your editor language, and open a clean starter template.</p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          {sheets.map((sheet) => (
            <button key={sheet.slug} onClick={() => handleSelectSheet(sheet.slug)} className={`px-4 py-2 rounded-xl text-xs font-semibold border ${selectedSheetSlug === sheet.slug ? 'bg-amber-500 text-white border-amber-500' : isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
              {sheet.name} <span className="opacity-70">({sheet._count?.problems ?? sheet.totalProblems ?? 0})</span>
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs">
            <span>Editor language</span>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={`rounded-lg border px-3 py-2 ${isBright ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}>
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang.toUpperCase()}</option>)}
            </select>
          </label>
        </div>

        {error && <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600"><AlertCircle size={15}/><span>{error}</span></div>}
        {loadingSheets || loadingProblems ? <p className="py-12 text-center text-sm opacity-60">Loading sheet problems…</p> : (
          <div>
            <h2 className="mb-3 text-sm font-bold">{activeSheet?.name || 'No sheet selected'} <span className="font-normal opacity-60">· {problems.length} problems loaded</span></h2>
            {problems.length === 0 ? <p className="rounded-xl border border-dashed border-slate-500/40 p-8 text-center text-sm opacity-60">This sheet has no linked problems yet. No placeholder problem list is being shown.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {problems.map(problem => (
                  <article key={problem.id} className={`p-4 rounded-xl border flex flex-col justify-between ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                    <div>
                      <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono text-amber-500">{problem.day}</span><span className="text-[10px]">{problem.difficulty}</span></div>
                      <h3 className="text-sm font-bold mb-1">{problem.title}</h3>
                      <p className={`text-xs line-clamp-3 mb-3 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>{problem.description}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-500/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono opacity-60">{problem.timeComplexity}</span>
                      <button onClick={() => handleLaunch(problem)} className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/15 text-amber-600 border border-amber-500/40"><Play size={11}/> Visualize 3D</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
