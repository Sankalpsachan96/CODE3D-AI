import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, RotateCcw, X } from 'lucide-react';
import { fetchQuizQuestions, recordQuizHistory } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

export default function QuizModal({ isOpen, onClose, conceptId }) {
  const { isBright } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchQuizQuestions(conceptId).then((data) => {
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // Fallback local questions
        setQuestions([
          {
            id: 'q1',
            question: "What will be the value of 'i' when the loop condition 'i < arr.length' first evaluates to FALSE?",
            options: ["3", "4", "5", "0"],
            correctIndex: 1,
            explanation: "The loop terminates when i reaches 4 because 4 < 4 evaluates to FALSE."
          },
          {
            id: 'q2',
            question: "What is the time complexity of accessing an element in an array by index in Java?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            correctIndex: 0,
            explanation: "Arrays allow random access via memory address calculation in O(1) constant time."
          }
        ]);
      }
      setLoading(false);
      resetQuiz();
    });
  }, [isOpen, conceptId]);

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQIndex];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      recordQuizHistory({
        conceptId: conceptId || 'general',
        score,
        totalQuestions: questions.length,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col transition-colors duration-200 ${
        isBright
          ? 'bg-white border-slate-300 text-slate-900 shadow-slate-300'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isBright
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <HelpCircle size={16} />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>DSA Interactive Quiz</h2>
              <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Test algorithmic intuition &amp; program state tracking</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-1 rounded-lg transition cursor-pointer ${
            isBright ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}>
            <X size={18} />
          </button>
        </div>

        {/* Quiz Body */}
        <div className="p-6">
          {loading ? (
            <div className={`py-12 text-center text-xs font-mono ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Loading questions...
            </div>
          ) : quizFinished ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 mx-auto">
                <Award size={32} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Quiz Completed!</h3>
                <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  You scored <strong className={`text-base font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>{score}</strong> out of {questions.length} (
                  {Math.round((score / questions.length) * 100)}% accuracy)
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={resetQuiz}
                  className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer border ${
                    isBright
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <RotateCcw size={14} />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                    isBright
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                  }`}
                >
                  Return to Visualizer
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="space-y-4">
              {/* Question progress */}
              <div className={`flex items-center justify-between text-[11px] font-mono ${
                isBright ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span>Question {currentQIndex + 1} of {questions.length}</span>
                <span>Score: <strong className={isBright ? 'text-cyan-700 font-bold' : 'text-cyan-400'}>{score}</strong></span>
              </div>

              {/* Question text */}
              <h3 className={`text-sm font-semibold leading-relaxed ${isBright ? 'text-slate-900' : 'text-white'}`}>
                {currentQ.question}
              </h3>

              {/* Option choices */}
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isAnswered && idx === currentQ.correctIndex;
                  const isWrong = isAnswered && isSelected && idx !== currentQ.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-xl border text-xs text-left font-medium transition flex items-center justify-between cursor-pointer ${
                        isCorrect
                          ? isBright
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                            : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                          : isWrong
                          ? isBright
                            ? 'bg-rose-50 border-rose-400 text-rose-950'
                            : 'bg-rose-950/60 border-rose-500 text-rose-200'
                          : isSelected
                          ? isBright
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-950'
                            : 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                          : isBright
                          ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                          isBright ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && <CheckCircle size={16} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />}
                      {isWrong && <XCircle size={16} className={isBright ? 'text-rose-600' : 'text-rose-400'} />}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation Banner */}
              {isAnswered && (
                <div className={`border rounded-xl p-3.5 space-y-2 mt-3 transition-colors ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    isBright ? 'text-cyan-700' : 'text-cyan-400'
                  }`}>
                    <span>Explanation:</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-sans ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
                    {currentQ.explanation}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNext}
                      className={`px-4 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        isBright
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      {currentQIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
