import React from 'react';
import { Variable, CheckCircle2, XCircle, Sparkles, Layers, Cpu, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import StepInspector from './StepInspector';
import ComplexityPanel from './ComplexityPanel';
import VariableInspector from './VariableInspector';

export default function StatePanel({ currentStep, totalSteps, correctOutput = null, isAtEnd = false, complexity = null, algorithmName = 'Algorithm' }) {
  const { isBright } = useTheme();

  if (!currentStep) return null;

  const {
    stepNumber,
    lineNumber,
    variables = {},
    changedVariable,
    previousValue,
    currentValue,
    condition,
    explanation,
    aiHint,
  } = currentStep;

  return (
    <div className={`flex flex-col h-full border-l overflow-y-auto transition-colors duration-200 ${
      isBright
        ? 'bg-white text-slate-800 border-slate-200'
        : 'bg-[#0b101d] text-slate-200 border-slate-800/80'
    }`}>
      {/* State Panel Header */}
      <div className={`h-10 border-b px-3.5 flex items-center justify-between sticky top-0 z-10 transition-colors ${
        isBright
          ? 'bg-slate-50/95 border-slate-200 text-slate-800'
          : 'bg-slate-900/90 border-slate-800/80 text-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Cpu size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
            Program State
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Step <strong className={`font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>{stepNumber}</strong> of {totalSteps}
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1 text-xs">
        {/* Step Inspector Component */}
        <StepInspector currentStep={currentStep} totalSteps={totalSteps} />

        {/* Complexity & Big-O Curves Panel */}
        {complexity && (
          <ComplexityPanel complexity={complexity} algorithmName={algorithmName} />
        )}

        {/* Verified Correct Output Card */}
        {correctOutput && (
          <div className={`border rounded-lg p-3 transition-colors ${
            isAtEnd
              ? isBright
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40'
              : isBright
                ? 'bg-cyan-50/90 border-cyan-200 text-cyan-950'
                : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isAtEnd ? 'text-emerald-500' : 'text-cyan-400'}`}>
                {isAtEnd ? '🏆 Verified Correct Output' : '⚡ Output Result'}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isAtEnd ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {isAtEnd ? '100% CORRECT' : 'EVALUATING'}
              </span>
            </div>
            <div className="font-mono text-xs font-bold break-all">
              {correctOutput}
            </div>
          </div>
        )}

        {/* Variable Inspector Section */}
        <VariableInspector
          variables={variables}
          scope={currentStep?.scope || 'main'}
          changedVariable={changedVariable}
        />

        {/* Condition Evaluation Card */}
        {condition ? (
          <div className={`border rounded-lg p-3 transition-colors ${
            isBright
              ? 'bg-slate-50/80 border-slate-200'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-xs ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                Condition Evaluation
              </span>
              {condition.result ? (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isBright
                    ? 'text-emerald-800 bg-emerald-100 border-emerald-300'
                    : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                }`}>
                  <CheckCircle2 size={11} /> TRUE
                </span>
              ) : (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isBright
                    ? 'text-rose-800 bg-rose-100 border-rose-300'
                    : 'text-rose-400 bg-rose-950/60 border-rose-800/50'
                }`}>
                  <XCircle size={11} /> FALSE
                </span>
              )}
            </div>

            <div className={`space-y-1 rounded p-2 font-mono text-[11px] border ${
              isBright
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-950/70 border-slate-800 text-slate-300'
            }`}>
              <div className={isBright ? 'text-slate-600' : 'text-slate-400'}>
                Expression: <span className={`font-medium ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>{condition.expression}</span>
              </div>
              <div className={isBright ? 'text-slate-600' : 'text-slate-400'}>
                Evaluation: <span className={`font-semibold ${isBright ? 'text-cyan-700' : 'text-cyan-300'}`}>{condition.evaluation}</span>
              </div>
              <div className={`text-[10px] mt-1 pt-1 border-t ${
                isBright ? 'border-slate-100 text-slate-500' : 'border-slate-800/60 text-slate-500'
              }`}>
                Branch: <span className={isBright ? 'text-slate-800 font-semibold' : 'text-slate-300'}>{condition.branch}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Call Stack */}
        <div className={`border rounded-lg p-3 transition-colors ${
          isBright
            ? 'bg-slate-50/80 border-slate-200'
            : 'bg-slate-900/60 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Layers size={13} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
            <span className={`font-semibold text-xs ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
              Call Stack
            </span>
          </div>
          <div className={`border rounded p-2 font-mono text-[11px] flex items-center justify-between ${
            isBright
              ? 'bg-white border-slate-200 text-slate-700'
              : 'bg-slate-950/50 border-slate-800 text-slate-300'
          }`}>
            <span className={isBright ? 'text-cyan-700 font-semibold' : 'text-cyan-400'}>
              Main.execute()
            </span>
            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
              line {lineNumber}
            </span>
          </div>
        </div>

        {/* AI Pedagogical Explanation */}
        <div className={`border rounded-lg p-3 transition-colors ${
          isBright
            ? 'bg-gradient-to-br from-cyan-50 via-sky-50 to-indigo-50 border-cyan-200 shadow-2xs'
            : 'bg-gradient-to-br from-cyan-950/30 to-slate-900/60 border-cyan-800/30'
        }`}>
          <div className={`flex items-center gap-1.5 mb-1.5 font-semibold text-xs ${
            isBright ? 'text-cyan-800' : 'text-cyan-400'
          }`}>
            <Sparkles size={13} />
            <span>Execution Insight</span>
          </div>
          <p className={`text-[11.5px] leading-relaxed font-sans ${
            isBright ? 'text-slate-700' : 'text-slate-300'
          }`}>
            {explanation}
          </p>

          {aiHint && (
            <div className={`mt-2 pt-2 border-t text-[11px] flex items-start gap-1.5 ${
              isBright
                ? 'border-cyan-200 text-slate-600'
                : 'border-cyan-900/30 text-slate-400'
            }`}>
              <span className={`font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>Hint:</span>
              <span>{aiHint}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
