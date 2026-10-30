import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, SkipBack, SkipForward, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function explainSourceLine(sourceLine, language, step, compact = false) {
  const line = String(sourceLine || '').trim().replace(/\/\/.*/, '').trim();
  const hindi = language === 'hi-IN';
  const event = String(step?.eventType || '').toUpperCase();
  const state = step?.dataStructureState || {};
  const condition = step?.condition || {};
  const variable = step?.changedVariable || state.name || 'variable';
  const previous = step?.previousValue;
  const current = step?.currentValue;
  const valueText = current !== undefined && current !== null ? String(current) : '';
  const index = state.activeIndex;
  const valueAtIndex = valueText || (Array.isArray(state.values) && Number.isInteger(index) ? String(state.values[index]) : '');

  // Short, focused narration for Together Mode; never controls 3D playback speed.
  if (compact) {
    if (hindi) {
      switch (event) {
        case 'ARRAY_CREATION': return `सूची ${state.name || ''} बनाई गई है और इसमें ${valueText || (Array.isArray(state.values) ? state.values.join(', ') : 'दिए गए मान')} रखे गए हैं।`;
        case 'LOOP_INIT': return `लूप की गिनती ${valueText || 'शून्य'} से शुरू हो रही है।`;
        case 'CONDITION_CHECK': return `शर्त का परिणाम ${condition.result ? 'सही है, इसलिए लूप चलेगा' : 'गलत है, इसलिए लूप रुकेगा'}।`;
        case 'ARRAY_ACCESS': return `सूची के स्थान ${index ?? 'मौजूदा'} से मान ${valueAtIndex || 'पढ़ा जा रहा है'} लिया गया है।`;
        case 'LOOP_INCREMENT': return `गिनती ${previous ?? 'पिछली संख्या'} से बढ़कर ${valueText || 'अगली संख्या'} हो गई है।`;
        case 'PROGRAM_END': return 'प्रोग्राम पूरा हो गया है और अंतिम परिणाम तैयार है।';
        default: return `${step?.explanation || state.focusInfo || state.label || 'प्रोग्राम का अगला चरण पूरा हुआ है।'} ${current !== undefined && current !== null ? `अब मान ${valueText} है।` : ''}`;
      }
    }
    switch (event) {
      case 'ARRAY_CREATION': return `The program creates ${state.name || 'an array'} with ${valueText || (Array.isArray(state.values) ? state.values.join(', ') : 'the given values')}.`;
      case 'LOOP_INIT': return `The loop counter ${variable} starts at ${valueText || 'zero'}.`;
      case 'CONDITION_CHECK': return `The condition ${condition.expression || 'is checked'} and evaluates ${condition.result ? 'TRUE, so the loop continues' : 'FALSE, so the loop stops'}.`;
      case 'ARRAY_ACCESS': return `The program reads ${valueAtIndex || 'the current value'} at array index ${index ?? 'current'}.`;
      case 'LOOP_INCREMENT': return `The counter changes from ${previous ?? 'its previous value'} to ${valueText || 'the next value'}.`;
      case 'PROGRAM_END': return 'Execution is complete and the final result is ready.';
      default: return `${step?.explanation || state.focusInfo || state.label || 'The next program operation is complete.'} ${current !== undefined && current !== null ? `${variable} is now ${valueText}.` : ''}`;
    }
  }

  if (hindi) {
    switch (event) {
      case 'ARRAY_CREATION':
        return `सबसे पहले एक सूची बनाई गई है। इसमें ${valueText || (Array.isArray(state.values) ? state.values.join(', ') : 'कुछ')} मान रखे गए हैं। आगे प्रोग्राम इन मानों को एक-एक करके पढ़ेगा और उन पर काम करेगा।`;
      case 'LOOP_INIT':
        return `अब बार-बार चलने वाले निर्देश की तैयारी हो रही है। गिनती रखने वाले चर की शुरुआती कीमत ${valueText || 'शून्य'} रखी गई है। इसी गिनती से प्रोग्राम तय करेगा कि सूची में अगला कौन-सा स्थान पढ़ना है।`;
      case 'CONDITION_CHECK':
        return `अब प्रोग्राम जाँच रहा है कि दोहराव जारी रखने की शर्त पूरी हो रही है या नहीं। जाँच का नतीजा ${condition.result ? 'सही' : 'गलत'} आया है। ${condition.result ? 'इसलिए निर्देशों का अगला समूह चलेगा और प्रोग्राम अगला काम करेगा।' : 'इसलिए दोहराव यहीं समाप्त होगा और प्रोग्राम इसके बाद वाले निर्देश पर जाएगा।'}`;
      case 'ARRAY_ACCESS':
        return `अब सूची के स्थान क्रमांक ${index ?? 'मौजूदा'} पर रखा मान पढ़ा जा रहा है। वहाँ ${valueAtIndex || 'मौजूदा मान'} मौजूद है। ${Array.isArray(step?.output) && step.output.length ? 'यह मान नतीजे में भी जोड़ा गया है।' : 'प्रोग्राम इस मान का उपयोग अगले काम में करेगा।'}`;
      case 'LOOP_INCREMENT':
        return `दोहराव का यह चक्र पूरा हो गया है। गिनती ${previous ?? 'पिछली संख्या'} से बढ़कर ${valueText || 'अगली संख्या'} हो गई है। इसके बाद प्रोग्राम नई गिनती के आधार पर शर्त फिर से जाँचेगा।`;
      case 'PROGRAM_END':
        return 'प्रोग्राम का काम सफलतापूर्वक पूरा हो गया है। अब कोई नया निर्देश नहीं चलेगा। अंतिम नतीजा ऊपर दिए गए परिणाम वाले भाग में देख सकते हैं।';
      default: {
        const change = current !== undefined && current !== null
          ? `बदला हुआ मान अब ${valueText} है।`
          : '';
        return `इस चरण में प्रोग्राम ने एक काम पूरा किया है। ${change} अब त्रि-आयामी दृश्य में हुए बदलाव को देखिए और समझिए कि अगला निर्देश इसी नई स्थिति से शुरू होगा।`;
      }
    }
  }

  switch (event) {
    case 'ARRAY_CREATION':
      return `First, the program creates an array named ${state.name || variable}. It stores ${valueText || (Array.isArray(state.values) ? state.values.join(', ') : 'the given values')} in it. These elements will be accessed and processed in the upcoming steps.`;
    case 'LOOP_INIT':
      return `Now the loop is being prepared. The counter ${variable} starts at ${valueText || 'zero'}. This counter tells the program which array index to access during each iteration.`;
    case 'CONDITION_CHECK':
      return `Before entering the loop body, the program checks ${condition.expression || 'the loop condition'}. The current evaluation is ${condition.evaluation || 'the condition'} and it is ${condition.result ? 'TRUE' : 'FALSE'}. ${condition.result ? 'So execution enters the loop body and performs the next operation.' : 'So the loop stops, and execution moves beyond the loop.'}`;
    case 'ARRAY_ACCESS':
      return `The program now reads the element at array index ${index ?? 'current'}. Its value is ${valueAtIndex || 'the current element'}. ${Array.isArray(step?.output) && step.output.length ? 'The value is also added to the program output.' : 'The program can now use this value in the next operation.'}`;
    case 'LOOP_INCREMENT':
      return `This loop iteration is complete. The counter ${variable} changes from ${previous ?? 'its previous value'} to ${valueText || 'the next value'}. The program will now check the loop condition again using this updated counter.`;
    case 'PROGRAM_END':
      return 'The program has finished executing successfully. There are no more statements to run, and the final result is available in the output panel.';
    default: {
      const detail = step?.explanation || state.focusInfo || state.label || '';
      const change = current !== undefined && current !== null
        ? `${variable} now holds ${valueText}.`
        : '';
      return detail
        ? `Here is what happens in this step: ${detail} ${change} Watch the 3D view to see how this changes the current data structure.`
        : `The program is executing its next instruction. ${change} Watch the 3D view to understand how the execution state changes.`;
    }
  }
}

/**
 * Voice playback owns its own cursor and queue. The 3D timeline never waits
 * for speech synthesis, so narration can finish every step without slowing
 * or interrupting the visualization.
 */
export default function ExecutionNarration({
  step,
  stepIndex = 0,
  totalSteps = 0,
  trace = [],
  isBright = false,
  code = '',
  language = 'en-IN',
  onTogetherPlay = () => {},
  onTogetherPause = () => {},
  togetherDisabled = false,
}) {
  const narration = useTextToSpeech();
  const [open, setOpen] = useState(false);
  const [voiceStepIndex, setVoiceStepIndex] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [togetherMode, setTogetherMode] = useState(false);
  const previousTrace = useRef(trace);
  const safeVoiceIndex = trace.length ? Math.min(voiceStepIndex, trace.length - 1) : 0;
  const voiceStep = trace[safeVoiceIndex] || null;
  const line = voiceStep?.lineNumber ?? voiceStep?.line ?? null;
  const sourceLine = line ? String(code || '').split('\n')[Number(line) - 1] || '' : '';
  const spokenLanguage = narration.voiceLanguage;
  const summary = voiceStep
    ? (line
      ? `${spokenLanguage === 'hi-IN' ? `पंक्ति ${line}। ` : `Line ${line}. `}${explainSourceLine(sourceLine, spokenLanguage, voiceStep, togetherMode)}`
      : `${spokenLanguage === 'hi-IN' ? 'चरण' : 'Step'} ${safeVoiceIndex + 1}. ${explainSourceLine('', spokenLanguage, voiceStep, togetherMode)}`)
    : 'Run a program to hear step-by-step narration.';

  useEffect(() => {
    if (previousTrace.current !== trace) {
      previousTrace.current = trace;
      narration.stop();
      setVoicePlaying(false);
      setVoiceStepIndex(0);
      return;
    }
    if (!narration.enabled) {
      setVoicePlaying(false);
      return;
    }
    if (!voicePlaying || !trace.length || narration.speaking || narration.paused) return;
    const activeStep = trace[safeVoiceIndex];
    if (!activeStep) {
      setVoicePlaying(false);
      return;
    }
    const activeLine = activeStep.lineNumber ?? activeStep.line ?? null;
    const activeSource = activeLine ? String(code || '').split('\n')[Number(activeLine) - 1] || '' : '';
    const text = activeLine
      ? `${spokenLanguage === 'hi-IN' ? `पंक्ति ${activeLine}। ` : `Line ${activeLine}. `}${explainSourceLine(activeSource, spokenLanguage, activeStep, togetherMode)}`
      : `${spokenLanguage === 'hi-IN' ? 'चरण' : 'Step'} ${safeVoiceIndex + 1}. ${explainSourceLine('', spokenLanguage, activeStep, togetherMode)}`;
    narration.speak(text, {
      lang: spokenLanguage,
      onEnd: () => {
        setVoiceStepIndex((current) => {
          const next = current + 1;
          if (next >= trace.length) {
            setVoicePlaying(false);
            return current;
          }
          return next;
        });
      },
    });
  }, [voicePlaying, narration.enabled, narration.speaking, narration.paused, narration.speak, narration.stop, trace, safeVoiceIndex, code, spokenLanguage]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const startVoice = () => {
    if (!narration.enabled) narration.toggleEnabled();
    if (voiceStepIndex >= trace.length - 1 && trace.length) setVoiceStepIndex(0);
    setVoicePlaying(true);
  };
  const pauseVoice = () => {
    narration.pause();
    if (togetherMode) onTogetherPause();
  };
  const resumeVoice = () => {
    narration.resume();
    setVoicePlaying(true);
    if (togetherMode) onTogetherPlay();
  };
  const startTogether = () => {
    if (togetherDisabled || !trace.length) return;
    if (!narration.enabled) narration.toggleEnabled();
    if (voiceStepIndex >= trace.length - 1) setVoiceStepIndex(0);
    setTogetherMode(true);
    setVoicePlaying(true);
    onTogetherPlay();
  };
  const stopVoice = () => {
    setVoicePlaying(false);
    narration.stop();
    if (togetherMode) onTogetherPause();
  };
  const moveVoice = (delta) => {
    narration.stop();
    setVoiceStepIndex((current) => Math.max(0, Math.min(trace.length - 1, current + delta)));
  };
  const backlog = stepIndex - safeVoiceIndex;
  const shell = isBright ? 'border-slate-200 bg-white text-slate-800' : 'border-slate-700 bg-slate-950 text-slate-100';
  const button = 'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40';

  const popup = open && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-end p-4 sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="tts-popup-title"
        className={`mb-16 w-full max-w-sm rounded-xl border p-4 shadow-2xl ${shell}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {narration.enabled ? <Volume2 size={18} className="text-cyan-500" /> : <VolumeX size={18} />}
            <h2 id="tts-popup-title" className="text-sm font-bold">Voice narration</h2>
            <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] opacity-80">
              {narration.speaking ? (narration.paused ? 'Paused' : 'Speaking') : voicePlaying ? 'Preparing' : 'Ready'}
            </span>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 opacity-70 hover:bg-slate-500/15 hover:opacity-100" aria-label="Close voice controls"><X size={17} /></button>
        </div>

        <button type="button" className={`${button} w-full ${narration.enabled ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600'}`}
          aria-pressed={narration.enabled} onClick={() => {
            if (narration.enabled) stopVoice();
            narration.toggleEnabled();
          }}>
          {narration.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          {narration.enabled ? 'Voice narration on' : 'Turn voice narration on'}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Spoken language</span>
            <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.voiceLanguage}
              onChange={(event) => narration.setVoiceLanguage(event.target.value)} aria-label="Narration language">
              <option value="en-IN">English (India)</option><option value="hi-IN">Hindi (India)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Speaking speed</span>
            <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.rate}
              onChange={(event) => narration.setRate(Number(event.target.value))} aria-label="Narration speed">
              <option value="0.8">Slow (0.8×)</option><option value="1">Normal (1×)</option><option value="1.2">Fast (1.2×)</option>
            </select>
          </label>
        </div>

        <div className="mt-3 rounded-lg bg-slate-500/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span>3D Live Step <strong>{step ? stepIndex + 1 : 0}</strong> / {totalSteps}</span>
            <span>Voice Step <strong>{voiceStep ? safeVoiceIndex + 1 : 0}</strong> / {trace.length}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-500/20">
            <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${trace.length ? ((safeVoiceIndex + (narration.speaking ? 0.65 : 0)) / trace.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-[11px] opacity-80" aria-live="polite">
            {backlog > 0 ? `3D is ${backlog} steps ahead — narration queue is catching up.` : backlog < 0 ? `Voice is ${Math.abs(backlog)} steps ahead of the 3D view.` : 'Voice and 3D are on the same step.'}
          </p>
          <p className="mt-2 text-xs leading-relaxed"><strong>{line ? `Line ${line}: ` : ''}</strong>{sourceLine || 'No matching source line'}<span className="mt-1 block opacity-80">{summary}</span></p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={`${button} ${togetherMode ? 'border-cyan-500 bg-cyan-500/10' : ''}`}
            aria-pressed={togetherMode} onClick={() => setTogetherMode((value) => !value)}>
            <Play size={13} />Together Mode
          </button>
          {togetherMode && (
            <button type="button" className={`${button} border-cyan-500 bg-cyan-500/10`}
              disabled={!trace.length || togetherDisabled} onClick={startTogether}
              title="Start 3D execution and concise narration together">
              <Play size={13} />Play Together
            </button>
          )}
          <button type="button" className={button} disabled={!trace.length || safeVoiceIndex <= 0} onClick={() => moveVoice(-1)} title="Previous narration step"><SkipBack size={14} />Previous</button>
          {narration.speaking && !narration.paused ? (
            <button type="button" className={button} onClick={pauseVoice}><Pause size={14} />Pause</button>
          ) : narration.paused ? (
            <button type="button" className={button} onClick={resumeVoice}><Play size={14} />Resume</button>
          ) : (
            <button type="button" className={button} disabled={!trace.length || !narration.supported || !narration.voiceAvailable} onClick={startVoice}><Play size={14} />Play</button>
          )}
          <button type="button" className={button} disabled={!trace.length || safeVoiceIndex >= trace.length - 1} onClick={() => moveVoice(1)} title="Next narration step"><SkipForward size={14} />Next</button>
          <button type="button" className={button} disabled={!narration.speaking && !narration.paused && !voicePlaying} onClick={stopVoice}><Square size={13} />Stop</button>
        </div>
        {togetherMode && <p className="mt-2 text-[10px] opacity-70">Together Mode uses shorter narration. 3D keeps its selected speed; voice continues independently if it falls behind.</p>}
        {togetherDisabled && togetherMode && <p className="mt-2 text-xs text-amber-500">Run the latest code first, then start Together Mode.</p>}
        {!narration.supported && <p className="mt-2 text-xs text-amber-500">Speech synthesis is unavailable in this browser.</p>}{narration.voiceLanguage === 'hi-IN' && !narration.voiceAvailable && <p className="mt-2 text-xs text-amber-500">इस डिवाइस पर हिन्दी आवाज़ उपलब्ध नहीं है। Windows Settings में Hindi language और Hindi text-to-speech voice जोड़ें, फिर browser दोबारा खोलें।</p>}<p className="mt-2 text-[10px] opacity-60">Uses the selected language voice installed in your browser or operating system.</p>
      </section>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="flex justify-end px-2 py-1">
        <button type="button" onClick={() => setOpen((previous) => !previous)}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold shadow-sm transition hover:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${shell}`}
          aria-label="Open voice narration controls" aria-haspopup="dialog" aria-expanded={open} title="Voice narration controls">
          {narration.enabled ? <Volume2 size={15} className="text-cyan-500" /> : <VolumeX size={15} />}
          <span>Voice</span>
        </button>
      </div>
      {popup}
    </>
  );
}
