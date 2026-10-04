import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSheets, getSheetBySlug } from '../services/dsa.js';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Trophy, CheckCircle2, Circle, Play, ArrowRight, Layers } from 'lucide-react';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog';

export default function SheetsPage({ onSelectProblem }) {
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [sheets, setSheets] = useState([]);
  const [selectedSheetSlug, setSelectedSheetSlug] = useState('striver-sde');
  const [activeSheet, setActiveSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSheets()
      .then((res) => {
        if (res?.success && res.sheets?.length > 0) {
          setSheets(res.sheets);
        } else {
          setSheets([
            { id: 'sheet-striver-sde', name: "Striver's SDE Sheet (182)", slug: 'striver-sde', totalProblems: 182 },
            { id: 'sheet-striver-75', name: 'Striver 75 Blind Sheet', slug: 'striver-75', totalProblems: 75 },
            { id: 'sheet-striver-a2z', name: 'Striver A2Z DSA Course', slug: 'striver-a2z', totalProblems: 450 },
          ]);
        }
      })
      .catch(() => {
        setSheets([
          { id: 'sheet-striver-sde', name: "Striver's SDE Sheet (182)", slug: 'striver-sde', totalProblems: 182 },
          { id: 'sheet-striver-75', name: 'Striver 75 Blind Sheet', slug: 'striver-75', totalProblems: 75 },
          { id: 'sheet-striver-a2z', name: 'Striver A2Z DSA Course', slug: 'striver-a2z', totalProblems: 450 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLaunch = (p) => {
    if (onSelectProblem) {
      onSelectProblem({
        id: `striver-${p.id}`,
        striverId: p.id,
        title: p.title,
        day: p.day,
        category: p.category,
        difficulty: p.difficulty,
        timeComplexity: p.timeComplexity,
        spaceComplexity: p.spaceComplexity,
        description: p.description,
        defaultInput: p.defaultInput,
        code: p.javaCode,
        language: 'java',
      });
    } else {
      navigate('/visualize');
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
            isBright ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/60 border-amber-800 text-amber-400'
          }`}>
            <BookOpen size={13} />
            <span>Curated DSA Sheets</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Curated Sheets &amp; Striver SDE Roadmaps
          </h1>
          <p className={`text-xs max-w-2xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            Master interview preparation with industry-standard curated problem lists and instant 3D WebGL visualizations.
          </p>
        </div>

        {/* Sheet Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sheets.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSelectedSheetSlug(s.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-2 cursor-pointer ${
                selectedSheetSlug === s.slug
                  ? isBright
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                  : isBright
                    ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{s.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/20">
                {s.totalProblems || 182}
              </span>
            </button>
          ))}
        </div>

        {/* Sheet Problems List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRIVER_PROBLEMS.slice(0, 60).map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition hover:border-amber-500/60 ${
                isBright ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">
                    {p.day}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    p.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : p.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {p.difficulty}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-1">{p.title}</h3>
                <p className={`text-xs line-clamp-2 mb-3 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {p.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">{p.timeComplexity}</span>
                <button
                  onClick={() => handleLaunch(p)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition cursor-pointer"
                >
                  <Play size={11} className="fill-current" />
                  <span>Visualize 3D</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
