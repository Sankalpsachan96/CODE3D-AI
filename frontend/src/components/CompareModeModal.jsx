import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Zap, BarChart2, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COMPARE_PRESETS = [
  {
    id: 'search',
    title: 'Linear Search vs. Binary Search',
    category: 'Searching',
    input: [5, 12, 18, 24, 31, 45, 59, 68, 77, 89, 93],
    target: 77,
    algoA: {
      name: 'Linear Search',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description: 'Scans each element sequentially from index 0 until the target is found.',
      run: (arr, target) => {
        const steps = [];
        let comparisons = 0;
        for (let i = 0; i < arr.length; i++) {
          comparisons++;
          const match = arr[i] === target;
          steps.push({
            index: i,
            value: arr[i],
            comparisons,
            status: match ? 'FOUND' : 'CHECKING',
            explanation: `Comparing arr[${i}] (${arr[i]}) == ${target} ➜ ${match ? 'FOUND!' : 'False, moving to next'}`
          });
          if (match) break;
        }
        return { steps, comparisons, operations: comparisons };
      }
    },
    algoB: {
      name: 'Binary Search',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description: 'Halves the search space on each iteration by comparing the middle element.',
      run: (arr, target) => {
        const steps = [];
        let left = 0;
        let right = arr.length - 1;
        let comparisons = 0;
        let ops = 0;
        while (left <= right) {
          ops++;
          const mid = Math.floor((left + right) / 2);
          comparisons++;
          if (arr[mid] === target) {
            steps.push({
              left,
              right,
              mid,
              value: arr[mid],
              comparisons,
              status: 'FOUND',
              explanation: `arr[${mid}] (${arr[mid]}) == ${target} ➜ MATCH FOUND at index ${mid}!`
            });
            break;
          } else if (arr[mid] < target) {
            steps.push({
              left,
              right,
              mid,
              value: arr[mid],
              comparisons,
              status: 'DISCARD_LEFT',
              explanation: `arr[${mid}] (${arr[mid]}) < ${target} ➜ Target must be in right half. left = ${mid + 1}`
            });
            left = mid + 1;
          } else {
            steps.push({
              left,
              right,
              mid,
              value: arr[mid],
              comparisons,
              status: 'DISCARD_RIGHT',
              explanation: `arr[${mid}] (${arr[mid]}) > ${target} ➜ Target must be in left half. right = ${mid - 1}`
            });
            right = mid - 1;
          }
        }
        return { steps, comparisons, operations: ops };
      }
    }
  },
  {
    id: 'sort',
    title: 'Bubble Sort vs. Quick Sort (Simulated)',
    category: 'Sorting',
    input: [45, 12, 89, 24, 68, 5, 31, 77],
    target: null,
    algoA: {
      name: 'Bubble Sort',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(1)',
      description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if out of order.',
      run: (arr) => {
        const a = [...arr];
        const steps = [];
        let comparisons = 0;
        let swaps = 0;
        for (let i = 0; i < a.length; i++) {
          for (let j = 0; j < a.length - i - 1; j++) {
            comparisons++;
            if (a[j] > a[j + 1]) {
              swaps++;
              const temp = a[j];
              a[j] = a[j + 1];
              a[j + 1] = temp;
              steps.push({
                array: [...a],
                comparing: [j, j + 1],
                swapped: true,
                comparisons,
                swaps,
                explanation: `Swapped [${j}] and [${j + 1}]: ${a[j + 1]} ⇄ ${a[j]}`
              });
            }
          }
        }
        return { steps, comparisons, swaps, operations: comparisons + swaps };
      }
    },
    algoB: {
      name: 'Quick Sort / Divide-and-Conquer',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(log n)',
      description: 'Selects a pivot element and partitions array into sub-arrays around the pivot.',
      run: (arr) => {
        const a = [...arr];
        const steps = [];
        let comparisons = 0;
        let swaps = 0;
        
        function partition(low, high) {
          const pivot = a[high];
          let i = low - 1;
          for (let j = low; j < high; j++) {
            comparisons++;
            if (a[j] < pivot) {
              i++;
              swaps++;
              const tmp = a[i];
              a[i] = a[j];
              a[j] = tmp;
              steps.push({
                array: [...a],
                comparing: [j, high],
                swapped: true,
                comparisons,
                swaps,
                explanation: `Element ${a[i]} < pivot (${pivot}), swapped to index ${i}`
              });
            }
          }
          swaps++;
          const tmp = a[i + 1];
          a[i + 1] = a[high];
          a[high] = tmp;
          return i + 1;
        }

        function qsort(low, high) {
          if (low < high) {
            const pi = partition(low, high);
            qsort(low, pi - 1);
            qsort(pi + 1, high);
          }
        }
        qsort(0, a.length - 1);
        return { steps, comparisons, swaps, operations: comparisons + swaps };
      }
    }
  }
];

export default function CompareModeModal({ isOpen, onClose }) {
  const { isBright } = useTheme();
  const [selectedPresetId, setSelectedPresetId] = useState('search');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const preset = COMPARE_PRESETS.find(p => p.id === selectedPresetId) || COMPARE_PRESETS[0];

  const results = React.useMemo(() => {
    const resA = preset.algoA.run(preset.input, preset.target);
    const resB = preset.algoB.run(preset.input, preset.target);
    const maxSteps = Math.max(resA.steps.length, resB.steps.length);
    return { resA, resB, maxSteps };
  }, [preset]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedPresetId]);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= results.maxSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isPlaying, results.maxSteps]);

  if (!isOpen) return null;

  const stepA = results.resA.steps[Math.min(currentStepIndex, results.resA.steps.length - 1)] || {};
  const stepB = results.resB.steps[Math.min(currentStepIndex, results.resB.steps.length - 1)] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isBright
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0c1220] border-cyan-500/30 text-slate-100 shadow-cyan-950/50'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Algorithm Compare Mode
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
                  Dual Benchmarking
                </span>
              </h2>
              <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                Visual side-by-side performance & complexity analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isBright
                ? 'border-slate-200 hover:bg-slate-100 text-slate-500'
                : 'border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset Selector */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center gap-2 ${
          isBright ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <span className={`text-xs font-semibold uppercase tracking-wider mr-2 ${
            isBright ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Compare:
          </span>
          {COMPARE_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPresetId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                selectedPresetId === p.id
                  ? isBright
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-950'
                  : isBright
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Display */}
          <div className={`p-4 rounded-xl border font-mono text-xs ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                isBright ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Benchmark Input Array ({preset.input.length} Elements)
              </span>
              {preset.target !== null && (
                <span className="text-[11px] font-bold text-amber-400">
                  Target Key: {preset.target}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preset.input.map((val, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded border text-xs font-bold ${
                    val === preset.target
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400'
                      : isBright
                      ? 'bg-white border-slate-200 text-slate-700'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>

          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Algorithm A */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isBright ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-cyan-400">
                    {preset.algoA.name}
                  </h3>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {preset.algoA.timeComplexity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                      {preset.algoA.spaceComplexity}
                    </span>
                  </div>
                </div>
                <p className={`text-xs mb-4 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {preset.algoA.description}
                </p>

                {/* Progress / Step info */}
                <div className={`p-3 rounded-xl border text-xs font-mono mb-3 ${
                  isBright ? 'bg-white border-slate-200' : 'bg-slate-950/70 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="opacity-70">Comparisons Done:</span>
                    <span className="font-bold text-cyan-400">
                      {stepA.comparisons || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300">
                    {stepA.explanation || 'Ready to start'}
                  </div>
                </div>
              </div>

              {/* Total Final Stats */}
              <div className="pt-3 border-t flex items-center justify-between text-xs font-mono opacity-80">
                <span>Total Steps: {results.resA.steps.length}</span>
                <span>Operations: {results.resA.operations}</span>
              </div>
            </div>

            {/* Algorithm B */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isBright ? 'bg-emerald-50/40 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    {preset.algoB.name}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      WINNER ⚡
                    </span>
                  </h3>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {preset.algoB.timeComplexity}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                      {preset.algoB.spaceComplexity}
                    </span>
                  </div>
                </div>
                <p className={`text-xs mb-4 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  {preset.algoB.description}
                </p>

                {/* Progress / Step info */}
                <div className={`p-3 rounded-xl border text-xs font-mono mb-3 ${
                  isBright ? 'bg-white border-emerald-200' : 'bg-slate-950/70 border-emerald-800/40'
                }`}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="opacity-70">Comparisons Done:</span>
                    <span className="font-bold text-emerald-400">
                      {stepB.comparisons || 0}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-300">
                    {stepB.explanation || 'Ready to start'}
                  </div>
                </div>
              </div>

              {/* Total Final Stats */}
              <div className="pt-3 border-t flex items-center justify-between text-xs font-mono opacity-80">
                <span>Total Steps: {results.resB.steps.length}</span>
                <span>Operations: {results.resB.operations}</span>
              </div>
            </div>
          </div>

          {/* Efficiency Bar Graph Comparison */}
          <div className={`p-4 rounded-xl border ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart2 size={14} className="text-cyan-400" />
              Efficiency & Comparison Count Analysis
            </h4>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{preset.algoA.name}</span>
                  <span className="font-bold text-cyan-400">{results.resA.comparisons} operations</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (results.resA.comparisons / Math.max(results.resA.comparisons, results.resB.comparisons)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>{preset.algoB.name}</span>
                  <span className="font-bold text-emerald-400">{results.resB.comparisons} operations</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (results.resB.comparisons / Math.max(results.resA.comparisons, results.resB.comparisons)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Playback Controls */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="text-xs font-mono">
            Step <strong className="text-cyan-400">{currentStepIndex + 1}</strong> of {results.maxSteps}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isBright ? 'border-slate-300 hover:bg-slate-200' : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
              title="Reset comparison"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 cursor-pointer transition"
            >
              {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Comparison'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
