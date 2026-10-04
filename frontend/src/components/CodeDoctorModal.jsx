import React, { useState, useEffect } from 'react';
import { X, Play, Sparkles, Lightbulb, CheckCircle2, ArrowRight, RefreshCw, Bug, Wrench, Layers, Clock, Cpu, Copy, Check, FileCode2 } from 'lucide-react';
import { autoCorrectCode, solveAndVisualizePersonalProblem } from '../services/apiService';
import { PERSONAL_PROBLEM_TEMPLATES, correctPersonalCode } from '../services/personalProblemSolver';
import { useTheme } from '../context/ThemeContext';

const STUDENT_RESULT_SAMPLE = `import java.util.Scanner;

class StudentResult {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter student name: ");
        String name = sc.nextLine();

        System.out.print("Enter marks in Java: ");
        int java = sc.nextInt();

        System.out.print("Enter marks in Python: ");
        int python = sc.nextInt();

        System.out.print("Enter marks in Maths: ");
        int maths = sc.nextInt();

        int total = java + python + maths;
        double percentage = total / 3.0;

        System.out.println("\\n--- Student Result ---");
        System.out.println("Name: " + name);
        System.out.println("Java: " + java);
        System.out.println("Python: " + python);
        System.out.println("Maths: " + maths);
        System.out.println("Total: " + total);
        System.out.println("Percentage: " + percentage);

        if (percentage >= 90)
            System.out.println("Grade: A+");
        else if (percentage >= 80)
            System.out.println("Grade: A");
        else if (percentage >= 70)
            System.out.println("Grade: B");
        else if (percentage >= 60)
            System.out.println("Grade: C");
        else
            System.out.println("Grade: D");

        sc.close();
    }
}`;

const BROKEN_SAMPLE_JAVA = `class BuggyStudent {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int java = 85;
        int python = 90;
        int maths = 80;
        int total = java + python + maths;
        double percentage = total / 3; // Integer division truncation!
        if (percentage >= 80) {
            printfln("Grade: A")
        }
    }
}`;

export default function CodeDoctorModal({
  isOpen,
  onClose,
  onApplyCorrectedCode,
  currentLanguage = 'java',
  currentCode = ''
}) {
  const { isBright } = useTheme();
  const [activeTab, setActiveTab] = useState('correct'); // 'correct' or 'solve'
  const [selectedLang, setSelectedLang] = useState(currentLanguage || 'java');
  const [inputCode, setInputCode] = useState(currentCode || STUDENT_RESULT_SAMPLE);
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [activeTemplateId, setActiveTemplateId] = useState(PERSONAL_PROBLEM_TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && currentCode && currentCode.trim().length > 15) {
      setInputCode(currentCode);
    }
  }, [isOpen, currentCode]);

  if (!isOpen) return null;

  const handleSelectTemplate = (template) => {
    setActiveTemplateId(template.id);
    const code = template.langCodes[selectedLang] || template.langCodes.java;
    setInputCode(code);
    setDiagnosisResult(null);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    if (activeTemplateId && activeTab === 'solve') {
      const template = PERSONAL_PROBLEM_TEMPLATES.find((t) => t.id === activeTemplateId);
      if (template && template.langCodes[lang]) {
        setInputCode(template.langCodes[lang]);
      }
    }
    setDiagnosisResult(null);
  };

  const handleCorrectCode = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    try {
      const res = await autoCorrectCode(inputCode, selectedLang);
      setDiagnosisResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleSolveProblem = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    try {
      const res = await solveAndVisualizePersonalProblem(inputCode, selectedLang);
      setDiagnosisResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    const codeToCopy = diagnosisResult?.correctedCode || inputCode;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToEditorOnly = () => {
    if (!diagnosisResult) return;
    onApplyCorrectedCode({
      code: diagnosisResult.correctedCode,
      language: diagnosisResult.language || selectedLang,
      trace: diagnosisResult.executionTrace?.steps || null,
      problemTitle: diagnosisResult.problemTitle || 'Personal Problem',
      timeComplexity: diagnosisResult.timeComplexity || 'O(n)',
      spaceComplexity: diagnosisResult.spaceComplexity || 'O(1)',
      launch3D: false
    });
    onClose();
  };

  const handleLaunch3D = () => {
    if (!diagnosisResult) return;
    onApplyCorrectedCode({
      code: diagnosisResult.correctedCode,
      language: diagnosisResult.language || selectedLang,
      trace: diagnosisResult.executionTrace?.steps || null,
      problemTitle: diagnosisResult.problemTitle || 'Personal Problem',
      timeComplexity: diagnosisResult.timeComplexity || 'O(n)',
      spaceComplexity: diagnosisResult.spaceComplexity || 'O(1)',
      launch3D: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200 ${
        isBright
          ? 'bg-white border-slate-300 shadow-slate-300 text-slate-900'
          : 'bg-[#090d16] border-cyan-500/30 shadow-cyan-950/60 text-white'
      }`}>
        {/* Header */}
        <div className={`p-3.5 sm:p-4 border-b flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-gradient-to-r from-amber-50/60 via-cyan-50/40 to-blue-50/40 border-slate-200'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-md shrink-0 ${
              isBright
                ? 'bg-gradient-to-br from-amber-200 to-cyan-100 border-amber-300 text-amber-800'
                : 'bg-gradient-to-br from-amber-500/20 via-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-amber-400'
            }`}>
              <Lightbulb size={20} className="fill-current/20" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm sm:text-base font-bold tracking-wide ${isBright ? 'text-slate-900' : 'text-white'}`}>
                  Personal Problem Solver &amp; AI Code Corrector
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border flex items-center gap-1 ${
                  isBright
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300 font-semibold'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
                }`}>
                  <Sparkles size={10} /> 3D Engine Ready
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Auto-correct broken code, detect bugs, or solve personal problems with full 3D simulation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition cursor-pointer border ${
              isBright
                ? 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-300'
                : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
            }`}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher: AI Code Corrector vs Problem Solver */}
        <div className={`px-4 pt-2.5 pb-2 border-b flex items-center justify-between gap-3 flex-wrap transition-colors ${
          isBright ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-1.5 p-1 rounded-xl border bg-slate-950/20 border-slate-800/60">
            <button
              onClick={() => { setActiveTab('correct'); setDiagnosisResult(null); }}
              className={`h-7 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'correct'
                  ? isBright
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-500 text-slate-950 shadow-xs shadow-cyan-500/30'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Wrench size={12} />
              <span>AI Code Corrector &amp; Fixer</span>
            </button>
            <button
              onClick={() => { setActiveTab('solve'); setDiagnosisResult(null); }}
              className={`h-7 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'solve'
                  ? isBright
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30'
                  : isBright
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Lightbulb size={12} />
              <span>Problem Solver &amp; Templates</span>
            </button>
          </div>

          {/* Target Language Toggle */}
          <div className={`inline-flex rounded-lg p-0.5 border gap-1 ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {[
              { id: 'java', label: '☕ Java' },
              { id: 'python', label: '🐍 Python' },
              { id: 'javascript', label: '🟨 JS' },
              { id: 'cpp', label: '⚡ C++' },
              { id: 'c', label: '🇨 C' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageChange(lang.id)}
                className={`h-6 px-2 rounded-md font-mono text-[11px] font-semibold transition cursor-pointer flex items-center ${
                  selectedLang === lang.id
                    ? isBright
                      ? 'bg-cyan-600 text-white'
                      : 'bg-cyan-500 text-slate-950'
                    : isBright
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {/* Quick Problem Templates Carousel (Visible in Solve Mode) */}
          {activeTab === 'solve' ? (
            <div className="space-y-1.5">
              <div className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                isBright ? 'text-slate-700' : 'text-slate-300'
              }`}>
                <Sparkles size={12} className={isBright ? 'text-amber-600' : 'text-amber-400'} />
                <span>Select a Personal Problem Template:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERSONAL_PROBLEM_TEMPLATES.map((tpl) => {
                  const isActive = activeTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? isBright
                            ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-xs'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                          : isBright
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:border-cyan-500'
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                      }`}
                    >
                      <span>{tpl.title}</span>
                      <span className={`text-[9px] px-1 rounded font-mono ${
                        tpl.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {tpl.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Quick Code Preset Helpers for AI Corrector Mode */
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
              <div className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                isBright ? 'text-slate-700' : 'text-slate-300'
              }`}>
                <Wrench size={12} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                <span>Quick Test Code Previews:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setInputCode(STUDENT_RESULT_SAMPLE);
                    setDiagnosisResult(null);
                  }}
                  className={`h-6 px-2.5 rounded-md border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isBright
                      ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                      : 'bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border-cyan-800'
                  }`}
                >
                  <FileCode2 size={11} />
                  <span>Load Student Result Code</span>
                </button>
                <button
                  onClick={() => {
                    setInputCode(BROKEN_SAMPLE_JAVA);
                    setDiagnosisResult(null);
                  }}
                  className={`h-6 px-2.5 rounded-md border text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                    isBright
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border-rose-800'
                  }`}
                >
                  <Bug size={11} />
                  <span>Load Broken Code (with Bugs)</span>
                </button>
              </div>
            </div>
          )}

          {/* Code Input & Diff Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Left: Input Code */}
            <div className="space-y-1.5 flex flex-col">
              <div className={`flex items-center justify-between text-[11px] ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <span className="font-semibold flex items-center gap-1">
                  <Lightbulb size={12} className={isBright ? 'text-amber-600' : 'text-amber-400'} />
                  {activeTab === 'correct' ? 'Your Code (Raw or with Bugs):' : 'Personal Problem / Code / Numbers:'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {inputCode.split('\n').length} lines
                </span>
              </div>
              <textarea
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setActiveTemplateId(null);
                  setDiagnosisResult(null);
                }}
                rows={11}
                spellCheck={false}
                placeholder={
                  activeTab === 'correct'
                    ? "Paste any code here (StudentResult, Scanner, custom arithmetic, functions, or broken code)..."
                    : "Enter personal problem description (e.g. 'Two Sum target 9', 'Reverse array'), or paste code..."
                }
                className={`w-full flex-1 font-mono text-xs p-3 rounded-xl border transition resize-none leading-relaxed focus:outline-none ${
                  isBright
                    ? 'bg-amber-50/50 text-slate-900 border-amber-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600'
                    : 'bg-[#050811] text-amber-200/90 border-amber-500/30 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                }`}
              />
            </div>

            {/* Right: Solved / Corrected Code Preview */}
            <div className="space-y-1.5 flex flex-col">
              <div className={`flex items-center justify-between text-[11px] ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <span className="font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />
                  {activeTab === 'correct' ? 'AI-Corrected & Executable 3D Code:' : 'Complete & Executable 3D Code:'}
                </span>
                {diagnosisResult && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyCode}
                      className={`h-5 px-1.5 rounded border text-[10px] flex items-center gap-1 cursor-pointer transition ${
                        copied
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : isBright
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title="Copy Corrected Code"
                    >
                      {copied ? <Check size={10} /> : <Copy size={10} />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                      isBright
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      ✓ 3D Trace ({diagnosisResult.executionTrace?.steps?.length || 0} steps)
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-full flex-1 font-mono text-xs p-3 rounded-xl border overflow-y-auto leading-relaxed whitespace-pre min-h-[220px] transition-colors ${
                isBright
                  ? 'bg-emerald-50/40 text-slate-900 border-emerald-300'
                  : 'bg-[#050811] text-emerald-300 border-emerald-500/30'
              }`}>
                {diagnosisResult ? (
                  diagnosisResult.correctedCode
                ) : (
                  <span className={`italic ${isBright ? 'text-slate-400' : 'text-slate-600'}`}>
                    {activeTab === 'correct'
                      ? 'Click "Inspect & Auto-Correct Code" below to analyze bugs, fix syntax/division issues, and generate full 3D trace.'
                      : 'Click "Solve & Auto-Generate 3D Code" below to synthesize complete working code with full 3D visualization.'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Assessment & Solution Overview */}
          {diagnosisResult && (
            <div className={`p-3.5 rounded-xl border space-y-2 animate-fadeIn transition-colors ${
              isBright
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-900/90 border-cyan-500/30 text-white'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                  <h4 className={`font-bold text-xs ${isBright ? 'text-slate-900' : 'text-white'}`}>
                    {diagnosisResult.problemTitle || 'Solution Summary'}:
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isBright ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                  }`}>
                    <Clock size={10} /> Time: {diagnosisResult.timeComplexity || 'O(n)'}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    isBright ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    <Cpu size={10} /> Space: {diagnosisResult.spaceComplexity || 'O(1)'}
                  </span>
                </div>
              </div>

              {diagnosisResult.errorsFound && diagnosisResult.errorsFound.length > 0 ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                    {`Bugs Detected & Corrected (${diagnosisResult.errorsFound.length}):`}
                  </span>
                  {diagnosisResult.errorsFound.map((err, i) => (
                    <div key={i} className={`flex items-start gap-1.5 text-[11px] p-1.5 rounded-lg border ${
                      isBright
                        ? 'bg-white text-slate-800 border-slate-200'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800'
                    }`}>
                      <span className={`font-bold shrink-0 ${isBright ? 'text-emerald-600' : 'text-emerald-400'}`}>✓</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-[11px] ${isBright ? 'text-emerald-700 font-medium' : 'text-emerald-400'}`}>
                  ✓ Code verified 100% clean and structured for full 3D WebGL animation!
                </p>
              )}

              <p className={`text-[11px] italic ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                {diagnosisResult.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons Bar */}
        <div className={`p-3 sm:p-4 border-t flex items-center justify-between transition-colors flex-wrap gap-2 ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <button
            onClick={() => {
              setInputCode('');
              setActiveTemplateId(null);
              setDiagnosisResult(null);
            }}
            className={`h-8 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
              isBright
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            Clear Editor
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'correct' ? (
              <button
                onClick={handleCorrectCode}
                disabled={loading || !inputCode.trim()}
                className={`h-8 px-3.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  isBright
                    ? 'bg-white hover:bg-slate-100 border-cyan-400 text-cyan-800 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
                }`}
              >
                <Wrench size={13} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Inspecting & Fixing...' : 'Inspect & Auto-Correct Code'}</span>
              </button>
            ) : (
              <button
                onClick={handleSolveProblem}
                disabled={loading || !inputCode.trim()}
                className={`h-8 px-3.5 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                  isBright
                    ? 'bg-white hover:bg-slate-100 border-amber-400 text-amber-800 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
                }`}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>{loading ? 'Solving...' : 'Solve & Auto-Generate 3D Code'}</span>
              </button>
            )}

            {diagnosisResult && (
              <button
                onClick={handleApplyToEditorOnly}
                className={`h-8 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  isBright
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Send corrected code to the main code editor"
              >
                <span>Apply to Editor</span>
              </button>
            )}

            <button
              onClick={handleLaunch3D}
              disabled={!diagnosisResult}
              className={`h-8 px-4 rounded-lg font-bold text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${
                isBright
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Play size={13} className="fill-current" />
              <span>Visualize in 3D with Complete Code</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
