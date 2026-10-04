import React, { useState } from 'react';
import { Terminal, Target, Play, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Export helper utilities in case needed by other modules (Section 3 requirement)
export const generateRandomArray = (size = 8) => {
  const s = Math.min(20, Math.max(3, Number(size) || 8));
  const res = [];
  for (let i = 0; i < s; i++) res.push(Math.floor(Math.random() * 90) + 10);
  return res;
};

export const generateSortedArray = (size = 8) => {
  const s = Math.min(20, Math.max(3, Number(size) || 8));
  const res = [];
  let cur = Math.floor(Math.random() * 15) + 5;
  for (let i = 0; i < s; i++) {
    cur += Math.floor(Math.random() * 8) + 3;
    res.push(cur);
  }
  return res;
};

export const generateReverseSortedArray = (size = 8) => generateSortedArray(size).reverse();

export const generateNearlySortedArray = (size = 8) => {
  const arr = generateSortedArray(size);
  if (arr.length >= 4) {
    const i1 = Math.floor(Math.random() * (arr.length - 2));
    const temp = arr[i1];
    arr[i1] = arr[i1 + 1];
    arr[i1 + 1] = temp;
  }
  return arr;
};

/**
 * Section 3 & 17: Clean Program Input System (stdin)
 * Removed visible buttons: Random, Sorted, Reverse, Nearly Sorted
 */
export default function InputGenerator({
  onApplyInput,
  currentValues = [10, 20, 30, 40],
  isSearching = false,
  currentTarget = 30,
}) {
  const { isBright } = useTheme();
  const [customText, setCustomText] = useState(
    Array.isArray(currentValues) ? currentValues.join(', ') : '10, 20, 30, 40'
  );
  const [targetVal, setTargetVal] = useState(currentTarget || 23);
  const [validationError, setValidationError] = useState(null);

  const handleApply = () => {
    setValidationError(null);
    const parsed = customText
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (parsed.length === 0) {
      setValidationError('Please enter valid numbers (e.g. 10, 20, 30, 40).');
      return;
    }
    if (parsed.length > 30) {
      setValidationError('Maximum 30 elements recommended for optimal 3D clarity.');
      return;
    }

    if (onApplyInput) {
      onApplyInput(parsed, targetVal);
    }
  };

  return (
    <div className={`px-3 py-2 border-b text-xs select-none transition-colors ${
      isBright ? 'bg-slate-50/90 border-slate-200 text-slate-800' : 'bg-[#0b0f19] border-slate-800/80 text-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Input Header Icon */}
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 font-mono text-[11px]">
          <Terminal size={13} className="text-cyan-400" />
          <span className="font-semibold text-slate-300">Input (stdin):</span>
        </div>

        {/* Custom Input Field */}
        <div className="flex-1 flex items-center gap-1.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="e.g. 10, 20, 30, 40, 50"
            className={`w-full px-2.5 py-1 rounded-md text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-cyan-500 transition ${
              isBright
                ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                : 'bg-slate-950/80 border-slate-700/80 text-cyan-300 placeholder:text-slate-600'
            }`}
          />
        </div>

        {/* Target value input if searching */}
        {isSearching && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Target size={12} className="text-cyan-400" /> Target:
            </span>
            <input
              type="number"
              value={targetVal}
              onChange={(e) => setTargetVal(Number(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className={`w-16 px-2 py-1 rounded-md text-xs font-mono border text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                isBright ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950/80 border-slate-700 text-cyan-300'
              }`}
            />
          </div>
        )}

        {/* Apply Input Button */}
        <button
          onClick={handleApply}
          className="px-3 py-1 rounded-md font-bold text-xs transition shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950"
          title="Apply input data into code execution and 3D simulation"
        >
          <Play size={11} className="fill-slate-950" />
          <span>Apply Input</span>
        </button>
      </div>

      {/* Validation warning if present */}
      {validationError && (
        <div className="text-[10px] text-rose-400 flex items-center gap-1 pt-1 font-mono">
          <AlertCircle size={11} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
