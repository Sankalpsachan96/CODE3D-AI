import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

/**
 * Optional, browser-native narration for the selected execution timeline step.
 * It is opt-in and does not affect code execution or timeline playback.
 */
export default function ExecutionNarration({ step, stepIndex = 0, language = 'javascript', isBright = false }) {
  const narration = useTextToSpeech();
  const lastSpokenStep = useRef(null);
  const text = String(
    step?.explanation ||
    step?.message ||
    step?.dataStructureState?.focusInfo ||
    step?.dataStructureState?.label ||
    ''
  ).trim();
  const line = step?.lineNumber ?? step?.line ?? null;
  const summary = text
    ? (line ? `Line ${line}. ${text}` : text)
    : (step ? `Step ${stepIndex + 1}.` : 'Run a program to hear step-by-step narration.');

  useEffect(() => {
    if (!narration.enabled || !step || !text) return;
    const key = `${stepIndex}:${line ?? ''}:${text}`;
    if (lastSpokenStep.current === key) return;
    lastSpokenStep.current = key;
    narration.speak(summary, { lang: narration.voiceLanguage });
  }, [narration.enabled, narration.voiceLanguage, narration.rate, narration.speak, stepIndex, line, text, summary]);

  useEffect(() => {
    if (!narration.enabled) lastSpokenStep.current = null;
  }, [narration.enabled]);

  const shell = isBright
    ? 'border-slate-200 bg-white text-slate-800'
    : 'border-slate-700 bg-slate-950/90 text-slate-100';
  const button = 'inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <section className={`mx-2 my-1 rounded-lg border p-2 ${shell}`} aria-label="Execution voice narration">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={button} aria-pressed={narration.enabled}
          onClick={narration.toggleEnabled} title={narration.enabled ? 'Turn narration off' : 'Turn narration on'}>
          {narration.enabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {narration.enabled ? 'Voice on' : 'Voice off'}
        </button>
        <label className="flex items-center gap-1.5 text-[11px]">
          <span className="opacity-70">Voice</span>
          <select className={`h-8 rounded-md border px-2 ${shell}`} value={narration.voiceLanguage}
            onChange={(event) => narration.setVoiceLanguage(event.target.value)} aria-label="Narration language">
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[11px]">
          <span className="opacity-70">Speed</span>
          <select className={`h-8 rounded-md border px-2 ${shell}`} value={narration.rate}
            onChange={(event) => narration.setRate(Number(event.target.value))} aria-label="Narration speed">
            <option value="0.8">0.8×</option><option value="1">1×</option><option value="1.2">1.2×</option>
          </select>
        </label>
        <button type="button" className={button} disabled={!narration.speaking || narration.paused}
          onClick={narration.pause} title="Pause narration"><Pause size={13} />Pause</button>
        <button type="button" className={button} disabled={!narration.paused}
          onClick={narration.resume} title="Resume narration"><Play size={13} />Resume</button>
        <button type="button" className={button} disabled={!narration.speaking && !narration.paused}
          onClick={narration.stop} title="Stop narration"><Square size={12} />Stop</button>
        {!narration.supported && <span className="text-[11px] text-amber-500">Browser voice is unavailable.</span>}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed opacity-80" aria-live="polite">
        {narration.enabled ? (narration.caption || summary) : 'Voice narration is off. Turn it on to hear the selected execution step.'}
      </p>
      {language && <span className="sr-only">Program language: {language}</span>}
    </section>
  );
}
