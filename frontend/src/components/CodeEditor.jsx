import React, { useRef, useEffect, useState } from 'react';

import Editor from '@monaco-editor/react';

import { Play, RotateCcw, FileCode, CheckCircle2, RefreshCw, ChevronDown, Coffee, Braces, Hash, Terminal } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';



const LANGUAGE_CONFIG = {

  java: {

    monacoLang: 'java',

    fileName: 'Main.java',

    badge: 'Java 21',

    label: 'Java',

    icon: Coffee

  },

  python: {

    monacoLang: 'python',

    fileName: 'main.py',

    badge: 'Python 3.12',

    label: 'Python',

    icon: Terminal

  },

  c: {

    monacoLang: 'c',

    fileName: 'main.c',

    badge: 'C17 Standard',

    label: 'C',

    icon: Hash

  },

  cpp: {

    monacoLang: 'cpp',

    fileName: 'main.cpp',

    badge: 'C++20 STL',

    label: 'C++',

    icon: Braces

  },

  javascript: {

    monacoLang: 'javascript',

    fileName: 'main.js',

    badge: 'Node.js / ES2024',

    label: 'JavaScript',

    icon: Braces

  }

};



const LANGUAGE_OPTIONS = ['java', 'javascript', 'python', 'c', 'cpp'];



export default function CodeEditor({

  code,

  onChangeCode,

  currentLineNumber,

  language = 'java',

  onChangeLanguage,

  onOpenCodeDoctor,

  onOpenPersonalProblem,

  isPlaying,

  onPlay,

  onPause,

  onNext,

  onPrev,

  onReset,

  isAtStart,

  isAtEnd,

  isCodeDirty = false,

  onRunCode,
  onCancelExecution,

  onResetCode,

  isExecuting = false,

  syntaxErrorLine = null,

  breakpoints = new Set(),

  onToggleBreakpoint,

  onSelectLine = null,

  readOnly = false,

}) {

  const editorRef = useRef(null);

  const monacoRef = useRef(null);

  const decorationsRef = useRef([]);

  const { isBright } = useTheme();

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [runFeedback, setRunFeedback] = useState(false);

  const languageMenuRef = useRef(null);



  const currentLangConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.java;



  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {

        setLanguageMenuOpen(false);

      }

    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);

  }, []);



  const handleEditorDidMount = (editor, monaco) => {

    editorRef.current = editor;

    monacoRef.current = monaco;



    // Dark Theme definition - Deep obsidian palette harmonized with 3D canvas

    monaco.editor.defineTheme('code3dDark', {

      base: 'vs-dark',

      inherit: true,

      rules: [

        { token: 'keyword', foreground: '00f2fe', fontStyle: 'bold' },

        { token: 'type', foreground: '38bdf8' },

        { token: 'string', foreground: '34d399' },

        { token: 'number', foreground: 'fbbf24' },

        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },

      ],

      colors: {

        'editor.background': '#070b14',

        'editor.lineHighlightBackground': '#1e293b44',

        'editorLineNumber.foreground': '#475569',

        'editorLineNumber.activeForeground': '#00f2fe',

      },

    });



    // Bright Theme definition

    monaco.editor.defineTheme('code3dLight', {

      base: 'vs',

      inherit: true,

      rules: [

        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },

        { token: 'type', foreground: '0369a1' },

        { token: 'string', foreground: '059669' },

        { token: 'number', foreground: 'd97706' },

        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },

      ],

      colors: {

        'editor.background': '#ffffff',

        'editor.lineHighlightBackground': '#f1f5f9',

        'editorLineNumber.foreground': '#94a3b8',

        'editorLineNumber.activeForeground': '#0284c7',

      },

    });



    monaco.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');



    // Register Ctrl+Enter / Cmd+Enter shortcut

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {

      if (onRunCode) {

        onRunCode();

      } else if (onPlay) {

        onPlay();

      }

    });



    // F5: Play / Resume execution

    editor.addCommand(monaco.KeyCode.F5, () => {

      if (isPlaying) {

        if (onPause) onPause();

      } else {

        if (onPlay) onPlay();

        else if (onRunCode) onRunCode();

      }

    });



    // F10: Step forward

    editor.addCommand(monaco.KeyCode.F10, () => {

      if (onNext) onNext();

    });



    // Shift + F10: Step backward

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F10, () => {

      if (onPrev) onPrev();

    });



    // Escape: Stop / Reset execution

    editor.addCommand(monaco.KeyCode.Escape, () => {

      if (onReset) onReset();

    });



    // Glyph margin click listener to toggle breakpoints & line click navigation

    editor.onMouseDown((e) => {

      const line = e.target.position?.lineNumber;

      if (

        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||

        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS

      ) {

        if (line && onToggleBreakpoint) {

          onToggleBreakpoint(line);

        }

      } else if (line && onSelectLine) {

        onSelectLine(line);

      }

    });

  };



  // Switch editor theme whenever bright mode changes

  useEffect(() => {

    if (monacoRef.current) {

      monacoRef.current.editor.setTheme(isBright ? 'code3dLight' : 'code3dDark');

    }

  }, [isBright]);



  // Update line highlighting & breakpoints whenever currentLineNumber, syntaxErrorLine, or breakpoints change

  useEffect(() => {

    if (!editorRef.current) return;

    const editor = editorRef.current;



    const newDecorations = [];



    // 1. Breakpoints in glyph margin

    if (breakpoints && breakpoints.size > 0) {

      breakpoints.forEach((line) => {

        newDecorations.push({

          range: {

            startLineNumber: line,

            startColumn: 1,

            endLineNumber: line,

            endColumn: 1,

          },

          options: {

            isWholeLine: false,

            glyphMarginClassName: line === currentLineNumber ? 'breakpoint-active-glyph' : 'breakpoint-glyph',

            glyphMarginHoverMessage: { value: `Breakpoint on line ${line}` },

          },

        });

      });

    }



    // 2. Syntax Error or Active Line

    if (syntaxErrorLine) {

      newDecorations.push({

        range: {

          startLineNumber: syntaxErrorLine,

          startColumn: 1,

          endLineNumber: syntaxErrorLine,

          endColumn: 1,

        },

        options: {

          isWholeLine: true,

          className: 'syntax-error-line-bg',

          glyphMarginClassName: 'syntax-error-glyph',

        },

      });

      editor.revealLineInCenterIfOutsideViewport(syntaxErrorLine);

    } else if (currentLineNumber) {

      newDecorations.push({

        range: {

          startLineNumber: currentLineNumber,

          startColumn: 1,

          endLineNumber: currentLineNumber,

          endColumn: 1,

        },

        options: {

          isWholeLine: true,

          className: 'active-execution-line-bg',

          glyphMarginClassName: 'active-execution-line-glyph',

        },

      });

      editor.revealLineInCenterIfOutsideViewport(currentLineNumber);

    }



    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);

  }, [currentLineNumber, syntaxErrorLine, breakpoints]);



  return (

    <div className={`flex flex-col h-full border-r select-none transition-colors duration-200 ${

      isBright ? 'bg-white border-slate-200' : 'bg-[#0b0f19] border-slate-800/80'

    }`}>

      {/* Clean Editor Header */}

      <div className={`h-11 border-b px-3 flex items-center justify-between gap-2 transition-colors ${

        isBright

          ? 'bg-slate-50 border-slate-200'

          : 'bg-[#0b0f19] border-slate-800/80'

      }`}>

        <div className="flex items-center gap-2 min-w-0 flex-1">

          <FileCode

            size={15}

            className={`shrink-0 ${isBright ? 'text-cyan-600' : 'text-cyan-400'}`}

          />



          <span className={`text-xs font-mono font-semibold truncate ${

            isBright ? 'text-slate-800' : 'text-slate-200'

          }`}>

            {currentLangConfig.fileName}

          </span>



          {isCodeDirty && (

            <span

              title="Code modified"

              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"

            />

          )}



          {!readOnly && (
          <div ref={languageMenuRef} className="relative shrink-0">

            <button

              type="button"

              onClick={() => setLanguageMenuOpen((prev) => !prev)}

              title="Programming language"

              aria-label="Programming language"

              aria-expanded={languageMenuOpen}

              className={`h-8 min-w-[88px] px-2.5 rounded-lg border flex items-center gap-2 text-[11px] font-semibold transition ${

                isBright

                  ? 'bg-white border-slate-300 text-slate-800 hover:border-cyan-400'

                  : 'bg-slate-950 border-slate-700 text-slate-200 hover:border-cyan-500'

              }`}

            >

              {React.createElement(currentLangConfig.icon, {

                size: 14,

                className: isBright ? 'text-cyan-700' : 'text-cyan-400'

              })}

              <span className="truncate">{currentLangConfig.label}</span>

              <ChevronDown size={12} className={`ml-auto transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />

            </button>



            {languageMenuOpen && (

              <div className={`absolute left-0 top-[calc(100%+6px)] z-50 w-44 rounded-xl border p-1.5 shadow-2xl ${

                isBright

                  ? 'bg-white border-slate-200 shadow-slate-300/50'

                  : 'bg-[#101621] border-slate-700 shadow-black/50'

              }`}>

                {LANGUAGE_OPTIONS.map((lang) => {

                  const option = LANGUAGE_CONFIG[lang];

                  const Icon = option.icon;

                  const active = lang === language;

                  return (

                    <button

                      key={lang}

                      type="button"

                      onClick={() => {

                        setLanguageMenuOpen(false);

                        if (onChangeLanguage) onChangeLanguage(lang);

                      }}

                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-[11px] transition ${

                        active

                          ? isBright

                            ? 'bg-cyan-50 text-cyan-800'

                            : 'bg-cyan-500/10 text-cyan-300'

                          : isBright

                            ? 'text-slate-700 hover:bg-slate-100'

                            : 'text-slate-300 hover:bg-slate-800'

                      }`}

                    >

                      <span className={`w-7 h-7 rounded-md flex items-center justify-center ${

                        active

                          ? isBright ? 'bg-cyan-100' : 'bg-cyan-500/15'

                          : isBright ? 'bg-slate-100' : 'bg-slate-900'

                      }`}>

                        <Icon size={14} />

                      </span>

                      <span className="flex-1 font-semibold">{option.label}</span>

                      {active && <CheckCircle2 size={13} className="text-cyan-500" />}

                    </button>

                  );

                })}

              </div>

            )}

          </div>
          )}


          <span className={`hidden lg:inline-block text-[10px] px-2 py-1 rounded-lg font-mono ${

            isBright

              ? 'bg-slate-200 text-slate-600'

              : 'bg-slate-800 text-slate-400'

          }`}>

            {currentLangConfig.badge}

          </span>

        </div>



        <div className="flex items-center gap-1.5 shrink-0">

          {currentLineNumber && (

            <div

              title={`Current execution line: ${currentLineNumber}`}

              className={`hidden sm:flex h-7 items-center gap-1.5 text-[11px] font-mono px-2 rounded-lg border ${

                isBright

                  ? 'text-cyan-700 bg-cyan-50 border-cyan-200'

                  : 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50'

              }`}

            >

              <span className={`w-1.5 h-1.5 rounded-full ${

                isBright ? 'bg-cyan-600' : 'bg-cyan-400'

              }`} />

              L{currentLineNumber}

            </div>

          )}

        </div>

      </div>



      {/* Monaco Code Editor */}

      <div className="flex-1 w-full overflow-hidden">

        <Editor

          height="100%"

          language={currentLangConfig.monacoLang}

          theme={isBright ? 'code3dLight' : 'code3dDark'}

          value={code}

          onChange={(val) => onChangeCode && onChangeCode(val)}

          onMount={handleEditorDidMount}

          options={{

            readOnly,

            domReadOnly: readOnly,

            fontSize: 13.5,

            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",

            fontLigatures: true,

            lineNumbers: 'on',

            minimap: { enabled: false },

            scrollBeyondLastLine: false,

            automaticLayout: true,

            wordWrap: 'on',

            wrappingStrategy: 'advanced',

            wordWrapColumn: 100,

            autoIndent: 'full',

            formatOnType: true,

            formatOnPaste: true,

            tabSize: 4,

            cursorBlinking: 'smooth',

            smoothScrolling: true,

            renderLineHighlight: 'all',

            glyphMargin: true,

            folding: true,

          }}

        />

      </div>



      {/* Simple Editor Actions */}

      <div className={`h-12 border-t px-3 flex items-center justify-between gap-2 transition-colors ${

        isBright

          ? 'bg-slate-50 border-slate-200'

          : 'bg-[#0b0f19] border-slate-800/80'

      }`}>

        <div className="flex items-center gap-1.5 min-w-0">

          <button

            type="button"

            onClick={onReset}

            title="Reset execution"

            aria-label="Reset execution"

            className={`w-8 h-8 flex items-center justify-center rounded-lg transition cursor-pointer ${

              isBright

                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'

                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'

            }`}

          >

            <RotateCcw size={15} />

          </button>



          {!readOnly && onResetCode && (

            <button

              type="button"

              onClick={onResetCode}

              title="Reset code to default"

              aria-label="Reset code to default"

              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${

                isBright

                  ? 'border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-white'

                  : 'border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800'

              }`}

            >

              <RefreshCw size={14} />

            </button>

          )}

        </div>

        {!readOnly && (
        <button
          type="button"

          onClick={() => {
            if (isExecuting && onCancelExecution) {
              onCancelExecution?.();
              return;
            }
            if (isExecuting) return;
            setRunFeedback(true);
            window.setTimeout(() => setRunFeedback(false), 900);
            if (onRunCode) onRunCode();
            else if (onPlay) onPlay();
          }}

          disabled={isExecuting && !onCancelExecution}

          className={`h-9 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition shadow-md cursor-pointer disabled:cursor-not-allowed ${

            isExecuting

              ? 'bg-cyan-700 text-cyan-100 opacity-80'

              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'

          }`}

          title={isExecuting ? (onCancelExecution ? 'Cancel code execution' : 'Executing code...') : 'Run code and visualize execution'}

        >

          {isExecuting ? (

            <>

              <RefreshCw size={14} className="animate-spin" />

              <span>{onCancelExecution ? 'Cancel' : 'Running...'}</span>

            </>

          ) : (

            <>

              <Play size={14} className="fill-current" />

              <span>{runFeedback ? 'Visualized ✓' : 'Run &amp; Visualize'}</span>

            </>

          )}

        </button>        )}


      </div>

    </div>

  );

}


