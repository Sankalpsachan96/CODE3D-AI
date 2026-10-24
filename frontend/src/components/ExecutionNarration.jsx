import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function explainSourceLine(sourceLine, language, step) {
  const line = String(sourceLine || '').trim().replace(/\/\/.*/, '').trim();
  const hindi = language === 'hi-IN';
  const event = String(step?.eventType || '').toUpperCase();
  if (!line) return hindi
    ? (step?.explanation || 'Is execution step ke liye source line available nahi hai.')
    : (step?.explanation || 'No source line is available for this execution step.');

  const match = (pattern) => pattern.test(line);
  let explanation = '';
  if (/ARRAY_CREATION/.test(event) || match(/\b(?:int|long|float|double|String|boolean|var)\s*\[\s*\]|\b\w+\s*\[\s*\]\s*\w+\s*=/)) {
    explanation = hindi
      ? 'Is line par array declare aur initialize ho raha hai. Isme diye gaye elements memory mein store hote hain.'
      : 'This line declares and initializes an array, storing the listed elements for later access.';
  } else if (/LOOP_INIT|LOOP_INCREMENT|CONDITION_CHECK/.test(event) || match(/\bfor\s*\(|\bwhile\s*\(/)) {
    explanation = hindi
      ? 'Yeh loop ki line hai. Initialization counter ko set karta hai, condition decide karti hai ki loop chalega ya nahi, aur increment har iteration ke baad counter update karta hai.'
      : 'This is a loop statement. Initialization sets the counter, the condition decides whether it continues, and the increment updates the counter after each iteration.';
  } else if (/ARRAY_ACCESS/.test(event) || match(/\b(?:System\.out\.(?:println|print)|console\.log|print\s*\()/)) {
    explanation = hindi
      ? 'Is line par current value access ya print ho rahi hai. Loop ke andar hone par yeh har iteration mein current element ke saath chal sakti hai.'
      : 'This line accesses or prints the current value. If it is inside a loop, it can run once for each iteration.';
  } else if (match(/^\s*if\s*\(|^\s*else\b|^\s*switch\s*\(/)) {
    explanation = hindi
      ? 'Yeh conditional statement hai. Program condition check karke decide karta hai ki kaunsa code block execute hoga.'
      : 'This is a conditional statement. The program checks the condition to decide which block should execute.';
  } else if (match(/\+\+|--|\+=|-=|\*=|\/=|(?<![=!<>])=(?!=)/)) {
    explanation = hindi
      ? 'Is line par variable ki value update ya assign ho rahi hai. Right side ki value calculate karke variable mein rakhi jaati hai.'
      : 'This line assigns or updates a variable. The right-hand expression is evaluated and stored in the variable.';
  } else if (match(/^\s*return\b/)) {
    explanation = hindi
      ? 'Return statement function ka result caller ko wapas deta hai aur current function se bahar nikalta hai.'
      : 'The return statement sends a result back to the caller and exits the current function.';
  } else if (match(/\b(?:public|private|protected|static|void|function|def)\b|\w+\s*\([^;]*\)\s*\{/)) {
    explanation = hindi
      ? 'Yeh function ya method ki definition hai. Iske andar likha code function call hone par execute hota hai.'
      : 'This defines a function or method. The code inside it runs when the function is called.';
  } else if (match(/\b(?:int|long|float|double|String|boolean|char|var|let|const)\s+\w+/)) {
    explanation = hindi
      ? 'Is line par variable declare ho raha hai. Variable program ke dauran value store karne ke liye use hota hai.'
      : 'This line declares a variable, which stores a value that the program can use later.';
  } else {
    explanation = hindi
      ? 'Yeh program ki current source line hai. Iska exact effect neeche diye gaye code aur current execution state par depend karta hai.'
      : 'This is the current source line. Its exact effect depends on the code shown and the current execution state.';
  }

  const detail = step?.currentValue !== undefined && step?.currentValue !== null
    ? (hindi ? ` Current value: ${String(step.currentValue)}.` : ` Current value: ${String(step.currentValue)}.`)
    : '';
  return explanation + detail;
}

/** Line-by-line narration for the active execution step, using browser-native speech. */
export default function ExecutionNarration({ step, stepIndex = 0, isBright = false, code = '', language = 'en-US' }) {
  const narration = useTextToSpeech();
  const [open, setOpen] = useState(false);
  const lastSpokenStep = useRef(null);
  const line = step?.lineNumber ?? step?.line ?? null;
  const sourceLine = line ? String(code || '').split('\n')[Number(line) - 1] || '' : '';
  const explanation = explainSourceLine(sourceLine, narration.voiceLanguage, step);
  const summary = line
    ? (narration.voiceLanguage === 'hi-IN' ? `Line ${line}. ${explanation}` : `Line ${line}. ${explanation}`)
    : (step ? `Step ${stepIndex + 1}. ${step.explanation || step.message || 'Follow the current execution state.'}` : 'Run a program to hear step-by-step narration.');

  useEffect(() => {
    if (!narration.enabled || !step || !summary) return;
    const key = `${stepIndex}:${line ?? ''}:${summary}`;
    if (lastSpokenStep.current === key) return;
    lastSpokenStep.current = key;
    narration.speak(summary, { lang: narration.voiceLanguage });
  }, [narration.enabled, narration.voiceLanguage, narration.rate, narration.speak, stepIndex, line, summary, step]);

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
            <h2 id="tts-popup-title" className="text-sm font-bold">Line-by-line voice</h2>
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
          <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Spoken language</span>
            <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.voiceLanguage}
              onChange={(event) => narration.setVoiceLanguage(event.target.value)} aria-label="Narration language">
              <option value="en-US">English</option><option value="hi-IN">Hindi</option>
            </select>
          </label>
          {narration.voices.length > 0 && (
            <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Installed voice</span>
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
        <p className="mt-3 rounded-lg bg-slate-500/10 p-2.5 text-xs leading-relaxed" aria-live="polite">
          <strong>{line ? `Line ${line}: ` : ''}</strong>{sourceLine || 'No matching source line'}
          <span className="mt-1 block opacity-80">{summary}</span>
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
          aria-label="Open line-by-line text-to-speech controls" aria-haspopup="dialog" aria-expanded={open} title="Line-by-line voice settings">
          {narration.enabled ? <Volume2 size={15} className="text-cyan-500" /> : <VolumeX size={15} />}
          <span>Voice</span>
        </button>
      </div>
      {popup}
    </>
  );
}
