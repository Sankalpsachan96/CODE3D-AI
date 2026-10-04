import React, { useState } from 'react';
import { X, Play, Code2, Sparkles, Cpu, Layers, Braces, Terminal, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LANGUAGE_TEMPLATES = {
  python: `# Python 3.12 - Custom Array Analysis
numbers = [14, 52, 8, 91, 33]

print("Starting custom Python execution:")
for i in range(len(numbers)):
    val = numbers[i]
    print(f"Index {i} -> {val}")
`,
  c: `// C Standard - Contiguous Array Traversal
#include <stdio.h>

int main() {
    int arr[] = {25, 60, 15, 80, 45};
    int n = 5;

    for (int i = 0; i < n; i++) {
        printf("Element: %d\\n", arr[i]);
    }
    return 0;
}
`,
  cpp: `// C++ Standard - STL Vector Iteration
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {10, 40, 25, 70, 95};

    for (int i = 0; i < arr.size(); i++) {
        std::cout << "Vector item: " << arr[i] << std::endl;
    }
    return 0;
}
`,
  java: `// Java 21 - Dynamic 3D Array Execution
public class Main {
    public static void main(String[] args) {
        int[] arr = {18, 45, 9, 62, 31};

        for (int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
        }
    }
}
`,
  javascript: `// JavaScript (ES6+ / Node.js 20) - 3D Array Execution
const arr = [12, 36, 48, 72, 96];

console.log("Starting 3D JavaScript execution:");
for (let i = 0; i < arr.length; i++) {
    console.log(\`Element [\${i}] = \${arr[i]}\`);
}
`
};

export default function CustomCodeModal({
  isOpen,
  onClose,
  onApplyCustomCode,
  currentLanguage = 'java'
}) {
  const { isBright } = useTheme();
  const [selectedLang, setSelectedLang] = useState(currentLanguage || 'java');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES[currentLanguage] || LANGUAGE_TEMPLATES.java);
  const [customArrayInput, setCustomArrayInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setCode(LANGUAGE_TEMPLATES[lang] || '');
  };

  const handleApplyArrayValues = () => {
    if (!customArrayInput.trim()) return;
    const cleanNumbers = customArrayInput
      .replace(/[[\]{}]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !isNaN(s) && s !== '')
      .join(', ');

    if (!cleanNumbers) return;

    if (selectedLang === 'python') {
      setCode(`numbers = [${cleanNumbers}]\n\nfor i in range(len(numbers)):\n    print(numbers[i])\n`);
    } else if (selectedLang === 'c') {
      const count = cleanNumbers.split(',').length;
      setCode(`#include <stdio.h>\n\nint main() {\n    int arr[] = {${cleanNumbers}};\n    int n = ${count};\n    for(int i = 0; i < n; i++) {\n        printf("%d\\n", arr[i]);\n    }\n    return 0;\n}\n`);
    } else if (selectedLang === 'cpp') {
      setCode(`#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> arr = {${cleanNumbers}};\n    for(int i = 0; i < arr.size(); i++) {\n        std::cout << arr[i] << std::endl;\n    }\n    return 0;\n}\n`);
    } else {
      setCode(`public class Main {\n    public static void main(String[] args) {\n        int[] arr = {${cleanNumbers}};\n        for(int i = 0; i < arr.length; i++) {\n            System.out.println(arr[i]);\n        }\n    }\n}\n`);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    try {
      await onApplyCustomCode({
        code,
        language: selectedLang,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-3xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200 ${
        isBright
          ? 'bg-white border-slate-300 shadow-slate-300 text-slate-900'
          : 'bg-[#090d16] border-cyan-500/30 shadow-cyan-950/50 text-white'
      }`}>
        {/* Header */}
        <div className={`p-4 md:p-5 border-b flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-gradient-to-r from-slate-50 via-cyan-50/40 to-blue-50/40 border-slate-200'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isBright
                ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <Code2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base md:text-lg font-bold tracking-wide ${isBright ? 'text-slate-900' : 'text-white'}`}>
                  Input Any Custom Code for 3D Execution
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  isBright
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                    : 'bg-cyan-950 text-cyan-400 border-cyan-800/60'
                }`}>
                  Universal Engine
                </span>
              </div>
              <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Write or paste code in C, C++, Python, or Java. Values and loops render directly in 3D.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isBright ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Language Selector Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
            isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isBright ? 'text-slate-700' : 'text-slate-400'}`}>Select Language:</span>
              <div className={`inline-flex rounded-lg p-1 border gap-1 ${
                isBright ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                {[
                  { id: 'java', label: 'Java', icon: '☕' },
                  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
                  { id: 'python', label: 'Python', icon: '🐍' },
                  { id: 'c', label: 'C', icon: '🇨' },
                  { id: 'cpp', label: 'C++', icon: '⚡' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      selectedLang === lang.id
                        ? isBright
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                        : isBright
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Array Values Shortcut */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. 5, 22, 9, 81, 33"
                value={customArrayInput}
                onChange={(e) => setCustomArrayInput(e.target.value)}
                className={`border rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-cyan-500 w-36 sm:w-44 transition-colors ${
                  isBright
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700/80 text-cyan-300'
                }`}
              />
              <button
                type="button"
                onClick={handleApplyArrayValues}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition cursor-pointer ${
                  isBright
                    ? 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800'
                    : 'bg-cyan-950 hover:bg-cyan-900 border-cyan-700 text-cyan-300'
                }`}
                title="Inject array values into code template"
              >
                Set Array
              </button>
            </div>
          </div>

          {/* Code Textarea Area */}
          <div className="space-y-1.5">
            <div className={`flex items-center justify-between text-[11px] ${
              isBright ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <span className="font-mono flex items-center gap-1">
                <Terminal size={12} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
                Source Code ({selectedLang.toUpperCase()})
              </span>
              <span className={isBright ? 'text-slate-400' : 'text-slate-500'}>Edit array values, loops, conditions, or variables</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              spellCheck={false}
              className={`w-full font-mono text-xs p-3.5 rounded-xl border transition resize-none leading-relaxed focus:outline-none ${
                isBright
                  ? 'bg-slate-50 text-slate-900 border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/30'
                  : 'bg-[#050811] text-slate-200 border-slate-800 focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/30'
              }`}
            />
          </div>

          {/* Simulation Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className={`border rounded-lg p-2.5 flex items-center gap-2.5 transition-colors ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
            }`}>
              <div className={`p-1.5 rounded-md ${isBright ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-950 text-cyan-400'}`}>
                <Cpu size={14} />
              </div>
              <div>
                <p className={`text-[11px] font-semibold ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>AST Analysis</p>
                <p className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Tracks all variables &amp; loops</p>
              </div>
            </div>

            <div className={`border rounded-lg p-2.5 flex items-center gap-2.5 transition-colors ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
            }`}>
              <div className={`p-1.5 rounded-md ${isBright ? 'bg-purple-100 text-purple-800' : 'bg-purple-950 text-purple-400'}`}>
                <Layers size={14} />
              </div>
              <div>
                <p className={`text-[11px] font-semibold ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>Custom 3D Scene</p>
                <p className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Renders your array values</p>
              </div>
            </div>

            <div className={`border rounded-lg p-2.5 flex items-center gap-2.5 transition-colors ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-800/80'
            }`}>
              <div className={`p-1.5 rounded-md ${isBright ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-400'}`}>
                <Sparkles size={14} />
              </div>
              <div>
                <p className={`text-[11px] font-semibold ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>Time Travel</p>
                <p className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Step-by-step playback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between transition-colors ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <button
            onClick={() => setCode(LANGUAGE_TEMPLATES[selectedLang])}
            className={`text-xs transition cursor-pointer ${
              isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Reset to Template
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                isBright ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer disabled:opacity-50 ${
                isBright
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              <Play size={14} className="fill-current" />
              <span>{isSubmitting ? 'Analyzing & Simulating...' : 'Analyze & Visualize in 3D'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
