import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { COMPLEXITY_CURVES } from '../algorithms/index.js';

export default function ComplexityGraph({ activeComplexity = 'O(n²)' }) {
  const { isBright } = useTheme();

  // Normalized points for n = 1 to 16
  const nValues = [1, 2, 4, 6, 8, 10, 12, 14, 16];
  const maxN = 16;
  const maxOps = 64; // Scale max for quadratic

  const width = 360;
  const height = 180;
  const padLeft = 40;
  const padBottom = 25;
  const padTop = 15;
  const padRight = 15;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const toSvgX = (n) => padLeft + (n / maxN) * plotW;
  const toSvgY = (ops) => padTop + plotH - (Math.min(ops, maxOps) / maxOps) * plotH;

  const normalizeNotation = (str = '') => {
    return str.replace(/\s+/g, '').toLowerCase();
  };

  const activeNorm = normalizeNotation(activeComplexity);

  return (
    <div className={`p-3 rounded-xl border text-xs select-none transition-colors ${
      isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold tracking-tight text-[11px] uppercase flex items-center gap-1.5">
          <span>📈</span> Big-O Complexity Comparison
        </span>
        <span className="text-[10px] font-mono text-cyan-500 font-semibold">
          Active: {activeComplexity || 'O(n)'}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        {[0, 16, 32, 48, 64].map((op) => {
          const y = toSvgY(op);
          return (
            <g key={op}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke={isBright ? '#e2e8f0' : '#1e293b'}
                strokeDasharray="2 2"
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                fontSize="9"
                fill={isBright ? '#94a3b8' : '#64748b'}
                textAnchor="end"
                fontFamily="monospace"
              >
                {op}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {[1, 4, 8, 12, 16].map((n) => {
          const x = toSvgX(n);
          return (
            <text
              key={n}
              x={x}
              y={height - 6}
              fontSize="9"
              fill={isBright ? '#94a3b8' : '#64748b'}
              textAnchor="middle"
              fontFamily="monospace"
            >
              n={n}
            </text>
          );
        })}

        {/* Axis borders */}
        <line
          x1={padLeft}
          y1={padTop}
          x2={padLeft}
          y2={height - padBottom}
          stroke={isBright ? '#cbd5e1' : '#334155'}
          strokeWidth="1.5"
        />
        <line
          x1={padLeft}
          y1={height - padBottom}
          x2={width - padRight}
          y2={height - padBottom}
          stroke={isBright ? '#cbd5e1' : '#334155'}
          strokeWidth="1.5"
        />

        {/* Curves */}
        {COMPLEXITY_CURVES.map((curve) => {
          const points = nValues.map((n) => {
            const rawOps = curve.formula(n);
            const x = toSvgX(n);
            const y = toSvgY(rawOps);
            return `${x},${y}`;
          }).join(' ');

          const isCurrent = activeNorm.includes(normalizeNotation(curve.notation));

          return (
            <g key={curve.notation}>
              <polyline
                points={points}
                fill="none"
                stroke={curve.color}
                strokeWidth={isCurrent ? '3' : '1.5'}
                opacity={isCurrent ? 1 : 0.45}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Endpoint label */}
              {(() => {
                const lastN = nValues[nValues.length - 1];
                const lastOps = curve.formula(lastN);
                const x = toSvgX(lastN);
                const y = toSvgY(lastOps);
                return (
                  <text
                    x={x - 2}
                    y={y - 4}
                    fontSize={isCurrent ? '9.5' : '8'}
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                    fill={curve.color}
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {curve.notation}
                  </text>
                );
              })()}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
        {COMPLEXITY_CURVES.map((c) => {
          const isCurrent = activeNorm.includes(normalizeNotation(c.notation));
          return (
            <div
              key={c.notation}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono ${
                isCurrent
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 ring-1 ring-cyan-500/20'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
              <span>{c.notation}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
