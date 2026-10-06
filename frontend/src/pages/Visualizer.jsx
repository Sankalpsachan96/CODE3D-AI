import React, { useState, useEffect } from 'react';
import CodeEditor from '../components/CodeEditor';
import StatePanel from '../components/StatePanel';
import OutputConsole from '../components/OutputConsole';
import Timeline from '../components/Timeline';
import SceneContainer from '../visualizers/SceneContainer';
import DsaSceneDispatcher from '../visualizers/DsaSceneDispatcher';
import AiAssistantModal from '../components/AiAssistantModal';
import QuizModal from '../components/QuizModal';
import CustomCodeModal from '../components/CustomCodeModal';
import CodeDoctorModal from '../components/CodeDoctorModal';
import StriverSheetDrawer from '../components/StriverSheetDrawer';
import CompareModeModal from '../components/CompareModeModal';
import InputGenerator from '../components/InputGenerator';
import { ALGORITHM_CATALOG, generateAlgorithmSteps } from '../algorithms/index';
import { useExecutionTimeline } from '../hooks/useExecutionTimeline';
import { getExecutionTrace, extractNumbersFromCode } from '../services/executionSimulator';
import { validateSourceCode } from '../services/codeValidator';
import { DEFAULT_JAVA_CODE, SAMPLE_PROGRAMS, LANGUAGE_DEFAULTS, CURRICULUM_CATEGORIES } from '../utils/sampleCodes';
import { STRIVER_PROBLEMS } from '../utils/striverCatalog';
import { executeProgram, analyzeCode, checkBackendHealth, recordExecutionHistory } from '../services/apiService';
import { executionManager } from '../execution/index.js';
import { VisualizerErrorBoundary, EditorErrorBoundary } from '../components/ErrorBoundaries';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Sparkles,
  HelpCircle,
  Layers,
  Cpu,
  Server,
  Check,
  Lightbulb,
  Stethoscope,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Play,
  Trophy,
  BookOpen,
  Scale,
} from 'lucide-react';
export default function Visualizer({ initialConcept, initialOpenStriver = false, universalOnly = false }) {
  const { isBright } = useTheme();
  const striverTraceKey = (problem) => problem ? `striver|${problem.striverId || problem.id}|${String(problem.shortTitle || problem.title || '').replace(/\|/g, ' ')}|${problem.archetype || 'array'}` : null;

  // Build a semantic visualization hint without changing the code sent to the
  // compiler. This lets the deterministic simulator select the correct
  // algorithm trace for all 49 curriculum programs and 182 Striver problems.
  const buildVisualizationCode = (source, problem = null) => {
    const hintParts = [
      problem?.title,
      problem?.shortTitle,
      problem?.id,
      problem?.striverId,
      problem?.archetype,
      selectedSample?.title,
      selectedSample?.id,
    ].filter(Boolean);

    if (hintParts.length === 0) return source || '';
    return `${source || ''}\n// CODE3D_VISUAL_HINT: ${hintParts.join(' | ')}`;
  };

  const buildSemanticTrace = (source, lang, input = null, problem = null) => {
    return getExecutionTrace(
      buildVisualizationCode(source, problem),
      lang,
      input,
      null
    );
  };

  // The backend is authoritative for execution/output. The frontend trace is
  // authoritative only for the pedagogical 3D state machine. Never display
  // simulated stdout as if it came from the real program.
  const attachRuntimeOutput = (steps, backendResult) => {
    if (!Array.isArray(steps) || steps.length === 0) return [];
    const runtimeOutput = Array.isArray(backendResult?.output)
      ? backendResult.output
      : String(backendResult?.output || '').split(/\r?\n/).filter(Boolean);

    return steps.map((step, index) => ({
      ...step,
      output: index === steps.length - 1 ? runtimeOutput : [],
      runtimeStatus: backendResult?.status || null,
      runtimeOutput,
    }));
  };
  const universalStarter = { id: 'universal-editor', title: 'Universal Code Editor', category: 'Universal Engine', description: 'Write your own DSA code and execute it with runtime tracing.', difficulty: 'Custom', timeComplexity: '—', spaceComplexity: '—', code: LANGUAGE_DEFAULTS.java || DEFAULT_JAVA_CODE, language: 'java' };
  const [selectedSample, setSelectedSample] = useState(initialConcept || (universalOnly ? universalStarter : SAMPLE_PROGRAMS[0]));
  const [code, setCode] = useState(initialConcept?.code || (universalOnly ? universalStarter.code : DEFAULT_JAVA_CODE));
  const [lastExecutedCode, setLastExecutedCode] = useState(initialConcept?.code || (universalOnly ? universalStarter.code : DEFAULT_JAVA_CODE));
  const isCodeDirty = code !== lastExecutedCode;
  const [language, setLanguage] = useState(initialConcept?.language || 'java');
  const [trace, setTrace] = useState(() => {
    if (initialConcept?.trace && initialConcept.trace.length > 0) {
      return initialConcept.trace;
    }
    return getExecutionTrace(initialConcept?.code || (universalOnly ? universalStarter.code : DEFAULT_JAVA_CODE), initialConcept?.language || 'java');
  });
  const [backendOnline, setBackendOnline] = useState(false);
  const [timeComplexity, setTimeComplexity] = useState(initialConcept?.timeComplexity || SAMPLE_PROGRAMS[0].timeComplexity);
  const [spaceComplexity, setSpaceComplexity] = useState(initialConcept?.spaceComplexity || SAMPLE_PROGRAMS[0].spaceComplexity);
  // View Layout Toggles requested by user:
  // 1. Program State panel visibility toggle
  // 2. 100% Fullscreen 3D Theater Mode
  const [showStatePanel, setShowStatePanel] = useState(true);
  const [isFull3DView, setIsFull3DView] = useState(false);
  // Direct Form User Input
  const [formInputValues, setFormInputValues] = useState('10, 20, 30, 40');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState(null);
  const [syntaxErrorLine, setSyntaxErrorLine] = useState(null);
  // Modals & responsive view state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCustomCodeOpen, setIsCustomCodeOpen] = useState(false);
  const [isCodeDoctorOpen, setIsCodeDoctorOpen] = useState(false);
  const [isStriverSheetOpen, setIsStriverSheetOpen] = useState(initialOpenStriver);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeStriverProblem, setActiveStriverProblem] = useState(null);
  const [mobileTab, setMobileTab] = useState('3d'); // '3d' | 'code' | 'state'
  const {
    currentStepIndex,
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isAtStart,
    isAtEnd,
    nextStep,
    prevStep,
    goToStep,
    play,
    pause,
    reset,
    breakpoints,
    toggleBreakpoint,
    executionState,
    cumulativeOutput,
    finalCorrectOutput,
  } = useExecutionTimeline(trace);
  // Dynamic Box Resizing State (Editor width % and Console height px)
  const [editorWidthPercent, setEditorWidthPercent] = useState(35);
  const [consoleHeightPx, setConsoleHeightPx] = useState(165);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingConsole, setIsResizingConsole] = useState(false);
  // Handle dragging horizontal splitter between Code Editor and 3D Viewport
  const startEditorResize = (e) => {
    e.preventDefault();
    setIsResizingEditor(true);
    const onMouseMove = (moveEvent) => {
      const containerWidth = window.innerWidth;
      const newPercent = Math.min(65, Math.max(20, (moveEvent.clientX / containerWidth) * 100));
      setEditorWidthPercent(Math.round(newPercent));
    };
    const onMouseUp = () => {
      setIsResizingEditor(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  // Handle dragging vertical splitter between 3D Canvas and Output Console
  const startConsoleResize = (e) => {
    e.preventDefault();
    setIsResizingConsole(true);
    const startY = moveEvent => moveEvent.clientY;
    const initialHeight = consoleHeightPx;
    const initialY = e.clientY;
    const onMouseMove = (moveEvent) => {
      const deltaY = initialY - moveEvent.clientY;
      const newHeight = Math.min(380, Math.max(70, initialHeight + deltaY));
      setConsoleHeightPx(Math.round(newHeight));
    };
    const onMouseUp = () => {
      setIsResizingConsole(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then((isUp) => {
      setBackendOnline(isUp);
    });
  }, []);
  // Synchronize formInputValues whenever code or selected sample changes
  useEffect(() => {
    const nums = extractNumbersFromCode(code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
  }, [selectedSample]);
  // Update visualizer state whenever initialConcept changes
  useEffect(() => {
    // Every navigation into this studio gets a clean context. In particular, a
    // Striver archetype must never leak into the Universal Editor.
    setActiveStriverProblem(initialConcept?.striverId ? initialConcept : null);
    setIsStriverSheetOpen(false);
    setExecutionError(null);
    setSyntaxErrorLine(null);
    setIsFull3DView(false);
    setMobileTab('3d');

    if (initialConcept) {
      setSelectedSample(initialConcept);
      setCode(initialConcept.code || '');
      setLastExecutedCode(initialConcept.code || '');
      if (initialConcept.language) {
        setLanguage(initialConcept.language);
      }
      setTimeComplexity(initialConcept.timeComplexity || 'O(n)');
      setSpaceComplexity(initialConcept.spaceComplexity || 'O(1)');
      if (initialConcept.defaultInput != null) {
        setFormInputValues(String(initialConcept.defaultInput));
      } else {
        const nums = extractNumbersFromCode(initialConcept.code || '');
        setFormInputValues(nums.length ? nums.join(', ') : '10, 20, 30, 40');
      }
      if (initialConcept.trace && initialConcept.trace.length > 0) {
        setTrace(initialConcept.trace);
        reset();
        setTimeout(() => play(), 100);
      } else if (backendOnline && initialConcept.id && initialConcept.id !== 'custom') {
        executeProgram(initialConcept.code, initialConcept.id, initialConcept.language || 'java')
          .then(() => {
            setTrace(buildSemanticTrace(initialConcept.code, initialConcept.language || 'java', initialConcept.defaultInput, initialConcept));
            reset();
            setTimeout(() => play(), 100);
          })
          .catch(() => {
            setTrace(buildSemanticTrace(initialConcept.code, initialConcept.language || 'java', initialConcept.defaultInput, initialConcept));
            reset();
            setTimeout(() => play(), 100);
          });
      } else {
        setTrace(buildSemanticTrace(initialConcept.code, initialConcept.language || 'java', initialConcept.defaultInput, initialConcept));
        reset();
        setTimeout(() => play(), 100);
      }
    }
  }, [initialConcept, backendOnline]);
  // Handle preset selection
  const handleSelectProgram = async (prog) => {
    setActiveStriverProblem(null);
    setSelectedSample(prog);
    setCode(prog.code);
    setLastExecutedCode(prog.code);
    setLanguage('java');
    setTimeComplexity(prog.timeComplexity);
    setSpaceComplexity(prog.spaceComplexity);
    // Update form input field with preset numbers
    const nums = extractNumbersFromCode(prog.code);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
    const finalSteps = buildSemanticTrace(prog.code, 'java', null, prog);
    setTrace(finalSteps);
    reset();
    setTimeout(() => play(), 100);
    recordExecutionHistory({
      programTitle: prog.title,
      conceptId: prog.id,
      language: 'java',
      totalSteps: finalSteps.length,
      status: 'COMPLETED',
      code: prog.code,
    });
  };
  // Handle selecting an algorithm from the 3D algorithm engine
  const handleSelectAlgorithm = (algo) => {
    setActiveStriverProblem(null);
    const input = Array.isArray(algo.defaultInput) ? algo.defaultInput : [45, 12, 89, 23, 7, 64, 31];
    const target = algo.defaultTarget !== undefined ? algo.defaultTarget : 23;
    const res = algo.generator(input, target);
    setSelectedSample({
      id: algo.id,
      title: algo.name,
      category: algo.category,
      description: algo.description,
      difficulty: 'Standard',
      timeComplexity: algo.complexity?.time?.average || 'O(n)',
      spaceComplexity: algo.complexity?.space || 'O(1)',
      code: algo.code?.java || '',
      language: 'java',
      complexity: algo.complexity,
    });
    setCode(algo.code?.java || '');
    setLastExecutedCode(algo.code?.java || '');
    setLanguage('java');
    setTimeComplexity(algo.complexity?.time?.average || 'O(n)');
    setSpaceComplexity(algo.complexity?.space || 'O(1)');
    setFormInputValues(Array.isArray(input) ? input.join(', ') : String(input));
    setTrace(res.steps);
    reset();
    setTimeout(() => play(), 100);
    recordExecutionHistory({
      programTitle: algo.name,
      conceptId: algo.id,
      language: 'java',
      totalSteps: res.steps.length,
      status: 'COMPLETED',
      code: algo.code?.java || '',
    });
  };
  // Handle language change from editor
  const handleLanguageChange = async (newLang) => {
    setActiveStriverProblem(null);
    setLanguage(newLang);
    const template = LANGUAGE_DEFAULTS[newLang] || DEFAULT_JAVA_CODE;
    setCode(template);
    setLastExecutedCode(template);
    setSelectedSample({
      id: 'custom',
      title: `${newLang.toUpperCase()} Traversal`,
      category: 'Multi-Language',
      description: `Dynamic ${newLang.toUpperCase()} execution trace in 3D space.`,
      difficulty: 'Beginner',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: template,
    });
    const nums = extractNumbersFromCode(template);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
    if (backendOnline) {
      const [execRes, astRes] = await Promise.all([
        executeProgram(template, 'custom', newLang),
        analyzeCode(template, newLang),
      ]);
      setTrace(getExecutionTrace(template, newLang));
      reset();
      if (astRes) {
        if (astRes.timeComplexity) setTimeComplexity(astRes.timeComplexity);
        if (astRes.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
      }
    } else {
      setTrace(getExecutionTrace(template, newLang));
      reset();
    }
  };
  // Directly apply User Form Input into code and 3D visualizer
  const applyNewValuesToCode = async (vals) => {
    if (!vals || vals.length === 0) return;
    const inputStr = vals.join(', ');
    setFormInputValues(inputStr);
    let updatedCode = code;
    const hasBracketNumbers = /\[[0-9,\s\-]+\]/.test(updatedCode);
    const hasBraceNumbers = /\{[0-9,\s\-]+\}/.test(updatedCode);
    if (language === 'python' || language === 'javascript') {
      if (hasBracketNumbers) {
        updatedCode = updatedCode.replace(/\[[0-9,\s\-]+\]/, `[${inputStr}]`);
        setCode(updatedCode);
        setLastExecutedCode(updatedCode);
      }
    } else {
      if (hasBraceNumbers) {
        updatedCode = updatedCode.replace(/\{[0-9,\s\-]+\}/, `{${inputStr}}`);
        setCode(updatedCode);
        setLastExecutedCode(updatedCode);
      }
    }
    // Run dynamic trace with new input values preserving the algorithm
    let newSteps = buildSemanticTrace(
      updatedCode,
      language,
      inputStr,
      activeStriverProblem || selectedSample
    );
    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 60);
    }
  };
  const handleApplyFormInput = () => {
    const vals = extractNumbersFromCode(formInputValues);
    applyNewValuesToCode(vals);
  };
  const handleApplyPresetValues = (vals) => {
    setFormInputValues(vals.join(', '));
    applyNewValuesToCode(vals);
  };
  // Handle user applying custom code from modal
  const handleCustomCodeApply = async ({ code: customCode, language: customLang }) => {
    setActiveStriverProblem(null);
    setLanguage(customLang);
    setCode(customCode);
    setLastExecutedCode(customCode);
    setSelectedSample({
      id: 'custom',
      title: `⚡ Custom ${customLang.toUpperCase()} Code`,
      category: 'Custom Algorithms',
      description: 'User-submitted code dynamically analyzed and rendered in 3D.',
      difficulty: 'Custom',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: customCode,
    });
    const nums = extractNumbersFromCode(customCode);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
    let newSteps = null;
    if (backendOnline) {
      try {
        const [execRes, astRes] = await Promise.all([
          executeProgram(customCode, 'custom', customLang),
          analyzeCode(customCode, customLang),
        ]);
        newSteps = getExecutionTrace(customCode, customLang);
        if (astRes) {
          if (astRes.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        }
      } catch (err) {
        console.warn('Backend custom execution failed, using simulator:', err);
      }
    }
    if (!newSteps || newSteps.length === 0) {
      newSteps = getExecutionTrace(customCode, customLang);
    }
    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 50);
      recordExecutionHistory({
        programTitle: `Custom ${customLang.toUpperCase()} Code`,
        conceptId: 'custom',
        language: customLang,
        totalSteps: newSteps.length,
        status: 'COMPLETED',
        code: customCode,
      });
    }
  };
  // Execute User Code Pipeline:
  // The backend universal executor is the single source of truth for
  // compilation, runtime behaviour and stdout/stderr. The returned
  // universal trace is already enriched with the REAL runtime output.
  const handleRunCode = async () => {
    if (isExecuting) return false;
    if (isPlaying) { pause(); return false; }

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const backendResult = await executeProgram(
        code,
        activeStriverProblem?.id || selectedSample?.id || 'custom',
        language,
        formInputValues,
        true
      );

      if (!backendResult || backendResult.status !== 'COMPLETED') {
        const message =
          backendResult?.message ||
          'Execution failed on the backend.';
        setExecutionError(message);
        return false;
      }

      // The backend result is the source of truth for compilation,
      // runtime behaviour and stdout. For the 3D scene, however, use the
      // problem-aware deterministic trace so a Striver/DSA problem does not
      // collapse into the generic "array" visualizer.
      const visualProblem = activeStriverProblem || selectedSample;
      const semanticTrace = buildSemanticTrace(
        code,
        language,
        formInputValues,
        visualProblem
      );
      const visualTrace = attachRuntimeOutput(semanticTrace, backendResult);

      if (visualTrace.length === 0) {
        throw new Error('Execution completed but no semantic 3D trace was generated.');
      }

      setTrace(visualTrace);
      setLastExecutedCode(code);
      reset();
      setTimeout(() => play(), 60);

      recordExecutionHistory({
        programTitle:
          activeStriverProblem?.title ||
          selectedSample?.title ||
          'Custom Execution',
        conceptId: activeStriverProblem
          ? `striver-${activeStriverProblem.striverId || activeStriverProblem.id}`
          : selectedSample?.id || 'custom',
        language,
        totalSteps: visualTrace.length,
        status: backendResult.status,
        code,
        input: formInputValues,
        output: backendResult.output || [],
      });

      return true;
    } catch (err) {
      setExecutionError(
        err?.message || 'Execution failed on the backend.'
      );
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  // Bidirectional interaction: 3D Element Click -> Seek Timeline & Code Line (Section 40)
  const handleSelectElementFrom3D = (index, value) => {
    if (!timelineSteps || timelineSteps.length === 0) return;
    const forwardStep = timelineSteps.findIndex((step, idx) => {
      if (idx < currentStepIndex) return false;
      const ds = step.dataStructureState;
      return ds?.activeIndex === index || (ds?.pointers && Object.values(ds.pointers).includes(index));
    });
    if (forwardStep !== -1) {
      jumpToStep(forwardStep);
      return;
    }
    const anyStep = timelineSteps.findIndex((step) => {
      const ds = step.dataStructureState;
      return ds?.activeIndex === index || (ds?.pointers && Object.values(ds.pointers).includes(index));
    });
    if (anyStep !== -1) {
      jumpToStep(anyStep);
    }
  };
  // Bidirectional interaction: Code Editor Line Click -> Seek Timeline & 3D Scene (Section 40)
  const handleSelectLineFromEditor = (lineNumber) => {
    if (!timelineSteps || timelineSteps.length === 0 || !lineNumber) return;
    const matchedStep = timelineSteps.findIndex((step) => step.lineNumber === lineNumber);
    if (matchedStep !== -1) {
      jumpToStep(matchedStep);
    }
  };
  // Handle Personal Problem applied solution & 3D visualization
  const handleApplyCorrectedCode = async ({
    code: correctedCode,
    language: correctedLang,
    trace: correctedTrace,
    problemTitle,
    timeComplexity: tc,
    spaceComplexity: sc,
    launch3D = true,
  }) => {
    setActiveStriverProblem(null);
    setLanguage(correctedLang);
    setCode(correctedCode);
    setLastExecutedCode(correctedCode);
    if (tc) setTimeComplexity(tc);
    if (sc) setSpaceComplexity(sc);
    setSelectedSample({
      id: 'personal-problem',
      title: problemTitle ? `💡 ${problemTitle}` : `💡 Personal Problem (${correctedLang.toUpperCase()})`,
      category: 'Personal Problem',
      description: 'Custom personal problem solved and fully simulated in 3D WebGL.',
      difficulty: 'Custom',
      timeComplexity: tc || 'O(n)',
      spaceComplexity: sc || 'O(1)',
      code: correctedCode,
    });
    const nums = extractNumbersFromCode(correctedCode);
    if (nums && nums.length > 0) {
      setFormInputValues(nums.join(', '));
    }
    if (correctedTrace && correctedTrace.length > 0) {
      setTrace(correctedTrace);
      reset();
      if (launch3D) {
        setTimeout(() => play(), 50);
      }
    } else {
      let newSteps = null;
      if (backendOnline) {
        try {
          const [execRes, astRes] = await Promise.all([
            executeProgram(correctedCode, 'custom', correctedLang),
            analyzeCode(correctedCode, correctedLang),
          ]);
          newSteps = getExecutionTrace(correctedCode, correctedLang);
          if (astRes?.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes?.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        } catch (err) {
          console.warn('Backend repaired execution failed, using simulator:', err);
        }
      }
      if (!newSteps || newSteps.length === 0) {
        newSteps = getExecutionTrace(correctedCode, correctedLang);
      }
      if (newSteps && newSteps.length > 0) {
        setTrace(newSteps);
        reset();
        if (launch3D) {
          setTimeout(() => play(), 50);
        }
      }
    }
    recordExecutionHistory({
      programTitle: problemTitle ? `💡 ${problemTitle}` : `💡 Personal Problem (${correctedLang.toUpperCase()})`,
      conceptId: 'personal-problem',
      language: correctedLang,
      totalSteps: (correctedTrace?.length || 1),
      status: 'COMPLETED',
      code: correctedCode,
    });
  };
  const handleResetCode = () => {
    const templateCode = activeStriverProblem?.starterCode || selectedSample?.code || DEFAULT_JAVA_CODE;
    setCode(templateCode);
    setLastExecutedCode(templateCode);
    setExecutionError(null);
        const traceSteps = buildSemanticTrace(templateCode, language, formInputValues, activeStriverProblem || selectedSample);
    setTrace(traceSteps);
    reset();
  };
  // Handle user selecting a Striver SDE Sheet question from drawer
  const handleSelectStriverProblem = async (problem) => {
    setIsStriverSheetOpen(false); // Automatically dismiss drawer so 3D scene is immediately visible
    setActiveStriverProblem(problem);
        const sampleObj = {
      id: `striver-${problem.striverId || problem.id}`,
      striverId: problem.striverId || problem.id,
      title: problem.title,
      category: problem.category,
      description: `${problem.day}: ${problem.title}`,
      difficulty: problem.difficulty,
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity,
      code: problem.starterCode || problem.code,
    };
    setSelectedSample(sampleObj);
    const starterCode = problem.starterCode || problem.code || '';
    setCode(starterCode);
    setLastExecutedCode(starterCode);
    if (problem.language) setLanguage(problem.language);
    setTimeComplexity(problem.timeComplexity);
    setSpaceComplexity(problem.spaceComplexity);
    if (problem.defaultInput) {
      setFormInputValues(problem.defaultInput);
    }
    // Synthesize verified 3D execution trace with matched archetype and accurate inputs/outputs
    const newSteps = buildSemanticTrace(
      starterCode,
      problem.language || language,
      problem.defaultInput,
      problem
    );
    // Enrich complexity metrics in background if backend is online
    if (backendOnline) {
      analyzeCode(problem.code, problem.language || language)
        .then((astRes) => {
          if (astRes?.timeComplexity) setTimeComplexity(astRes.timeComplexity);
          if (astRes?.spaceComplexity) setSpaceComplexity(astRes.spaceComplexity);
        })
        .catch(() => {});
    }
    if (newSteps && newSteps.length > 0) {
      setTrace(newSteps);
      reset();
      setTimeout(() => play(), 60);
    }
  };
  // Synchronized Timeline Play handler
  const handleTimelinePlay = () => {
    if (isCodeDirty) {
      handleRunCode();
    } else {
      if (isAtEnd) {
        goToStep(0);
      }
      play();
    }
  };
  // Window-level Ctrl+Enter / Cmd+Enter listener to trigger instant 3D execution
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, backendOnline, isCodeDirty]);
  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      {/* Simple Studio Header */}
      <div className={`h-11 shrink-0 border-b px-3 flex items-center justify-between gap-2 ${
        isBright
          ? 'bg-white border-slate-200'
          : 'bg-[#0b0f19] border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <Layers size={15} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />
          {universalOnly ? (
            <div className={`h-8 px-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
              isBright ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-cyan-300'
            }`}>
              <Code2 size={13} /> Universal Code Editor
            </div>
          ) : (
          <select
            value={selectedSample.id}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('algo-')) {
                const id = val.replace('algo-', '');
                const algo = ALGORITHM_CATALOG.find((a) => a.id === id);
                if (algo) handleSelectAlgorithm(algo);
              } else if (val.startsWith('striver-')) {
                const id = parseInt(val.replace('striver-', ''), 10);
                const p = STRIVER_PROBLEMS.find((prob) => prob.id === id);
                if (p) {
                  handleSelectStriverProblem({
                    id: `striver-${p.id}`,
                    striverId: p.id,
                    title: p.title,
                    shortTitle: p.shortTitle,
                    day: p.day,
                    dayNumber: p.dayNumber,
                    category: p.category,
                    difficulty: p.difficulty,
                    archetype: p.archetype,
                    timeComplexity: p.timeComplexity,
                    spaceComplexity: p.spaceComplexity,
                    description: p.description,
                    defaultInput: p.defaultInput,
                    code: p.javaCode,
                    language: 'java',
                  });
                }
              } else {
                const found = SAMPLE_PROGRAMS.find((p) => p.id === val);
                if (found) handleSelectProgram(found);
              }
            }}
            className={`h-8 max-w-[360px] border rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer ${
              isBright
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-950 border-slate-700 text-cyan-300'
            }`}
            title="Choose a problem or algorithm"
          >
            {(selectedSample.id === 'custom' || selectedSample.id === 'personal-problem') && (
              <option value={selectedSample.id}>
                {selectedSample.title || 'Custom Execution'}
              </option>
            )}
            <optgroup label="3D Algorithm Engine">
              {ALGORITHM_CATALOG.map((algo) => (
                <option key={`algo-${algo.id}`} value={`algo-${algo.id}`}>
                  {algo.name} ({algo.category})
                </option>
              ))}
            </optgroup>
            <optgroup label="Striver SDE Sheet">
              {STRIVER_PROBLEMS.map((p) => (
                <option key={`striver-${p.id}`} value={`striver-${p.id}`}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </optgroup>
            {CURRICULUM_CATEGORIES.map((category) => {
              const items = SAMPLE_PROGRAMS.filter((p) => p.category === category);
              if (items.length === 0) return null;
              return (
                <optgroup key={category} label={category}>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          )}
          <span className={`hidden lg:block truncate max-w-[260px] text-[11px] ${
            isBright ? 'text-slate-500' : 'text-slate-400'
          }`}>
            {selectedSample?.title || '3D Code Studio'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!universalOnly && <button
            type="button"
            onClick={() => setIsCodeDoctorOpen(true)}
            title="Personal Problem"
            aria-label="Personal Problem"
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
              isBright
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
            }`}
          >
            <Lightbulb size={14} />
          </button>}
          {!universalOnly && <button
            type="button"
            onClick={() => setIsStriverSheetOpen((prev) => !prev)}
            title="Striver SDE Sheet"
            aria-label="Striver SDE Sheet"
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
              isStriverSheetOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : isBright
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
            }`}
          >
            <BookOpen size={14} />
          </button>}
          {!universalOnly && <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            title="Compare Algorithms"
            aria-label="Compare Algorithms"
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
              isBright
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/25 hover:bg-blue-500/20'
            }`}
          >
            <Scale size={14} />
          </button>}
          <button
            type="button"
            onClick={() => setIsFull3DView((prev) => !prev)}
            title={isFull3DView ? 'Exit 3D focus' : 'Focus 3D view'}
            aria-label={isFull3DView ? 'Exit 3D focus' : 'Focus 3D view'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition cursor-pointer ${
              isFull3DView
                ? 'bg-purple-600 border-purple-400 text-white'
                : isBright
                  ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/25 hover:bg-purple-500/20'
            }`}
          >
            {isFull3DView ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      {/* Mobile View Switcher */}
      <div className={`md:hidden flex items-center border-b p-1 shrink-0 ${
        isBright ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800/80'
      }`}>
        {[
          ['3d', '3D Scene'],
          ['code', 'Code'],
          ['state', 'State'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMobileTab(id)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              mobileTab === id
                ? isBright
                  ? 'bg-cyan-100 text-cyan-800'
                  : 'bg-cyan-500/20 text-cyan-300'
                : isBright ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Error */}
      {executionError && (
        <div className={`shrink-0 px-3 py-2 text-xs flex items-center justify-between gap-3 border-b ${
          isBright
            ? 'bg-rose-50 text-rose-900 border-rose-200'
            : 'bg-rose-950/40 text-rose-200 border-rose-800/60'
        }`}>
          <span className="truncate">
            <strong>Execution error:</strong> {executionError}
          </span>
          <button
            type="button"
            onClick={() => setExecutionError(null)}
            className="shrink-0 px-2 py-1 rounded border border-current/20 hover:bg-black/10"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Main Studio: only Code + 3D */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        {/* Code */}
        {!isFull3DView && (
          <div
            className={`${mobileTab === 'code' ? 'block' : 'hidden'} md:block h-full overflow-hidden shrink-0`}
            style={{ width: `${editorWidthPercent}%` }}
          >
            <EditorErrorBoundary>
              <CodeEditor
                code={code}
                onChangeCode={(val) => {
                  setCode(val);
                  if (syntaxErrorLine) setSyntaxErrorLine(null);
                  if (executionError) setExecutionError(null);
                }}
                language={language}
                onChangeLanguage={handleLanguageChange}
                onOpenCodeDoctor={() => setIsCodeDoctorOpen(true)}
                onOpenPersonalProblem={() => setIsCodeDoctorOpen(true)}
                currentLineNumber={currentStep?.lineNumber || null}
                syntaxErrorLine={syntaxErrorLine}
                isPlaying={isPlaying}
                onPlay={handleRunCode}
                onRunCode={handleRunCode}
                onResetCode={handleResetCode}
                isExecuting={isExecuting}
                isCodeDirty={isCodeDirty}
                onPause={pause}
                onNext={nextStep}
                onPrev={prevStep}
                onReset={reset}
                isAtStart={isAtStart}
                isAtEnd={isAtEnd}
                breakpoints={breakpoints}
                onToggleBreakpoint={toggleBreakpoint}
                onSelectLine={handleSelectLineFromEditor}
                readOnly={!universalOnly && !activeStriverProblem}
              />
            </EditorErrorBoundary>
          </div>
        )}
        {/* Divider */}
        {!isFull3DView && (
          <div
            onMouseDown={startEditorResize}
            className={`hidden md:flex w-1 shrink-0 cursor-col-resize items-center justify-center ${
              isResizingEditor
                ? 'bg-cyan-500'
                : isBright ? 'bg-slate-200 hover:bg-cyan-400' : 'bg-slate-800 hover:bg-cyan-500'
            }`}
            title="Drag to resize editor and 3D view"
          >
            <div className="w-0.5 h-10 rounded-full bg-slate-400/50" />
          </div>
        )}
        {/* 3D */}
        <div className={`${mobileTab === '3d' ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 min-h-0 flex-col overflow-hidden`}>
          <div className={`shrink-0 border-b px-2 py-1.5 flex items-center gap-2 ${
            isBright ? 'bg-white border-slate-200' : 'bg-[#0b0f19] border-slate-800/80'
          }`}>
            <InputGenerator
              currentValues={extractNumbersFromCode(formInputValues) || [45, 12, 89, 23, 7, 64, 31]}
              currentTarget={23}
              showTarget={selectedSample?.category === 'Searching' || selectedSample?.id?.includes('search')}
              onGenerate={({ values, target }) => {
                const inputStr = values.join(', ');
                setFormInputValues(inputStr);
                const algo = ALGORITHM_CATALOG.find((a) => a.id === selectedSample.id || `algo-${a.id}` === selectedSample.id);
                if (algo) {
                  const res = algo.generator(values, target);
                  setTrace(res.steps);
                  reset();
                  setTimeout(() => play(), 80);
                  return;
                }
                applyNewValuesToCode(values);
              }}
            />
          </div>
          {/* 3D canvas + controls live together */}
          <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 relative">
              <VisualizerErrorBoundary onReset={reset}>
                <SceneContainer
                  currentStep={currentStep}
                  code={code}
                  statusLabel={currentStep?.dataStructureState?.label || null}
                  activeDetails={currentStep?.dataStructureState?.focusInfo || null}
                  correctOutput={null}
                  isAtEnd={isAtEnd}
                  cumulativeOutput={cumulativeOutput}
                  isFull3DView={isFull3DView}
                  onToggleFull3D={() => setIsFull3DView((prev) => !prev)}
                  onSelectElement={handleSelectElementFrom3D}
                >
                  <DsaSceneDispatcher dataStructureState={currentStep?.dataStructureState} />
                </SceneContainer>
              </VisualizerErrorBoundary>
            </div>
            {/* Playback controls belong to the 3D block */}
            <div className={`shrink-0 min-w-0 h-11 border-t px-2 flex items-center gap-1.5 overflow-hidden ${
              isBright ? 'bg-white border-slate-200' : 'bg-[#0b0f19] border-slate-800/80'
            }`}>
              <button
                type="button"
                onClick={prevStep}
                disabled={isAtStart}
                title="Previous step"
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border disabled:opacity-40 ${
                  isBright
                    ? 'border-slate-300 hover:bg-slate-100'
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={isPlaying ? pause : handleTimelinePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-bold ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-cyan-500 text-slate-950'
                }`}
              >
                <Play size={13} className={isPlaying ? '' : 'fill-current'} />
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={isAtEnd}
                title="Next step"
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border disabled:opacity-40 ${
                  isBright
                    ? 'border-slate-300 hover:bg-slate-100'
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                ›
              </button>
              <div className={`h-7 px-2 rounded-md flex items-center gap-1 text-[11px] font-mono ${
                isBright ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'
              }`}>
                Step <strong>{currentStepIndex + 1}</strong> / {totalSteps}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, totalSteps - 1)}
                  value={currentStepIndex}
                  onChange={(e) => goToStep(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                  aria-label="Execution step"
                />
              </div>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                title="Playback speed"
                className={`h-8 rounded-lg border px-2 text-[11px] font-mono ${
                  isBright
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-slate-950 border-slate-700 text-slate-300'
                }`}
              >
                <option value={0.25}>0.25×</option>
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>
              <button
                type="button"
                onClick={reset}
                title="Reset execution"
                aria-label="Reset execution"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isBright
                    ? 'border-slate-300 hover:bg-slate-100'
                    : 'border-slate-700 hover:bg-slate-800'
                }`}
              >
                ↻
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Program State + Output: fixed workspace with independent scrolling */}
      {!isFull3DView && (
        <div className={`shrink-0 h-[180px] min-h-[160px] max-h-[26vh] border-t overflow-hidden ${
          isBright ? 'bg-slate-50 border-slate-200' : 'bg-[#090d16] border-slate-800/80'
        }`}>
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-2 p-2 overflow-hidden">
            <div className={`min-h-0 h-full overflow-y-auto overscroll-contain rounded-xl border custom-scrollbar ${
              isBright ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-[#0b0f19]'
            }`}>
              <StatePanel
                currentStep={currentStep}
                totalSteps={totalSteps}
                correctOutput={null}
                isAtEnd={isAtEnd}
                complexity={selectedSample?.complexity}
              />
            </div>
            <div className={`min-h-0 h-full overflow-y-auto overscroll-contain rounded-xl border custom-scrollbar ${
              isBright ? 'border-slate-200 bg-white' : 'border-slate-800/70 bg-[#0b0f19]'
            }`}>
              <OutputConsole
                output={cumulativeOutput}
                correctOutput={null}
                isAtEnd={isAtEnd}
              />
            </div>
          </div>
        </div>
      )}
      {/* Modals */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        code={code}
        language={language}
        currentLineNumber={currentStep?.lineNumber || null}
        currentStepNumber={currentStepIndex + 1}
        currentStep={currentStep}
        output={cumulativeOutput}
        error={executionError}
        detectedDsa={currentStep?.dataStructureState?.type || null}
        detectedAlgorithm={currentStep?.algorithm || selectedSample?.id || null}
      />
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        conceptId={selectedSample.id}
      />
      <CustomCodeModal
        isOpen={isCustomCodeOpen}
        onClose={() => setIsCustomCodeOpen(false)}
        onApplyCustomCode={handleCustomCodeApply}
        currentLanguage={language}
      />
      <CodeDoctorModal
        isOpen={isCodeDoctorOpen}
        onClose={() => setIsCodeDoctorOpen(false)}
        onApplyCorrectedCode={handleApplyCorrectedCode}
        currentLanguage={language}
        currentCode={code}
      />
      <StriverSheetDrawer
        isOpen={isStriverSheetOpen}
        onToggle={() => setIsStriverSheetOpen((prev) => !prev)}
        onSelectProblem={handleSelectStriverProblem}
        currentLanguage={language}
      />
      <CompareModeModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />
    </div>
  );
}
