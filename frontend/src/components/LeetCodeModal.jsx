import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Trophy,
  Sparkles,
  Zap,
  Code2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Layers,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LEETCODE_PROBLEMS, LEETCODE_CATEGORIES } from '../utils/leetcodeCatalog';

export default function LeetCodeModal({
  isOpen,
  onClose,
  onSelectProblem,
  currentLanguage = 'java',
}) {
  const { isBright } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [previewProblem, setPreviewProblem] = useState(null);
  const [previewLang, setPreviewLang] = useState(currentLanguage || 'java');

  const filteredProblems = useMemo(() => {
    return LEETCODE_PROBLEMS.filter((p) => {
      // Difficulty match
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) {
        return false;
      }
      // Search match (id, title, description, slug)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = p.id.toString() === q || `#${p.id}` === q;
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesDesc || matchesSlug;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (!isOpen) return null;

  const handleLaunchProblem = (p) => {
    onSelectProblem({
      id: `leetcode-${p.id}`,
      leetcodeId: p.id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
      timeComplexity: p.timeComplexity,
      spaceComplexity: p.spaceComplexity,
      defaultInput: p.defaultInput,
      defaultTarget: p.defaultTarget,
      code: currentLanguage === 'python' ? p.pythonCode : p.javaCode,
      language: currentLanguage,
    });
    onClose();
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy':
        return isBright ? 'text-emerald-700 bg-emerald-100 border-emerald-300' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'Medium':
        return isBright ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'Hard':
        return isBright ? 'text-rose-800 bg-rose-100 border-rose-300' : 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      default:
        return isBright ? 'text-slate-700 bg-slate-100 border-slate-300' : 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div
        className={`w-full max-w-5xl h-[88vh] rounded-2xl flex flex-col shadow-2xl border overflow-hidden transition-all ${
          isBright
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
            : 'bg-[#070b14] border-slate-800 text-slate-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${
            isBright ? 'bg-slate-50/90 border-slate-200' : 'bg-[#0b0f19] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black">
              <Trophy size={18} className="text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">LeetCode 1–300 Hub</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-amber-400 border border-amber-500/30">
                  3D Visualizer
                </span>
              </div>
              <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                Every canonical interview question from #1 to #300 rendered in interactive 3D WebGL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition ${
              isBright
                ? 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                : 'border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div
          className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isBright ? 'bg-slate-50/60 border-slate-200' : 'bg-[#080d1a] border-slate-800/80'
          }`}
        >
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={15}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isBright ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by #number (e.g. 1, 53, 121) or title..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
                isBright
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  : 'bg-[#0e1424] border-slate-700 text-cyan-300 placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`text-[11px] font-medium mr-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Difficulty:
            </span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition border ${
                  selectedDifficulty === diff
                    ? isBright
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : isBright
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-800 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Chips Carousel */}
        <div
          className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs ${
            isBright ? 'bg-slate-100/70 border-slate-200' : 'bg-[#090e1c] border-slate-800/70'
          }`}
        >
          {LEETCODE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition shrink-0 ${
                selectedCategory === cat
                  ? isBright
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : isBright
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  : 'bg-[#0e1424] text-slate-300 border border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Problem List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredProblems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                <Search size={26} />
              </div>
              <h3 className="text-base font-bold">No LeetCode Problems Found</h3>
              <p className={`text-xs mt-1 max-w-sm ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                Try searching by a number like <strong>#1</strong>, <strong>#53</strong>, <strong>#121</strong>, <strong>#206</strong>, or clear your difficulty filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedDifficulty('All');
                }}
                className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProblems.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between transition-all group hover:-translate-y-0.5 hover:shadow-lg ${
                    isBright
                      ? 'bg-white border-slate-200 hover:border-cyan-400 shadow-sm'
                      : 'bg-[#0e1424]/90 border-slate-800/80 hover:border-cyan-500/60 shadow-black/40'
                  }`}
                >
                  <div>
                    {/* Top Row: Problem # & Difficulty */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition">
                        #{p.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(
                            p.difficulty
                          )}`}
                        >
                          {p.difficulty}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isBright ? 'bg-slate-100 text-slate-600' : 'bg-slate-800/80 text-slate-400'
                        }`}>
                          {p.timeComplexity}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold tracking-tight mb-1.5 group-hover:text-cyan-400 transition line-clamp-1">
                      {p.title}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${
                      isBright ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {p.description}
                    </p>

                    {/* Default Test Input Badge */}
                    <div className={`text-[11px] font-mono px-2 py-1 rounded mb-3 flex items-center justify-between ${
                      isBright ? 'bg-slate-50 border border-slate-200 text-slate-700' : 'bg-[#070b14] border border-slate-800 text-slate-300'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Test Input:</span>
                      <span className="truncate max-w-[170px] text-cyan-400 font-semibold">
                        [{p.defaultInput}]
                        {p.defaultTarget !== null && p.defaultTarget !== undefined && ` | T: ${p.defaultTarget}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/50">
                    <button
                      onClick={() => {
                        setPreviewProblem(p);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-1 ${
                        isBright
                          ? 'border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'border-slate-700 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <Code2 size={13} />
                      <span>Code</span>
                    </button>

                    <button
                      onClick={() => handleLaunchProblem(p)}
                      className="flex-2 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 active:scale-[0.98]"
                    >
                      <Sparkles size={13} />
                      <span>Visualize 3D ⚡</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code Preview Drawer / Submodal */}
        {previewProblem && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`w-full max-w-2xl rounded-xl border p-4 shadow-2xl flex flex-col max-h-[80vh] ${
              isBright ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#070b14] border-slate-800 text-slate-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">#{previewProblem.id}</span>
                  <h3 className="font-bold text-sm">{previewProblem.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => setPreviewLang('java')}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        previewLang === 'java' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Java
                    </button>
                    <button
                      onClick={() => setPreviewLang('python')}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        previewLang === 'python' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Python
                    </button>
                  </div>
                  <button
                    onClick={() => setPreviewProblem(null)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <pre className="flex-1 overflow-auto p-3 rounded-lg font-mono text-xs bg-[#0b0f19] border border-slate-800 text-cyan-300 leading-relaxed">
                {previewLang === 'python' ? previewProblem.pythonCode : previewProblem.javaCode}
              </pre>

              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Complexity: <strong>{previewProblem.timeComplexity}</strong> time, <strong>{previewProblem.spaceComplexity}</strong> space
                </span>
                <button
                  onClick={() => {
                    handleLaunchProblem(previewProblem);
                    setPreviewProblem(null);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                >
                  Load into 3D Visualizer ⚡
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
