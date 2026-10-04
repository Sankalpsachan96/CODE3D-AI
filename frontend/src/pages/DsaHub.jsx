import React, { useState, useMemo, useEffect } from 'react';
import { SAMPLE_PROGRAMS, CURRICULUM_CATEGORIES } from '../utils/sampleCodes';
import { STRIVER_DAYS, STRIVER_PROBLEMS } from '../utils/striverCatalog';
import { ALGORITHM_CATALOG, generateAlgorithmSteps } from '../algorithms/index';
import AlgorithmCard from '../components/AlgorithmCard';
import AlgorithmDetailModal from '../components/AlgorithmDetailModal';
import { useTheme } from '../context/ThemeContext';
import {
  Layers,
  Play,
  Clock,
  HardDrive,
  ArrowRight,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Circle,
  Search,
  Sparkles,
  Trophy,
  Filter,
  Zap,
  Code2
} from 'lucide-react';

const STORAGE_KEY = 'code3d_striver_solved_v1';
const STATUS_KEY = 'code3d_striver_status_v2';

export default function DsaHub({ onSelectConcept, initialTab = 'algorithms' }) {
  const { isBright } = useTheme();

  // Top-level View Switcher: 'algorithms' | 'curriculum' | 'striver'
  const [activeMainTab, setActiveMainTab] = useState(initialTab || 'algorithms');

  // Algorithms 3D Engine state
  const [algoCategory, setAlgoCategory] = useState('All');
  const [algoSearch, setAlgoSearch] = useState('');
  const [selectedAlgoModal, setSelectedAlgoModal] = useState(null);

  // Curriculum state
  const categories = ['All', ...CURRICULUM_CATEGORIES];
  const [activeCategory, setActiveCategory] = useState('All');
  const [curriculumSearch, setCurriculumSearch] = useState('');

  // Striver SDE Sheet state
  const [selectedDay, setSelectedDay] = useState('All Days (180+)');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [striverSearch, setStriverSearch] = useState('');
  const [solvedMap, setSolvedMap] = useState({});
  const [statusMap, setStatusMap] = useState({});

  // Sync initialTab when prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Load solved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSolvedMap(JSON.parse(saved));
      }
      const statusSaved = localStorage.getItem(STATUS_KEY);
      if (statusSaved) setStatusMap(JSON.parse(statusSaved));
    } catch (e) {
      console.warn('Could not load solved state:', e);
    }
  }, []);

  const toggleSolved = (problemId, e) => {
    e.stopPropagation();
    setSolvedMap((prev) => {
      const updated = { ...prev, [problemId]: !prev[problemId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const solvedCount = useMemo(() => {
    const ids = new Set(Object.entries(solvedMap).filter(([, v]) => Boolean(v)).map(([id]) => String(id)));
    Object.entries(statusMap).forEach(([id, value]) => { if (value?.status === 'SOLVED') ids.add(String(id)); });
    return ids.size;
  }, [solvedMap, statusMap]);

  const totalStriverCount = STRIVER_PROBLEMS.length;
  const progressPercent = Math.round((solvedCount / totalStriverCount) * 100) || 0;

  // Filtered algorithms catalog
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHM_CATALOG.filter((a) => {
      const matchesCategory = algoCategory === 'All' || a.category === algoCategory;
      const matchesSearch =
        algoSearch.trim() === '' ||
        a.name.toLowerCase().includes(algoSearch.toLowerCase()) ||
        a.description.toLowerCase().includes(algoSearch.toLowerCase()) ||
        a.category.toLowerCase().includes(algoSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [algoCategory, algoSearch]);

  const handleLaunchAlgorithm = (algo) => {
    const res = algo.generator(algo.defaultInput, algo.defaultTarget);
    onSelectConcept({
      id: algo.id,
      title: algo.name,
      category: algo.category,
      description: algo.description,
      difficulty: 'Standard',
      timeComplexity: algo.complexity?.time?.average || 'O(n)',
      spaceComplexity: algo.complexity?.space || 'O(1)',
      code: algo.code?.java || '',
      language: 'java',
      defaultInput: Array.isArray(algo.defaultInput) ? algo.defaultInput.join(', ') : String(algo.defaultInput),
      trace: res.steps,
      complexity: algo.complexity,
    });
  };

  // Filtered standard curriculum
  const filteredCurriculum = useMemo(() => {
    return SAMPLE_PROGRAMS.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch =
        curriculumSearch.trim() === '' ||
        p.title.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(curriculumSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, curriculumSearch]);

  // Filtered Striver problems
  const filteredStriver = useMemo(() => {
    return STRIVER_PROBLEMS.filter((p) => {
      if (selectedDay !== 'All Days (180+)' && p.day !== selectedDay) {
        return false;
      }
      if (selectedDifficulty !== 'All' && p.difficulty !== selectedDifficulty) {
        return false;
      }
      if (striverSearch.trim()) {
        const q = striverSearch.toLowerCase().trim();
        const matchesId = p.id.toString() === q;
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesDay = p.day.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        return matchesId || matchesTitle || matchesDesc || matchesDay || matchesCat;
      }
      return true;
    });
  }, [selectedDay, selectedDifficulty, striverSearch]);

  const handleLaunchStriverProblem = (p) => {
    onSelectConcept({
      id: `striver-${p.id}`,
      striverId: p.id,
      title: p.title,
      shortTitle: p.shortTitle,
      day: p.day,
      dayNumber: p.dayNumber,
      category: p.category,
      difficulty: p.difficulty,
      archetype: p.archetype,
      timeComplexity: p.timeComplexity,
      spaceComplexity: p.spaceComplexity,
      description: `${p.day}: ${p.title} - ${p.description}`,
      defaultInput: p.defaultInput,
      code: p.javaCode,
      language: 'java',
    });
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return isBright
          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
          : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400';
      case 'Medium':
        return isBright
          ? 'bg-amber-50 border-amber-300 text-amber-800'
          : 'bg-amber-950/60 border-amber-800/50 text-amber-400';
      case 'Hard':
        return isBright
          ? 'bg-rose-50 border-rose-300 text-rose-800'
          : 'bg-rose-950/60 border-rose-800/50 text-rose-400';
      default:
        return isBright
          ? 'bg-slate-100 border-slate-300 text-slate-700'
          : 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                isBright
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  : 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400'
              }`}>
                <Layers size={13} />
                <span>3D DSA Learning Hub</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                isBright
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-amber-950/60 border-amber-800/50 text-amber-400'
              }`}>
                <Trophy size={13} />
                <span>{totalStriverCount} Striver Problems Loaded</span>
              </span>
            </div>

            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
              Interactive DSA & Interview Library
            </h1>
            <p className={`text-xs max-w-2xl ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Explore standard data structure modules or dive straight into the complete 182-question Striver SDE Sheet with instant 3D WebGL trace.
            </p>
          </div>

          {/* Master View Mode Switcher */}
          <div className={`flex items-center p-1 rounded-xl border self-start md:self-auto shrink-0 ${
            isBright ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveMainTab('algorithms')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMainTab === 'algorithms'
                  ? isBright
                    ? 'bg-purple-600 text-white shadow-md font-bold'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={14} />
              <span>3D Algorithms</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-500/20 text-purple-300">
                {ALGORITHM_CATALOG.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('curriculum')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMainTab === 'curriculum'
                  ? isBright
                    ? 'bg-white text-cyan-800 shadow-md font-bold'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              <span>Core Modules</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-cyan-500/20 text-cyan-300">
                {SAMPLE_PROGRAMS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveMainTab('striver')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeMainTab === 'striver'
                  ? isBright
                    ? 'bg-amber-500 text-white shadow-md font-bold'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={14} />
              <span>Striver SDE Sheet 📜</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300">
                {totalStriverCount}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 0: 3D ALGORITHM ENGINE (SORTING, SEARCHING, DATA STRUCTURES) */}
        {/* ========================================================================= */}
        {activeMainTab === 'algorithms' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
                {['All', 'Sorting', 'Searching', 'Data Structures'].map((cat) => {
                  const count = cat === 'All' ? ALGORITHM_CATALOG.length : ALGORITHM_CATALOG.filter((a) => a.category === cat).length;
                  const isActive = algoCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setAlgoCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? isBright
                            ? 'bg-purple-600 text-white font-bold shadow-md'
                            : 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                          : isBright
                            ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                            : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? isBright ? 'bg-purple-700 text-white' : 'bg-slate-950/40 text-slate-950'
                          : isBright ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Search algorithms (e.g. bubble, binary)..."
                  value={algoSearch}
                  onChange={(e) => setAlgoSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                    isBright ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Grid of Algorithm Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAlgorithms.map((algo) => (
                <AlgorithmCard
                  key={algo.id}
                  algorithm={algo}
                  onVisualize={handleLaunchAlgorithm}
                  onViewDetails={(a) => setSelectedAlgoModal(a)}
                />
              ))}
            </div>

            {filteredAlgorithms.length === 0 && (
              <div className={`text-center py-12 border rounded-xl ${isBright ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/40'}`}>
                <p className="text-slate-400 text-sm">No algorithms found matching your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: STRIVER SDE SHEET (182 PROBLEMS ACROSS DAYS 1–27) */}
        {/* ========================================================================= */}
        {activeMainTab === 'striver' && (
          <div className="space-y-5">
            {/* Striver Progress Banner */}
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
              isBright ? 'bg-amber-50/60 border-amber-200 text-slate-800' : 'bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-orange-950/40 border-amber-500/30 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Striver's SDE Sheet Progress</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      {progressPercent}% Complete
                    </span>
                  </h3>
                  <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    {solvedCount} of {totalStriverCount} interview problems solved and saved.
                  </p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full md:w-64 space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span>Solved</span>
                  <span className="font-bold text-amber-500">{solvedCount}/{totalStriverCount}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isBright ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
              isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0b0f19] border-slate-800/80'
            }`}>
              {/* Day Filter Dropdown */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Filter size={14} className={isBright ? 'text-slate-400' : 'text-slate-500'} />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                    isBright ? 'bg-slate-50 border-slate-300 text-slate-800 font-semibold' : 'bg-slate-950 border-slate-700 text-amber-300'
                  }`}
                >
                  {STRIVER_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter Pills */}
              <div className="flex items-center gap-1">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition border cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                        : isBright
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                          : 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={striverSearch}
                  onChange={(e) => setStriverSearch(e.target.value)}
                  placeholder="Search problem, day, topic..."
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                    isBright ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* Grid of Striver Problem Cards */}
            {filteredStriver.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <Search size={32} className="mx-auto opacity-40" />
                <p className="text-sm">No Striver problems matched your filter.</p>
                <button
                  onClick={() => {
                    setSelectedDay('All Days (180+)');
                    setSelectedDifficulty('All');
                    setStriverSearch('');
                  }}
                  className="text-xs text-amber-500 underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStriver.map((p) => {
                  const submission = statusMap[p.id];
              const isSolved = Boolean(solvedMap[p.id]) || submission?.status === 'SOLVED';
              const isSubmitted = submission?.status === 'SUBMITTED';
                  return (
                    <div
                      key={p.id}
                      className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:border-amber-500/50 group ${
                        isBright
                          ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-amber-50/10'
                          : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-900/90'
                      }`}
                    >
                      <div>
                        {/* Card Header: Day, Category, Difficulty, Solved Checkbox */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              {p.day.split(':')[0]}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(p.difficulty)}`}>
                              {p.difficulty}
                            </span>
                          </div>

                          <button
                            onClick={(e) => toggleSolved(p.id, e)}
                            className="p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                            title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                          >
                            {isSolved ? (
                              <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-400/20" />
                            ) : (
                              <Circle size={18} className="text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                        </div>

                        {/* Title & Description */}
                        <div className="flex items-start gap-2 mb-1.5">
                          <h4 className={`text-sm font-bold group-hover:text-amber-400 transition flex-1 ${
                            isSolved ? 'line-through opacity-70' : ''
                          } ${isBright ? 'text-slate-900' : 'text-white'}`}>
                            {p.title}
                          </h4>
                          {(isSolved || isSubmitted) && (
                            <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                              isSolved ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                            }`}>
                              {isSolved ? 'SOLVED' : 'SUBMITTED'}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 mb-3 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                          {p.description}
                        </p>
                      </div>

                      {/* Card Footer: Complexities & Visualize 3D Button */}
                      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className={isBright ? 'text-cyan-700 font-bold' : 'text-cyan-400 font-bold'}>
                            {p.timeComplexity}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className={isBright ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'}>
                            {p.spaceComplexity}
                          </span>
                        </div>

                        <button
                          onClick={() => handleLaunchStriverProblem(p)}
                          className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Zap size={12} className="fill-slate-950" />
                          <span>Visualize 3D</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CORE CURRICULUM MODULES (40+ CONCEPTS) */}
        {/* ========================================================================= */}
        {activeMainTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
                {categories.map((cat) => {
                  const count = cat === 'All' ? SAMPLE_PROGRAMS.length : SAMPLE_PROGRAMS.filter((p) => p.category === cat).length;
                  const isActive = activeCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? isBright
                            ? 'bg-cyan-600 text-white font-bold shadow-md'
                            : 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                          : isBright
                            ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
                            : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? isBright ? 'bg-cyan-700 text-white' : 'bg-slate-950/40 text-slate-950'
                          : isBright ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search size={14} className={`absolute left-3 top-2.5 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Search concepts (e.g. avl, bfs)..."
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                    isBright ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Grid of Concept Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCurriculum.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-cyan-500/60 group ${
                    isBright
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-cyan-50/20'
                      : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        isBright ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        item.difficulty === 'Beginner'
                          ? isBright ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium' : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
                          : item.difficulty === 'Intermediate'
                          ? isBright ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'bg-blue-950/60 border-blue-800/50 text-blue-400'
                          : isBright ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium' : 'bg-purple-950/60 border-purple-800/50 text-purple-400'
                      }`}>
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className={`text-base font-bold mb-2 group-hover:text-cyan-400 transition-colors ${
                      isBright ? 'text-slate-900' : 'text-white'
                    }`}>
                      {item.title}
                    </h3>

                    <p className={`text-xs line-clamp-3 mb-4 leading-relaxed ${
                      isBright ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                        <span>{item.timeComplexity}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HardDrive size={12} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />
                        <span>{item.spaceComplexity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectConcept(item)}
                      className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer ${
                        isBright
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm'
                          : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      <Play size={12} className="fill-current" />
                      <span>Step-by-Step 3D Simulation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Algorithm Detail Modal */}
        {selectedAlgoModal && (
          <AlgorithmDetailModal
            algorithm={selectedAlgoModal}
            onClose={() => setSelectedAlgoModal(null)}
            onVisualize={(algo) => {
              setSelectedAlgoModal(null);
              handleLaunchAlgorithm(algo);
            }}
          />
        )}
      </div>
    </div>
  );
}
