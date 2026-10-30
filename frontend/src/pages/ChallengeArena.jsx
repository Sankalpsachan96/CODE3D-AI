import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Wrench, Trophy, Flame, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Terminal, Sparkles, Layers3, RefreshCw } from 'lucide-react';
import { generateArenaChallenge, gradeArenaRepair } from '../services/apiService';

const LANGUAGES = [
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
];

export default function ChallengeArena() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('predict');
  const [language, setLanguage] = useState('javascript');
  const [difficulty, setDifficulty] = useState('All levels');
  const [refreshKey, setRefreshKey] = useState(0);
  const [challenge, setChallenge] = useState(null);
  const [recentTitles, setRecentTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [repairCode, setRepairCode] = useState('');
  const [repairResult, setRepairResult] = useState(null);
  const [grading, setGrading] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setChallenge(null);
    setSelected(null);
    setSubmitted(false);
    setRepairResult(null);
    setRepairCode('');
    generateArenaChallenge({ mode, language, difficulty, previousTitles: recentTitles })
      .then((next) => {
        if (!active) return;
        setChallenge(next);
        setRepairCode(next.code || '');
        setRecentTitles((prev) => [next.title, ...prev].slice(0, 8));
      })
      .catch((err) => {
        if (active) setError(err.message || 'AI challenge generation failed.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [mode, language, difficulty, refreshKey]);

  const changeMode = (next) => { if (next !== mode) setMode(next); };
  const nextChallenge = () => setRefreshKey((v) => v + 1);
  const checkPrediction = () => {
    if (selected === null || submitted || !challenge) return;
    setSubmitted(true);
    if (selected === challenge.correctIndex) {
      setScore((v) => v + 10);
      setStreak((v) => v + 1);
      setCompleted((v) => v + 1);
    } else setStreak(0);
  };
  const checkRepair = async () => {
    if (!challenge || grading || repairResult) return;
    setGrading(true);
    setError('');
    try {
      const result = await gradeArenaRepair({ language, challenge, submittedCode: repairCode });
      setRepairResult(result);
      if (result.correct) {
        setScore((v) => v + 15);
        setStreak((v) => v + 1);
        setCompleted((v) => v + 1);
      } else setStreak(0);
    } catch (err) {
      setError(err.message || 'AI could not grade this repair.');
    } finally {
      setGrading(false);
    }
  };
  const reset = () => {
    setScore(0); setStreak(0); setCompleted(0); setRecentTitles([]);
    setRefreshKey((v) => v + 1);
  };

  const panel = { background: 'var(--c3d-surface)', border: '1px solid var(--c3d-border)', borderRadius: 16, padding: 20 };
  const btn = { border: '1px solid var(--c3d-border)', borderRadius: 10, padding: '10px 13px', background: 'var(--c3d-surface-2)', color: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 650 };
  const primary = { ...btn, background: 'var(--c3d-orange)', color: '#fff', borderColor: 'var(--c3d-orange)' };
  const muted = { color: 'var(--c3d-muted)' };

  return <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(16px,3vw,32px)', color: 'var(--c3d-text)' }}>
    <style>{`
      .arena-option{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px;border:1px solid var(--c3d-border);border-radius:10px;background:var(--c3d-surface-2);color:inherit;cursor:pointer;margin:8px 0}
      .arena-option:disabled{cursor:default;opacity:1}.arena-option.selected{border-color:var(--c3d-orange)}.arena-option.correct{border-color:#16a34a;background:rgba(22,163,74,.1)}.arena-option.wrong{border-color:#dc2626;background:rgba(220,38,38,.1)}
      .arena-code{white-space:pre-wrap;overflow:auto;background:#090d16;color:#dce7f7;padding:18px;border-radius:12px;font:13px/1.8 ui-monospace,SFMono-Regular,monospace;user-select:text}
      .arena-grid{display:grid;grid-template-columns:260px minmax(0,1fr);gap:18px}.arena-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      @media(max-width:760px){.arena-grid{grid-template-columns:1fr}.arena-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
      <div><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--c3d-cyan)', fontSize: 12, fontWeight: 800, letterSpacing: 1.5 }}><Sparkles size={15}/> CODE VISION 3D / AI PREDICT & REPAIR</div><h1 style={{ fontSize: 'clamp(28px,4vw,42px)', lineHeight: 1.1, margin: '10px 0' }}>Predict <span style={{ color: 'var(--c3d-orange)' }}>& Repair</span></h1><p style={{ ...muted, maxWidth: 660, margin: 0 }}>Fresh DSA challenges across five programming languages.</p></div>
      <button style={btn} onClick={reset} title="Reset score and progress"><RotateCcw size={16}/> Reset progress</button>
    </div>
    <div className="arena-stats" style={{ marginBottom: 18 }}>
      {[{ icon: <Trophy size={17}/>, label: 'POINTS', value: score }, { icon: <Flame size={17}/>, label: 'CURRENT STREAK', value: streak }, { icon: <CheckCircle2 size={17}/>, label: 'SOLVED', value: completed }].map((x) => <div key={x.label} style={{ ...panel, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ color: 'var(--c3d-orange)' }}>{x.icon}</span><div><strong style={{ fontSize: 23, display: 'block' }}>{x.value}</strong><small style={{ ...muted, fontSize: 10, letterSpacing: 1 }}>{x.label}</small></div></div>)}
    </div>
    <div className="arena-grid">
      <aside style={{ ...panel, alignSelf: 'start' }}>
        <div style={{ fontSize: 11, fontWeight: 800, ...muted, letterSpacing: 1.2, marginBottom: 10 }}>CHALLENGE MODE</div>
        <button style={{ ...btn, width: '100%', justifyContent: 'flex-start', marginBottom: 8, borderColor: mode === 'predict' ? 'var(--c3d-orange)' : 'var(--c3d-border)' }} onClick={() => changeMode('predict')}><Code2 size={17}/> Predict output</button>
        <button style={{ ...btn, width: '100%', justifyContent: 'flex-start', borderColor: mode === 'repair' ? 'var(--c3d-orange)' : 'var(--c3d-border)' }} onClick={() => changeMode('repair')}><Wrench size={17}/> Repair code</button>
        <label htmlFor="arena-language" style={{ display: 'block', margin: '20px 0 8px', fontSize: 11, fontWeight: 800, ...muted, letterSpacing: 1 }}>PROGRAMMING LANGUAGE</label>
        <select id="arena-language" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 9, background: 'var(--c3d-surface-2)', border: '1px solid var(--c3d-border)', color: 'inherit' }}>{LANGUAGES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
        <label htmlFor="arena-difficulty" style={{ display: 'block', margin: '18px 0 8px', fontSize: 11, fontWeight: 800, ...muted, letterSpacing: 1 }}>DIFFICULTY</label>
        <select id="arena-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: '100%', padding: 11, borderRadius: 9, background: 'var(--c3d-surface-2)', border: '1px solid var(--c3d-border)', color: 'inherit' }}>{['All levels', 'Easy', 'Medium', 'Hard'].map((x) => <option key={x}>{x}</option>)}</select>
        <div style={{ marginTop: 20, padding: 12, borderRadius: 10, background: 'var(--c3d-surface-2)', fontSize: 12, ...muted, lineHeight: 1.6 }}><Lightbulb size={16} style={{ verticalAlign: 'middle', color: 'var(--c3d-orange)', marginRight: 6 }}/><strong style={{ color: 'var(--c3d-text)' }}>Learning tip</strong><p style={{ margin: '6px 0 0' }}>Trace each operation carefully. A fresh challenge is created when you switch language, difficulty or mode.</p></div>
      </aside>
      <section style={panel}>
        {loading ? <div style={{ minHeight: 300, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><RefreshCw size={28} className="spin" style={{ color: 'var(--c3d-orange)' }}/><h3>Generating a fresh challenge…</h3><p style={muted}>Creating a unique {language.toUpperCase()} {mode === 'predict' ? 'prediction' : 'repair'} problem.</p></div></div> : error && !challenge ? <div role="alert" style={{ padding: 18, borderRadius: 12, background: 'var(--c3d-surface-2)' }}><strong>Could not load an AI challenge</strong><p style={muted}>{error}</p><button style={primary} onClick={nextChallenge}><RefreshCw size={15}/> Try again</button></div> : challenge && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 18 }}><div><div style={{ fontSize: 11, color: 'var(--c3d-cyan)', fontWeight: 800, letterSpacing: 1 }}>{mode === 'predict' ? 'PREDICT & TRACE' : 'REPAIR LAB'} · <span style={muted}>{challenge.difficulty} · {challenge.topic} · {language.toUpperCase()}</span></div><h2 style={{ fontSize: 23, margin: '8px 0' }}>{challenge.title}</h2><p style={{ ...muted, margin: 0 }}>{mode === 'predict' ? 'Read the code and select its exact output.' : challenge.prompt}</p></div><span style={{ color: 'var(--c3d-orange)' }}>{mode === 'predict' ? <Code2 size={24}/> : <Wrench size={24}/>}</span></div>
          <div style={{ border: '1px solid var(--c3d-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}><div style={{ padding: '9px 14px', background: 'var(--c3d-surface-2)', display: 'flex', justifyContent: 'space-between', fontSize: 11, ...muted }}><span>challenge.{({ c: 'c', cpp: 'cpp', java: 'java', javascript: 'js', python: 'py' })[language]}</span><span>{language.toUpperCase()}</span></div>{mode === 'predict' ? <pre className="arena-code" style={{ margin: 0, borderRadius: 0 }}>{challenge.code.split('\n').map((line, i) => String(i + 1).padStart(2, ' ') + '  ' + line).join('\n')}</pre> : <textarea aria-label="Edit code to repair" spellCheck="false" value={repairCode} onChange={(e) => { setRepairCode(e.target.value); setRepairResult(null); }} className="arena-code" style={{ display: 'block', width: '100%', minHeight: 220, resize: 'vertical', border: 0, borderRadius: 0, boxSizing: 'border-box' }}/>}</div>
          {mode === 'predict' ? <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><strong>What will this program print?</strong><small style={muted}>SELECT ONE ANSWER</small></div>
            {challenge.options.map((option, i) => <button key={`${i}-${option}`} disabled={submitted} onClick={() => setSelected(i)} className={'arena-option ' + (submitted && i === challenge.correctIndex ? 'correct' : '') + (submitted && selected === i && i !== challenge.correctIndex ? ' wrong' : '') + (!submitted && selected === i ? ' selected' : '')}><span style={{ border: '1px solid var(--c3d-border)', borderRadius: 6, padding: '3px 8px' }}>{String.fromCharCode(65 + i)}</span><span style={{ flex: 1 }}>{option}</span>{submitted && i === challenge.correctIndex && <CheckCircle2 size={17}/>}{submitted && selected === i && i !== challenge.correctIndex && <XCircle size={17}/>}</button>)}
            {submitted && <div role="status" style={{ marginTop: 14, padding: 14, borderRadius: 10, background: 'var(--c3d-surface-2)', borderLeft: `3px solid ${selected === challenge.correctIndex ? '#16a34a' : '#dc2626'}` }}><strong>{selected === challenge.correctIndex ? 'Correct — nice trace!' : `Not quite. Correct answer: ${challenge.options[challenge.correctIndex]}`}</strong><p style={{ marginBottom: 0, ...muted }}>{challenge.explanation}</p></div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}><button style={primary} disabled={selected === null || submitted} onClick={checkPrediction}>Check answer <ArrowRight size={16}/></button></div>
          </> : <>
            {repairResult && <div role="status" style={{ padding: 14, borderRadius: 10, marginBottom: 14, background: 'var(--c3d-surface-2)', borderLeft: `3px solid ${repairResult.correct ? '#16a34a' : '#dc2626'}` }}><strong>{repairResult.correct ? 'Repair accepted!' : 'Not correct yet'}</strong><p style={{ marginBottom: 0, ...muted }}>{repairResult.feedback}</p>{repairResult.correct && <p style={{ marginBottom: 0, ...muted }}>{repairResult.explanation}</p>}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginTop: 18 }}><span style={{ fontSize: 11, ...muted, display: 'flex', alignItems: 'center', gap: 6 }}><Terminal size={14}/> Code review · equivalent solutions accepted</span><button style={primary} disabled={grading || !repairCode.trim() || !!repairResult?.correct} onClick={checkRepair}>{grading ? 'Checking…' : 'Check my fix'} <ArrowRight size={16}/></button></div>
          </>}
          {error && challenge && <p role="alert" style={{ color: '#dc2626', marginTop: 12 }}>{error}</p>}
          <div style={{ borderTop: '1px solid var(--c3d-border)', marginTop: 20, paddingTop: 16, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><span style={{ fontSize: 12, ...muted }}>GENERATED · {challenge.id.slice(0, 18)}</span><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button style={btn} onClick={() => navigate('/dsa')}><Layers3 size={15}/> DSA Hub</button><button style={btn} onClick={() => navigate('/visualizer')}><Code2 size={15}/> Open 3D Studio</button><button style={primary} onClick={nextChallenge}><RefreshCw size={15}/> Next {mode === 'predict' ? 'question' : 'problem'} <ArrowRight size={15}/></button></div></div>
        </>}
      </section>
    </div>
  </div>;
}
