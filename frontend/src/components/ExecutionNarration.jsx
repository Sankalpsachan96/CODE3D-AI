import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

/** Compact launcher with a body-level popup so controls aren't clipped by the 3D viewport. */
export default function ExecutionNarration({ step, stepIndex = 0, isBright = false }) {
  const narration = useTextToSpeech();
  const [open, setOpen] = useState(false);
  const lastSpokenStep = useRef(null);
  const text = String(step?.explanation || step?.message || step?.dataStructureState?.focusInfo || step?.dataStructureState?.label || '').trim();
  const line = step?.lineNumber ?? step?.line ?? null;
  const summary = text ? (line ? `Line ${line}. ${text}` : text) : (step ? `Step ${stepIndex + 1}.` : 'Run a program to hear step-by-step narration.');

  useEffect(() => {
    if (!narration.enabled || !step || !text) return;
    const key = `${stepIndex}:${line ?? ''}:${text}`;
    if (lastSpokenStep.current === key) return;
    lastSpokenStep.current = key;
    narration.speak(summary, { lang: narration.voiceLanguage });
  }, [narration.enabled, narration.voiceLanguage, narration.rate, narration.speak, stepIndex, line, text, summary, step]);

  useEffect(() => {
    if (!narration.enabled) lastSpokenStep.current = null;
  }, [narration.enabled]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

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
            <h2 id="tts-popup-title" className="text-sm font-bold">Text-to-Speech</h2>
            <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] opacity-80">
              {narration.speaking ? (narration.paused ? 'Paused' : 'Speaking') : 'Ready'}
            </span>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 opacity-70 hover:bg-slate-500/15 hover:opacity-100" aria-label="Close text-to-speech controls"><X size={17} /></button>
        </div>

        <button type="button" className={`${button} w-full ${narration.enabled ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-600'}`}
          aria-pressed={narration.enabled} onClick={narration.toggleEnabled}>
          {narration.enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          {narration.enabled ? 'Voice narration on' : 'Turn voice narration on'}
        </button>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Language</span>
            <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.voiceLanguage}
              onChange={(event) => narration.setVoiceLanguage(event.target.value)} aria-label="Narration language">
              <option value="en-US">English</option><option value="hi-IN">Hindi</option>
            </select>
          </label>
          {narration.voices.length > 0 && (
            <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Voice</span>
              <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.voiceName}
                onChange={(event) => narration.setVoiceName(event.target.value)} aria-label="Installed browser voice">
                {narration.voices.map((voice) => <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Speaking speed</span>
            <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.rate}
              onChange={(event) => narration.setRate(Number(event.target.value))} aria-label="Narration speed">
              <option value="0.8">Slow (0.8×)</option><option value="1">Normal (1×)</option><option value="1.2">Fast (1.2×)</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={button} disabled={!narration.speaking || narration.paused} onClick={narration.pause}><Pause size={14} />Pause</button>
          <button type="button" className={button} disabled={!narration.paused} onClick={narration.resume}><Play size={14} />Resume</button>
          <button type="button" className={button} disabled={!narration.speaking && !narration.paused} onClick={narration.stop}><Square size={13} />Stop</button>
        </div>
        <p className="mt-3 rounded-lg bg-slate-500/10 p-2.5 text-xs leading-relaxed opacity-80" aria-live="polite">
          {narration.enabled ? summary : 'Voice narration is off. Turn it on to hear each execution step.'}
        </p>
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
          aria-label="Open text-to-speech controls" aria-haspopup="dialog" aria-expanded={open} title="Text-to-speech settings">
          {narration.enabled ? <Volume2 size={15} className="text-cyan-500" /> : <VolumeX size={15} />}
          <span>Voice</span>
        </button>
      </div>
      {popup}
    </>
  );
}
