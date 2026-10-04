import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

import { recordQuizHistory } from '../services/apiService';
import { generateAIQuiz } from '../services/groqQuizService';
import { useTheme } from '../context/ThemeContext';

export default function QuizArena() {
  const { isBright } = useTheme();

  const [selectedConcept, setSelectedConcept] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] =
    useState(null);

  const [isAnswered, setIsAnswered] =
    useState(false);

  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /*
   * Generate a new AI quiz whenever
   * the selected topic changes.
   */
  useEffect(() => {
    if (!quizStarted || !selectedConcept) return;
    generateQuiz();
  }, [quizStarted, selectedConcept]);

  const generateQuiz = async () => {
    setLoading(true);
    setError('');

    setQuestions([]);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);

    try {
      const generatedQuestions =
        await generateAIQuiz(
          selectedConcept,
          10
        );

      setQuestions(generatedQuestions);
    } catch (err) {
      console.error(
        'AI Quiz Error:',
        err
      );

      setError(
        err?.message ||
          'Unable to generate quiz.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
 * User selects an answer.
 * Answer is NOT verified yet.
 */
const handleSelect = (idx) => {
  if (isAnswered) return;

  const currentQuestion =
    questions[currentQIndex];

  if (!currentQuestion) return;

  // Only select the option.
  // User can change it before submitting.
  setSelectedOption(idx);
};

/*
 * Submit the selected answer.
 */
const handleSubmit = () => {
  if (isAnswered || selectedOption === null) return;

  const currentQuestion =
    questions[currentQIndex];

  if (!currentQuestion) return;

  // Now lock and verify the answer.
  setIsAnswered(true);

  if (
    selectedOption === currentQuestion.correctIndex
  ) {
    setScore((previousScore) =>
      previousScore + 1
    );
  }
};

/*
 * Move to next question.
 */
const handleNext = () => {
  // Don't move until answer is submitted.
  if (!isAnswered) return;

  if (
    currentQIndex <
    questions.length - 1
  ) {
    setCurrentQIndex(
      (previousIndex) =>
        previousIndex + 1
    );

    setSelectedOption(null);
    setIsAnswered(false);
  } else {
    finishQuiz();
  }
};

/*
 * Finish quiz and save history.
 */
  const finishQuiz = () => {
    const finalScore =
      score +
      (
        selectedOption !== null &&
        questions[currentQIndex] &&
        selectedOption ===
          questions[currentQIndex]
            .correctIndex
          ? 1
          : 0
      );

    setScore(finalScore);
    setQuizFinished(true);

    recordQuizHistory({
      conceptId: selectedConcept,
      score: finalScore,
      totalQuestions: questions.length,
    });
  };

  /*
   * Retry current topic with
   * completely new AI questions.
   */
  const handleRetry = () => {
    if (!selectedConcept) return;
    generateQuiz();
  };

  const handleStartQuiz = () => {
    if (!selectedConcept) return;
    setQuizStarted(true);
  };

  const handleChangeTopic = (value) => {
    setSelectedConcept(value);
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setLoading(false);
    setError('');
  };

  const currentQ =
    questions[currentQIndex];

  const percentage =
    questions.length > 0
      ? Math.round(
          (score / questions.length) *
            100
        )
      : 0;

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${
        isBright
          ? 'bg-slate-50 text-slate-900'
          : 'bg-[#070b14] text-slate-100'
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">

        {/* =====================================
            HEADER
        ===================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border ${
                isBright
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                  : 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400'
              }`}
            >
              <Sparkles size={13} />

              <span>
                AI Quiz Arena
              </span>
            </div>

            <h1
              className={`text-3xl font-extrabold ${
                isBright
                  ? 'text-slate-900'
                  : 'text-white'
              }`}
            >
              DSA Interactive Quiz
            </h1>

            <p
              className={`text-xs mt-1 ${
                isBright
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              AI-generated questions based on
              the topic you choose.
            </p>

          </div>


          {/* =====================================
              TOPIC PICKER
          ===================================== */}
          <div className="flex items-center gap-2">

            <span
              className={`text-xs font-medium ${
                isBright
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              Topic:
            </span>

            <select
              value={selectedConcept}
              onChange={(e) => handleChangeTopic(e.target.value)}
              disabled={loading}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyan-500 cursor-pointer border transition-colors ${
                isBright
                  ? 'bg-white border-slate-300 text-slate-800 shadow-sm font-semibold'
                  : 'bg-slate-900 border-slate-700 text-cyan-300'
              }`}
            >
              <option value="">Select a topic…</option>
              <option value="array-loop">
                1D Arrays & Memory
              </option>

              <option value="matrix">
                2D Matrices & Row-Major
              </option>

              <option value="linked-list">
                Singly & Doubly Linked Lists
              </option>

              <option value="stack">
                Stack (LIFO & Monotonic)
              </option>

              <option value="queue">
                Queue (FIFO, Deque & Heaps)
              </option>

              <option value="bst">
                Binary Search Tree (BST)
              </option>

              <option value="trees-advanced">
                Advanced Trees (AVL & LCA)
              </option>

              <option value="bubble-sort">
                Bubble Sort
              </option>

              <option value="binary-search">
                Binary Search
              </option>

              <option value="recursion">
                Recursion & Call Stack
              </option>

              <option value="graphs">
                Graph Algorithms
              </option>

              <option value="dp-hashing">
                Dynamic Programming & Hashing
              </option>

              <option value="c-lang">
                C Pointers & Memory
              </option>

              <option value="cpp-lang">
                C++ STL & Vectors
              </option>

              <option value="python-lang">
                Python Lists & Dicts
              </option>

              <option value="js-lang">
                JavaScript ES6+ & Event Loop
              </option>
            </select>

          </div>

        </div>


        {/* =====================================
            MAIN QUIZ CARD
        ===================================== */}
        <div
          className={`border rounded-2xl p-6 md:p-8 shadow-xl transition-colors ${
            isBright
              ? 'bg-white border-slate-200 shadow-slate-200 text-slate-800'
              : 'bg-slate-900/70 border-slate-800/90 text-slate-100'
          }`}
        >

          {!quizStarted && (
            <div className="py-14 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto">
                <BookOpen size={30} className="text-cyan-500" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Choose your topic first</h2>
                <p className={`text-xs mt-2 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Select a DSA topic above, then start the quiz when you&apos;re ready.</p>
              </div>
              <button type="button" onClick={handleStartQuiz} disabled={!selectedConcept}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10">
                Start Quiz
              </button>
            </div>
          )}

          {quizStarted && (
          <>

          {/* =====================================
              LOADING
          ===================================== */}
          {loading && (
            <div className="py-16 text-center space-y-5">

              <div className="relative w-12 h-12 mx-auto">

                <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full" />

                <div className="absolute inset-0 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />

              </div>

              <div>
                <p
                  className={`text-sm font-semibold ${
                    isBright
                      ? 'text-slate-800'
                      : 'text-white'
                  }`}
                >
                  AI is generating your quiz...
                </p>

                <p
                  className={`text-xs mt-1 font-mono ${
                    isBright
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  Creating questions for your
                  selected topic
                </p>
              </div>

            </div>
          )}


          {/* =====================================
              ERROR
          ===================================== */}
          {!loading && error && (
            <div className="py-12 text-center space-y-5">

              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
                <XCircle
                  size={30}
                  className="text-rose-500"
                />
              </div>

              <div>
                <h3
                  className={`text-lg font-bold ${
                    isBright
                      ? 'text-slate-900'
                      : 'text-white'
                  }`}
                >
                  Quiz generation failed
                </h3>

                <p
                  className={`text-xs mt-2 max-w-lg mx-auto ${
                    isBright
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {error}
                </p>
              </div>

              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 mx-auto transition"
              >
                <RotateCcw size={15} />

                Try Again
              </button>

            </div>
          )}


          {/* =====================================
              RESULTS
          ===================================== */}
          {!loading &&
            !error &&
            quizFinished && (
              <div className="text-center py-10 space-y-6">

                <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 mx-auto">
                  <Award size={40} />
                </div>

                <div>

                  <h3
                    className={`text-2xl font-bold ${
                      isBright
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  >
                    Quiz Complete!
                  </h3>

                  <p
                    className={`text-sm mt-2 ${
                      isBright
                        ? 'text-slate-600'
                        : 'text-slate-300'
                    }`}
                  >
                    Your AI-generated assessment
                    is complete.
                  </p>

                </div>


                {/* SCORE */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">

                  <div
                    className={`rounded-xl border p-5 ${
                      isBright
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <p className="text-xs text-slate-500">
                      SCORE
                    </p>

                    <p className="text-3xl font-extrabold text-cyan-500 mt-1">
                      {score}/{questions.length}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-5 ${
                      isBright
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <p className="text-xs text-slate-500">
                      ACCURACY
                    </p>

                    <p className="text-3xl font-extrabold text-emerald-500 mt-1">
                      {percentage}%
                    </p>
                  </div>

                </div>


                <button
                  onClick={handleRetry}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mx-auto transition cursor-pointer border ${
                    isBright
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  <RotateCcw size={15} />

                  Generate New Quiz
                </button>

              </div>
            )}


          {/* =====================================
              QUESTION
          ===================================== */}
          {!loading &&
            !error &&
            !quizFinished &&
            currentQ && (

              <div className="space-y-6">

                {/* Progress */}
                <div
                  className={`flex items-center justify-between text-xs font-mono pb-4 border-b ${
                    isBright
                      ? 'text-slate-500 border-slate-100'
                      : 'text-slate-400 border-slate-800'
                  }`}
                >
                  <span>
                    Question {currentQIndex + 1}{' '}
                    of {questions.length}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full border ${
                      isBright
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    Score:{' '}
                    <strong
                      className={
                        isBright
                          ? 'text-cyan-700 font-bold'
                          : 'text-cyan-400'
                      }
                    >
                      {score}
                    </strong>
                  </span>
                </div>


                {/* Question */}
                <h2
                  className={`text-base md:text-lg font-bold leading-relaxed ${
                    isBright
                      ? 'text-slate-900'
                      : 'text-white'
                  }`}
                >
                  {currentQ.question}
                </h2>


                {/* Options */}
                <div className="space-y-3 pt-2">

                  {currentQ.options.map(
                    (opt, idx) => {

                      const isSelected =
                        selectedOption === idx;

                      const isCorrect =
                        isAnswered &&
                        idx ===
                          currentQ.correctIndex;

                      const isWrong =
                        isAnswered &&
                        isSelected &&
                        idx !==
                          currentQ.correctIndex;

                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            handleSelect(idx)
                          }
                          disabled={isAnswered}
                          className={`w-full p-4 rounded-xl border text-sm text-left font-medium transition flex items-center justify-between cursor-pointer ${
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
                              ? 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >

                          <div className="flex items-center gap-3.5">

                            <span
                              className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-mono font-bold ${
                                isBright
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {String.fromCharCode(
                                65 + idx
                              )}
                            </span>

                            <span>
                              {opt}
                            </span>

                          </div>


                          {isCorrect && (
                            <CheckCircle
                              size={18}
                              className="text-emerald-500 shrink-0"
                            />
                          )}

                          {isWrong && (
                            <XCircle
                              size={18}
                              className="text-rose-500 shrink-0"
                            />
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

                {/* Submit Answer */}
{!isAnswered && (
  <div className="pt-2 flex justify-end">
    <button
      onClick={handleSubmit}
      disabled={selectedOption === null}
      className={`px-5 py-2.5 rounded-lg font-bold text-xs transition ${
        selectedOption === null
          ? isBright
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          : isBright
          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 cursor-pointer'
          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
      }`}
    >
      Submit Answer
    </button>
  </div>
)}


                {/* Explanation */}
                {isAnswered && (
                  <div
                    className={`rounded-xl p-4 space-y-3 mt-4 border ${
                      isBright
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >

                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        selectedOption ===
                        currentQ.correctIndex
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {selectedOption ===
                      currentQ.correctIndex
                        ? '✓ Correct'
                        : '✕ Incorrect'}
                    </span>

                    <p
                      className={`text-xs leading-relaxed font-sans ${
                        isBright
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {currentQ.explanation}
                    </p>


                    <div className="pt-2 flex justify-end">

                      <button
                        onClick={handleNext}
                        className={`px-5 py-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                          isBright
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        }`}
                      >
                        {currentQIndex <
                        questions.length - 1
                          ? 'Next Question →'
                          : 'View Results'}
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </>
          )}

        </div>
      </div>
    </div>
  );
}