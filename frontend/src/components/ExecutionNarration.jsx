import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, SkipBack, SkipForward, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function explainSourceLine(sourceLine, language, step) {
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

  if (hindi) {
    switch (event) {
      case 'ARRAY_CREATION':
        return `सबसे पहले ${state.name || variable} नाम का array बनाया गया है। इसमें ${valueText || (Array.isArray(state.values) ? state.values.join(', ') : 'दिए गए')} values रखी गई हैं। यानी आगे program इन्हीं elements को access और process करेगा।`;
      case 'LOOP_INIT':
        return `अब loop शुरू करने की तैयारी हो रही है। Counter ${variable} की शुरुआती value ${valueText || '0'} रखी गई है। इसी counter से program तय करेगा कि array का कौन-सा index access करना है।`;
      case 'CONDITION_CHECK':
        return `अब program check कर रहा है कि ${condition.expression || 'loop की condition'} सही है या नहीं। अभी calculation ${condition.evaluation || 'दिए गए condition'} है, जिसका result ${condition.result ? 'TRUE' : 'FALSE'} आया है। ${condition.result ? 'इसलिए loop के अंदर अगला step execute होगा।' : 'इसलिए loop यहीं रुक जाएगा और control आगे बढ़ेगा।'}`;
      case 'ARRAY_ACCESS':
        return `अब array के index ${index ?? 'current'} पर मौजूद element को read किया जा रहा है। इसकी value ${valueAtIndex || 'current element'} है। ${step?.output?.length ? 'यह value output में भी दिखाई गई है।' : 'इस value को program आगे process करेगा।'}`;
      case 'LOOP_INCREMENT':
        return `Loop का यह iteration पूरा हो गया है। अब ${variable} की value ${previous ?? 'पिछली value'} से बढ़कर ${valueText || 'अगली value'} हो गई है। अब program updated counter के साथ condition दोबारा check करेगा।`;
      case 'PROGRAM_END':
        return 'Program का execution सफलतापूर्वक पूरा हो गया है। अब कोई अगला statement execute नहीं होगा। ऊपर output में final result देख सकते हैं।';
      default: {
        const change = current !== undefined && current !== null
          ? `${variable} की नई value ${valueText} है।`
          : '';
        const detail = state.focusInfo || state.label || '';
        return detail
          ? `इस step में program ${detail}। ${change} अब 3D view में दिख रहे बदलाव को ध्यान से देखिए।`
          : `अब program की अगली instruction execute हो रही है। ${change} इस step के बाद execution state में जो बदलाव आया है, उसे 3D view में देखिए।`;
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
  const sourceLine = line ? String(code || '').split('\n')[Number(line) - 1] || '' : '';
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
        {!narration.supported && <p className="mt-2 text-xs text-amber-500">Speech synthesis is unavailable in this browser.</p>}<p className="mt-2 text-[10px] opacity-60">Uses an Indian English or Hindi voice when your browser or operating system provides one.</p>
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
