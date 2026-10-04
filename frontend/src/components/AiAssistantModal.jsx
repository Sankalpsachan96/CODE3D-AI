import React, { useEffect, useState } from 'react';
import { Sparkles, HelpCircle, Lightbulb, Compass, Code, X, ChevronRight, Check } from 'lucide-react';
import { requestAiExplanation } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

export default function AiAssistantModal({ isOpen, onClose, code, currentLineNumber, currentStepNumber, language = 'java', currentStep = null, output = [], error = null, detectedDsa = null, detectedAlgorithm = null }) {
  const { isBright } = useTheme();
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeQuery, setActiveQuery] = useState('WHY');

  useEffect(() => {
    if (isOpen && code) {
      handleAsk(error ? 'WHY' : 'EXPLAIN_CODE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAsk = async (queryType) => {
    setActiveQuery(queryType);
    setLoading(true);
    const res = await requestAiExplanation(code, currentLineNumber, currentStepNumber, queryType, level, language, { currentStep, output, error, detectedDsa, detectedAlgorithm });
    if (res) {
      setResponse(res);
    } else {
      // Fallback local explanation
      setResponse({
        explanation: `Analysis (${level} mode): The code executes line ${currentLineNumber} during step ${currentStepNumber}. In Java, operations inside loops are validated against invariant bounds before accessing array memory.`,
        hint: "Observe how variables change monotonically with each iteration.",
        keyTakeaway: "Loop invariants ensure safety and predictable termination."
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-200 ${
        isBright
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-300'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-slate-50 border-slate-200'
            : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isBright
                ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
            }`}>
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className={`text-sm font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                CODE3D AI Tutor <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                  isBright
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
                }`}>Real-time</span>
              </h2>
              <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Pedagogical execution reasoning &amp; algorithmic hints</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1 rounded-lg transition cursor-pointer ${
            isBright ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
            <X size={18} />
          </button>
        </div>

        {/* Level Selector */}
        <div className={`px-5 py-2.5 border-b flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-slate-100/70 border-slate-200'
            : 'bg-slate-950/50 border-slate-800/80'
        }`}>
          <span className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Explanation Level:</span>
          <div className="flex gap-1.5">
            {['Beginner', 'Intermediate', 'DSA'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  level === lvl
                    ? isBright
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : isBright
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`p-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 border-b transition-colors ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/60'
        }`}>
          <button
            onClick={() => handleAsk('WHY')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
              activeQuery === 'WHY'
                ? isBright
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : isBright
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <HelpCircle size={15} className={isBright ? 'text-cyan-700 shrink-0' : 'text-cyan-400 shrink-0'} />
            <div>
              <div className="font-bold">Why?</div>
              <div className={`text-[10px] font-normal ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Deep operation reasoning</div>
            </div>
          </button>

          <button
            onClick={() => handleAsk('HINT')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
              activeQuery === 'HINT'
                ? isBright
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : isBright
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Lightbulb size={15} className={isBright ? 'text-amber-600 shrink-0' : 'text-amber-400 shrink-0'} />
            <div>
              <div className="font-bold">Give Hint</div>
              <div className={`text-[10px] font-normal ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Progressive clue</div>
            </div>
          </button>

          <button
            onClick={() => handleAsk('PREDICT_NEXT')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
              activeQuery === 'PREDICT_NEXT'
                ? isBright
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : isBright
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Compass size={15} className={isBright ? 'text-emerald-600 shrink-0' : 'text-emerald-400 shrink-0'} />
            <div>
              <div className="font-bold">Predict Next</div>
              <div className={`text-[10px] font-normal ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Next execution step</div>
            </div>
          </button>

          <button
            onClick={() => handleAsk('EXPLAIN_LINE')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left cursor-pointer ${
              activeQuery === 'EXPLAIN_LINE'
                ? isBright
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : isBright
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Code size={15} className={isBright ? 'text-blue-600 shrink-0' : 'text-blue-400 shrink-0'} />
            <div>
              <div className="font-bold">Explain Line {currentLineNumber}</div>
              <div className={`text-[10px] font-normal ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Single statement breakdown</div>
            </div>
          </button>

          <button
            onClick={() => handleAsk('EXPLAIN_CODE')}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition text-left sm:col-span-2 cursor-pointer ${
              activeQuery === 'EXPLAIN_CODE'
                ? isBright
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : isBright
                ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Sparkles size={15} className={isBright ? 'text-purple-600 shrink-0' : 'text-purple-400 shrink-0'} />
            <div>
              <div className="font-bold">Explain Full Algorithm</div>
              <div className={`text-[10px] font-normal ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Architecture &amp; complexity analysis</div>
            </div>
          </button>
        </div>

        {/* AI Output Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className={`text-xs font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Synthesizing pedagogical explanation...</span>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 transition-colors ${
                isBright ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                  isBright ? 'text-cyan-700' : 'text-cyan-400'
                }`}>
                  Reasoning
                </span>
                <p className={`text-sm leading-relaxed font-sans ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
                  {response.explanation}
                </p>
              </div>

              {response.hint && (
                <div className={`border rounded-xl p-3.5 flex items-start gap-2.5 transition-colors ${
                  isBright
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-amber-950/20 border-amber-800/40 text-amber-200/90'
                }`}>
                  <Lightbulb size={16} className={`shrink-0 mt-0.5 ${isBright ? 'text-amber-600' : 'text-amber-400'}`} />
                  <div>
                    <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-amber-700' : 'text-amber-400'}`}>Pro Tip / Hint</span>
                    <p className="text-xs mt-0.5">{response.hint}</p>
                  </div>
                </div>
              )}

              {response.whatWentWrong && (
                <div className={`border rounded-xl p-3.5 ${isBright ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/20 border-rose-800/40 text-rose-200'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-rose-700' : 'text-rose-400'}`}>What went wrong</span>
                  <p className="text-xs mt-1 leading-relaxed">{response.whatWentWrong}</p>
                </div>
              )}
              {response.whyItHappened && (
                <div className={`border rounded-xl p-3.5 ${isBright ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/20 border-amber-800/40 text-amber-200'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-amber-700' : 'text-amber-400'}`}>Why it happened</span>
                  <p className="text-xs mt-1 leading-relaxed">{response.whyItHappened}</p>
                </div>
              )}
              {response.solution && (
                <div className={`border rounded-xl p-3.5 ${isBright ? 'bg-blue-50 border-blue-200 text-blue-950' : 'bg-blue-950/20 border-blue-800/40 text-blue-200'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-blue-700' : 'text-blue-400'}`}>Solution</span>
                  <p className="text-xs mt-1 leading-relaxed">{response.solution}</p>
                </div>
              )}
              {response.prevention && (
                <div className={`border rounded-xl p-3.5 ${isBright ? 'bg-violet-50 border-violet-200 text-violet-950' : 'bg-violet-950/20 border-violet-800/40 text-violet-200'}`}>
                  <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-violet-700' : 'text-violet-400'}`}>How to prevent it</span>
                  <p className="text-xs mt-1 leading-relaxed">{response.prevention}</p>
                </div>
              )}

              {response.keyTakeaway && (
                <div className={`border rounded-xl p-3.5 flex items-start gap-2.5 transition-colors ${
                  isBright
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200/90'
                }`}>
                  <Check size={16} className={`shrink-0 mt-0.5 ${isBright ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  <div>
                    <span className={`text-[10px] uppercase font-bold block ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>Key Takeaway</span>
                    <p className="text-xs mt-0.5">{response.keyTakeaway}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-10 text-xs ${isBright ? 'text-slate-400' : 'text-slate-500'}`}>
              Select one of the questions above to receive an explanation tailored to the current execution state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
