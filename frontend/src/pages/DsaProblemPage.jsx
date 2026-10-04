import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemBySlug, updateProgress } from '../services/dsa.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Play,
  CheckCircle2,
  Clock,
  HardDrive,
  ArrowLeft,
  Code2
} from 'lucide-react';

export default function DsaProblemPage({ onVisualizeProblem }) {
  const { problemSlug } = useParams();
  const { isBright } = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prefer C when available.
  // Otherwise use the first language provided by the problem.
  const [activeCodeTab, setActiveCodeTab] = useState('c');

  useEffect(() => {
    getProblemBySlug(problemSlug)
      .then((res) => {
        if (res?.success && res.problem) {
          const loadedProblem = res.problem;
          setProblem(loadedProblem);

          const languages = Object.keys(loadedProblem.starterCode || {});

          if (languages.includes('c')) {
            setActiveCodeTab('c');
          } else if (languages.length > 0) {
            setActiveCodeTab(languages[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [problemSlug]);

  /*
   * IMPORTANT:
   * We intentionally do NOT send starterCode as `code`.
   *
   * The user must write the solution themselves.
   */
  const handleLaunch = () => {
    if (!problem || !onVisualizeProblem) return;

    const language =
      activeCodeTab ||
      Object.keys(problem.starterCode || {})[0] ||
      'c';

    onVisualizeProblem({
      id: problem.id,
      striverId: problem.id,

      title: problem.title,
      shortTitle: problem.shortTitle || problem.title,

      day: problem.day,
      dayNumber: problem.dayNumber,

      category: problem.topic?.name || 'DSA',
      description: problem.description,
      difficulty: problem.difficulty,

      timeComplexity: problem.timeComplexity || 'O(n)',
      spaceComplexity: problem.spaceComplexity || 'O(1)',

      // Keep starterCode available as reference metadata if needed.
      starterCode: problem.starterCode?.[language] || '',

      // VERY IMPORTANT:
      // Editor opens EMPTY.
      code: '',

      language,

      defaultInput: problem.defaultInput,

      archetype:
        problem.archetype ||
        problem.topic?.slug ||
        problem.topic?.name ||
        problem.id
    });
  };

  const handleMarkSolved = async () => {
    if (!problem || !isAuthenticated) return;

    try {
      await updateProgress({
        problemId: problem.id,
        status: 'SOLVED'
      });

      alert('Marked problem as SOLVED in your cloud profile!');
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
        Loading problem details from database...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">
          Problem Not Found
        </h2>

        <button
          onClick={() => navigate('/dsa')}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950"
        >
          Return to DSA Hub
        </button>
      </div>
    );
  }

  const availableLanguages = Object.keys(problem.starterCode || {});

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors ${
        isBright
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#070b14] text-slate-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate('/dsa')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Problem Hub</span>
        </button>

        {/* Problem Header */}
        <div
          className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            isBright
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {problem.topic?.name || 'Algorithm'}
              </span>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  problem.difficulty === 'EASY'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : problem.difficulty === 'MEDIUM'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {problem.difficulty}
              </span>

            </div>

            <h1 className="text-2xl font-extrabold">
              {problem.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">

            {isAuthenticated && (
              <button
                onClick={handleMarkSolved}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 size={13} />
                <span>Mark Solved</span>
              </button>
            )}

            <button
              onClick={handleLaunch}
              className="px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Play size={13} className="fill-current" />
              <span>Open Code Editor</span>
            </button>

          </div>
        </div>

        {/* Problem Description */}
        <div
          className={`p-6 rounded-2xl border space-y-4 ${
            isBright
              ? 'bg-white border-slate-200'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Problem Statement
          </h2>

          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>

          {/* Examples if available */}
          {problem.examples && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Examples
              </h3>

              <pre className="text-xs font-mono whitespace-pre-wrap bg-black/20 rounded-lg p-4 overflow-x-auto">
                {typeof problem.examples === 'string'
                  ? problem.examples
                  : JSON.stringify(problem.examples, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-6 pt-3 border-t border-slate-800 text-xs font-mono">

            <div className="flex items-center gap-1.5 text-cyan-400">
              <Clock size={13} />
              <span>
                Time: {problem.timeComplexity || 'Not specified'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-400">
              <HardDrive size={13} />
              <span>
                Space: {problem.spaceComplexity || 'Not specified'}
              </span>
            </div>

          </div>
        </div>

        {/* Language Selection */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isBright
              ? 'bg-white border-slate-200'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/60">

            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-cyan-400" />

              <span className="text-xs font-bold">
                Choose Language
              </span>
            </div>

            <div className="flex items-center gap-1 flex-wrap justify-end">

              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeTab(lang)}
                  className={`px-3 py-1.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                    activeCodeTab === lang
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}

            </div>
          </div>

          {/* IMPORTANT:
              Do NOT show solution/starter code here.
          */}
          <div className="p-5">

            <div
              className={`rounded-xl border p-5 ${
                isBright
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <p className="text-sm font-semibold mb-2">
                Write your solution
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                Select your preferred programming language and open the
                editor. The solution will not be provided automatically.
                Read the problem, write your own code, run it, and visualize it
                it for checking.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Selected language:
                <span className="font-bold">
                  {activeCodeTab.toUpperCase()}
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}