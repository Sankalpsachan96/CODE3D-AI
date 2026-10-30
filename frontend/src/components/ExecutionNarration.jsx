import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, SkipBack, SkipForward, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function explainSourceLine(sourceLine, language, step) {
  const line = String(sourceLine || '').trim().replace(/\\/\\/.*/, '').trim();
  const hindi = language === 'hi-IN';
  const event = String(step?.eventType || '').toUpperCase();
  if (!line) return step?.explanation || step?.message || (hindi
    ? 'Is execution step ke liye source line available nahi hai.'
    : 'No source line is available for this execution step.');

  const match = (pattern) => pattern.test(line);
  let explanation = '';
  if (/ARRAY_CREATION/.test(event) || match(/\\b(?:int|long|float|double|String|boolean|var)\\s*\\[\\s*\\]|\\b\\w+\\s*\\[\\s*\\]\\s*\\w+\\s*=/)) {
    explanation = hindi
      ? 'Is line par array declare aur initialize ho raha hai. Isme diye gaye elements memory mein store hote hain.'
      : 'This line declares and initializes an array, storing the listed elements for later access.';
  } else if (/LOOP_INIT|LOOP_INCREMENT|CONDITION_CHECK/.test(event) || match(/\\bfor\\s*\\(|\\bwhile\\s*\\(/)) {
    explanation = hindi
      ? 'Yeh loop ki line hai. Initialization counter ko set karta hai, condition decide karti hai ki loop chalega ya nahi, aur increment har iteration ke baad counter update karta hai.'
      : 'This is a loop statement. Initialization sets the counter, the condition decides whether it continues, and the increment updates the counter after each iteration.';
  } else if (/ARRAY_ACCESS/.test(event) || match(/\\b(?:System\\.out\\.(?:println|print)|console\\.log|print\\s*\\()/)) {
    explanation = hindi
      ? 'Is line par current value access ya print ho rahi hai. Loop ke andar hone par yeh har iteration mein current element ke saath chal sakti hai.'
      : 'This line accesses or prints the current value. If it is inside a loop, it can run once for each iteration.';
  } else if (match(/^\\s*if\\s*\\(|^\\s*else\\b|^\\s*switch\\s*\\(/)) {
    explanation = hindi
      ? 'Yeh conditional statement hai. Program condition check karke decide karta hai ki kaunsa code block execute hoga.'
      : 'This is a conditional statement. The program checks the condition to decide which block should execute.';
  } else if (match(/\\+\\+|--|\\+=|-=|\\*=|\\/=|(?<![=!<>])=(?!=)/)) {
    explanation = hindi
      ? 'Is line par variable ki value update ya assign ho rahi hai. Right side ki value calculate karke variable mein rakhi jaati hai.'
      : 'This line assigns or updates a variable. The right-hand expression is evaluated and stored in the variable.';
  } else if (match(/^\\s*return\\b/)) {
    explanation = hindi
      ? 'Return statement function ka result caller ko wapas deta hai aur current function se bahar nikalta hai.'
      : 'The return statement sends a result back to the caller and exits the current function.';
  } else if (match(/\\b(?:public|private|protected|static|void|function|def)\\b|\\w+\\s*\\([^;]*\\)\\s*\\{/)) {
    explanation = hindi
      ? 'Yeh function ya method ki definition hai. Iske andar likha code function call hone par execute hota hai.'
      : 'This defines a function or method. The code inside it runs when the function is called.';
  } else if (match(/\\b(?:int|long|float|double|String|boolean|char|var|let|const)\\s+\\w+/)) {
    explanation = hindi
      ? 'Is line par variable declare ho raha hai. Variable program ke dauran value store karne ke liye use hota hai.'
      : 'This line declares a variable, which stores a value that the program can use later.';
  } else {
    explanation = step?.explanation || (hindi
      ? 'Yeh program ki current source line hai. Iska exact effect current execution state par depend karta hai.'
      : 'This is the current source line. Its exact effect depends on the current execution state.');
  }

  const detail = step?.currentValue !== undefined && step?.currentValue !== null
    ? ` Current value: ${String(step.currentValue)}.`
    : '';
  const stepDetail = step?.explanation && !explanation.includes(step.explanation) ? ` ${step.explanation}` : '';
  return explanation + detail + stepDetail;
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
  language = 'en-US',
}) {
  const narration = useTextToSpeech();
  const [open, setOpen] = useState(false);
  const [voiceStepIndex, setVoiceStepIndex] = useState(0);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const previousTrace = useRef(trace);
  const safeVoiceIndex = trace.length ? Math.min(voiceStepIndex, trace.length - 1) : 0;
  const voiceStep = trace[safeVoiceIndex] || null;
  const line = voiceStep?.lineNumber ?? voiceStep?.line ?? null;
  const sourceLine = line ? String(code || '').split('\\n')[Number(line) - 1] || '' : '';
  const spokenLanguage = narration.voiceLanguage;
  const summary = voiceStep
    ? (line
      ? `Line ${line}. ${explainSourceLine(sourceLine, spokenLanguage, voiceStep)}`
      : `Step ${safeVoiceIndex + 1}. ${voiceStep.explanation || voiceStep.message || voiceStep.dataStructureState?.focusInfo || voiceStep.dataStructureState?.label || 'Follow the current execution state.'}`)
    : 'Run a program to hear step-by-step narration.';

  useEffect(() => {
    if (previousTrace.current !== trace) {
      previousTrace.current = trace;
      narration.stop();
      setVoicePlaying(false);
      setVoiceStepIndex(0);
    }
  }, [trace, narration.stop]);

  useEffect(() => {
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
    const activeSource = activeLine ? String(code || '').split('\\n')[Number(activeLine) - 1] || '' : '';
    const text = activeLine
      ? `Line ${activeLine}. ${explainSourceLine(activeSource, spokenLanguage, activeStep)}`
      : `Step ${safeVoiceIndex + 1}. ${activeStep.explanation || activeStep.message || activeStep.dataStructureState?.focusInfo || activeStep.dataStructureState?.label || 'Follow the current execution state.'}`;
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
  const pauseVoice = () => narration.pause();
  const resumeVoice = () => {
    narration.resume();
    setVoicePlaying(true);
  };
  const stopVoice = () => {
    setVoicePlaying(false);
    narration.stop();
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
              <option value="en-US">English</option><option value="hi-IN">Hindi</option>
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
          <button type="button" className={button} disabled={!trace.length || safeVoiceIndex <= 0} onClick={() => moveVoice(-1)} title="Previous narration step"><SkipBack size={14} />Previous</button>
          {narration.speaking && !narration.paused ? (
            <button type="button" className={button} onClick={pauseVoice}><Pause size={14} />Pause</button>
          ) : narration.paused ? (
            <button type="button" className={button} onClick={resumeVoice}><Play size={14} />Resume</button>
          ) : (
            <button type="button" className={button} disabled={!trace.length || !narration.supported} onClick={startVoice}><Play size={14} />Play</button>
          )}
          <button type="button" className={button} disabled={!trace.length || safeVoiceIndex >= trace.length - 1} onClick={() => moveVoice(1)} title="Next narration step"><SkipForward size={14} />Next</button>
          <button type="button" className={button} disabled={!narration.speaking && !narration.paused && !voicePlaying} onClick={stopVoice}><Square size={13} />Stop</button>
        </div>
        {!narration.supported && <p className="mt-2 text-xs text-amber-500">Speech synthesis is unavailable in this browser.</p>}
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
