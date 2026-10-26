import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Pause, Play, Square, X } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

function explainSourceLine(sourceLine, language, step) {
  const line = String(sourceLine || '').trim().replace(/\/\/.*/, '').trim();
  const hindi = language === 'hi-IN';
  const hinglish = language === 'hi-Latn';
  const choose = (hi, roman, en) => hindi ? hi : hinglish ? roman : en;
  const event = String(step?.eventType || '').toUpperCase();
  if (!line) return choose('इस execution step के लिए source line उपलब्ध नहीं है।', 'Is execution step ke liye source line available nahi hai.', step?.explanation || 'No source line is available for this execution step.');

  const match = (pattern) => pattern.test(line);
  let explanation = '';
  if (/ARRAY_CREATION/.test(event) || match(/\b(?:int|long|float|double|String|boolean|var)\s*\[\s*\]|\b\w+\s*\[\s*\]\s*\w+\s*=/)) {
    explanation = choose('इस लाइन में array बनाया जा रहा है। इसमें दिए गए elements आगे इस्तेमाल करने के लिए store होते हैं।', 'Is line mein array banaya ja raha hai. Iske elements aage use karne ke liye store hote hain.', 'This line declares and initializes an array, storing the listed elements for later access.');
  } else if (/LOOP_INIT|LOOP_INCREMENT|CONDITION_CHECK/.test(event) || match(/\bfor\s*\(|\bwhile\s*\(/)) {
    explanation = choose('यह loop है। Condition तय करती है कि loop चलेगा या रुकेगा। हर चक्कर के बाद counter update होता है।', 'Yeh loop hai. Condition decide karti hai ki loop chalega ya rukega. Har round ke baad counter update hota hai.', 'This is a loop statement. Initialization sets the counter, the condition decides whether it continues, and the increment updates the counter after each iteration.');
  } else if (/ARRAY_ACCESS/.test(event) || match(/\b(?:System\.out\.(?:println|print)|console\.log|print\s*\()/)) {
    explanation = choose('इस लाइन में current value पढ़ी या print की जा रही है। Loop के अंदर हो तो यह हर चक्कर में चल सकती है।', 'Is line mein current value read ya print ho rahi hai. Loop ke andar ho to yeh har round mein chal sakti hai.', 'This line accesses or prints the current value. If it is inside a loop, it can run once for each iteration.');
  } else if (match(/^\s*if\s*\(|^\s*else\b|^\s*switch\s*\(/)) {
    explanation = choose('यह condition है। Program condition जाँचकर तय करता है कि कौन-सा code चलाना है।', 'Yeh condition hai. Program check karta hai ki kaunsa code chalana hai.', 'This is a conditional statement. The program checks the condition to decide which block should execute.');
  } else if (match(/\+\+|--|\+=|-=|\*=|\/=|(?<![=!<>])=(?!=)/)) {
    explanation = choose('इस लाइन में variable की value बदली जा रही है। दाईं तरफ का हिसाब करके result variable में रखा जाता है।', 'Is line mein variable ki value badal rahi hai. Right side ka result variable mein store hota hai.', 'This line assigns or updates a variable. The right-hand expression is evaluated and stored in the variable.');
  } else if (match(/^\s*return\b/)) {
    explanation = choose('return statement function का result वापस देता है और function को समाप्त करता है।', 'Return statement function ka result wapas deta hai aur function se bahar nikalta hai.', 'The return statement sends a result back to the caller and exits the current function.');
  } else if (match(/\b(?:public|private|protected|static|void|function|def)\b|\w+\s*\([^;]*\)\s*\{/)) {
    explanation = choose('यह function की definition है। इसके अंदर का code function call होने पर चलता है।', 'Yeh function ki definition hai. Iske andar ka code function call hone par chalta hai.', 'This defines a function or method. The code inside it runs when the function is called.');
  } else if (match(/\b(?:int|long|float|double|String|boolean|char|var|let|const)\s+\w+/)) {
    explanation = choose('इस लाइन में variable बनाया जा रहा है, जिसमें program की value store होगी।', 'Is line mein variable banaya ja raha hai, jisme program ki value store hogi.', 'This line declares a variable, which stores a value that the program can use later.');
  } else {
    explanation = choose('यह program की current line है। इसका असर code और execution की current स्थिति पर निर्भर करता है।', 'Yeh program ki current line hai. Iska effect code aur current execution state par depend karta hai.', 'This is the current source line. Its exact effect depends on the code shown and the current execution state.');
  }

  const detail = step?.currentValue !== undefined && step?.currentValue !== null
    ? choose(` अभी की value ${String(step.currentValue)} है।`, `Abhi ki value ${String(step.currentValue)} hai.`, ` Current value: ${String(step.currentValue)}.`)
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
    ? (narration.voiceLanguage === 'hi-IN' ? `लाइन ${line}। ${explanation}` : narration.voiceLanguage === 'hi-Latn' ? `Line ${line}. ${explanation}` : `Line ${line}. ${explanation}`)
    : (step ? (narration.voiceLanguage === 'hi-IN' ? `स्टेप ${stepIndex + 1}। ${explanation}` : narration.voiceLanguage === 'hi-Latn' ? `Step ${stepIndex + 1}. ${explanation}` : `Step ${stepIndex + 1}. ${step.explanation || step.message || 'Follow the current execution state.'}`) : 'Run a program to hear step-by-step narration.');

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
    <div className="fixed inset-0 z-[10000] flex items-end justify-end p-2 sm:p-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="tts-popup-title"
        className={`mb-12 max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-xl border p-4 shadow-2xl sm:mb-16 ${shell}`}>
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
              <option value="hi-IN">Hindi</option><option value="hi-Latn">Hinglish</option>
            </select>
          </label>
          {narration.voices.filter((voice) => voice.lang?.toLowerCase().startsWith(narration.voiceLanguage.slice(0, 2).toLowerCase())).length > 0 && (
            <label className="flex flex-col gap-1.5 text-xs"><span className="opacity-70">Installed voice</span>
              <select className={`h-9 w-full rounded-lg border px-2.5 ${shell}`} value={narration.voiceName}
                onChange={(event) => narration.setVoiceName(event.target.value)} aria-label="Installed browser voice">
                {narration.voices.filter((voice) => voice.lang?.toLowerCase().startsWith(narration.voiceLanguage.slice(0, 2).toLowerCase())).map((voice) => <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)}
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
