import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Wrench, Trophy, Flame, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Terminal, Sparkles, Layers3 } from 'lucide-react';

const predictions = [
  { id:'p1', level:'Easy', topic:'Arrays', title:'Array update', code:'const values = [2, 5, 8];\nvalues[1] = values[0] + values[2];\nconsole.log(values.join(", "));', options:['2, 5, 8','2, 10, 8','10, 5, 8','2, 8, 10'], answer:'2, 10, 8', explanation:'values[1] is replaced with values[0] + values[2], which is 2 + 8 = 10.' },
  { id:'p2', level:'Easy', topic:'Loops', title:'Trace the loop', code:'let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total += i;\n}\nconsole.log(total);', options:['3','5','6','123'], answer:'6', explanation:'The loop adds 1 + 2 + 3, so total becomes 6.' },
  { id:'p3', level:'Medium', topic:'Conditions', title:'Which branch runs?', code:'const n = 9;\nif (n % 2 === 0) {\n  console.log("Even");\n} else {\n  console.log("Odd");\n}', options:['Even','Odd','9','No output'], answer:'Odd', explanation:'9 % 2 is 1, so the condition is false and the else branch prints Odd.' },
  { id:'p4', level:'Medium', topic:'Stack / LIFO', title:'Last in, first out', code:'const stack = [];\nstack.push(4);\nstack.push(7);\nstack.pop();\nconsole.log(stack[stack.length - 1]);', options:['4','7','undefined','4, 7'], answer:'4', explanation:'pop() removes the last item (7), leaving 4 at the top of the stack.' },
  { id:'p5', level:'Hard', topic:'Searching', title:'Binary search midpoint', code:'const low = 0, high = 6;\nconst mid = Math.floor((low + high) / 2);\nconsole.log(mid);', options:['2','3','4','6'], answer:'3', explanation:'(0 + 6) / 2 equals 3, and flooring keeps it at 3.' }
];
const repairs = [
  { id:'r1', level:'Easy', topic:'Variables', title:'Fix the variable reference', prompt:'Correct the misspelled variable used by console.log.', code:'const score = 10;\nconsole.log(scor);', accepted:['const score = 10;\nconsole.log(score);','const score=10;\nconsole.log(score);'], expected:'10', explanation:'The declared name is score; variable names must match exactly.' },
  { id:'r2', level:'Easy', topic:'Arrays', title:'Fix the array index', prompt:'Change the index so this prints 9.', code:'const values = [3, 6, 9];\nconsole.log(values[3]);', accepted:['const values = [3, 6, 9];\nconsole.log(values[2]);','const values=[3,6,9];\nconsole.log(values[2]);'], expected:'9', explanation:'JavaScript arrays are zero-indexed, so the third item is at index 2.' },
  { id:'r3', level:'Medium', topic:'Conditions', title:'Repair the condition', prompt:'Add the missing closing parenthesis.', code:'const age = 20;\nif (age >= 18 {\n  console.log("Allowed");\n}', accepted:['const age = 20;\nif (age >= 18) {\n  console.log("Allowed");\n}'], expected:'Allowed', explanation:'The if condition must close with a parenthesis before the block begins.' }
];
const normalize = (s) => String(s).replace(/\r/g, '').split('\n').map(x=>x.trim().replace(/[ \t]+/g,' ')).join('\n').trim();

export default function ChallengeArena() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('predict');
  const [difficulty, setDifficulty] = useState('All levels');
  const [pIndex, setPIndex] = useState(0);
  const [rIndex, setRIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [repairCode, setRepairCode] = useState(repairs[0].code);
  const [repairResult, setRepairResult] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState([]);
  const ps = useMemo(()=>predictions.filter(q=>difficulty==='All levels'||q.level===difficulty),[difficulty]);
  const rs = useMemo(()=>repairs.filter(q=>difficulty==='All levels'||q.level===difficulty),[difficulty]);
  const pq = ps[pIndex % Math.max(ps.length,1)] || predictions[0];
  const rq = rs[rIndex % Math.max(rs.length,1)] || repairs[0];
  const solved = (id, points) => { setCompleted(prev=>prev.includes(id)?prev:[...prev,id]); setScore(v=>v+points); setStreak(v=>v+1); };
  const switchMode = (next) => { setMode(next); setSelected(''); setSubmitted(false); setRepairResult(null); if(next==='repair') setRepairCode(rq.code); };
  const nextQuestion = () => { if(mode==='predict'){setPIndex(v=>(v+1)%Math.max(ps.length,1));setSelected('');setSubmitted(false);} else {const next=(rIndex+1)%Math.max(rs.length,1);setRIndex(next);setRepairCode(rs[next]?.code||repairs[0].code);setRepairResult(null);} };
  const checkPrediction = () => { if(!selected||submitted)return; setSubmitted(true); if(selected===pq.answer) solved(pq.id,10); else setStreak(0); };
  const checkRepair = () => { const correct=rq.accepted.some(a=>normalize(a)===normalize(repairCode)); setRepairResult({correct}); if(correct) solved(rq.id,15); else setStreak(0); };
  const reset = () => {setScore(0);setStreak(0);setCompleted([]);setPIndex(0);setRIndex(0);setSelected('');setSubmitted(false);setRepairCode(repairs[0].code);setRepairResult(null);};
  const panel = {background:'var(--c3d-surface)',border:'1px solid var(--c3d-border)',borderRadius:16,padding:20};
  const btn = {border:'1px solid var(--c3d-border)',borderRadius:10,padding:'10px 13px',background:'var(--c3d-surface-2)',color:'inherit',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,fontWeight:650};
  const primary = {...btn,background:'var(--c3d-orange)',color:'#fff',borderColor:'var(--c3d-orange)'};
  return <div style={{maxWidth:1320,margin:'0 auto',padding:'clamp(16px,3vw,32px)',color:'var(--c3d-text)'}}>
    <style>{`
      .arena-option{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px;border:1px solid var(--c3d-border);border-radius:10px;background:var(--c3d-surface-2);color:inherit;cursor:pointer;margin:8px 0}
      .arena-option:disabled{cursor:default;opacity:1}.arena-option.selected{border-color:var(--c3d-orange)}.arena-option.correct{border-color:#16a34a;background:rgba(22,163,74,.1)}.arena-option.wrong{border-color:#dc2626;background:rgba(220,38,38,.1)}
      .arena-code{white-space:pre-wrap;overflow:auto;background:#090d16;color:#dce7f7;padding:18px;border-radius:12px;font:13px/1.8 ui-monospace,SFMono-Regular,monospace;user-select:text}
      .arena-grid{display:grid;grid-template-columns:260px minmax(0,1fr);gap:18px}.arena-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
      @media(max-width:760px){.arena-grid{grid-template-columns:1fr}.arena-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `}</style>
    <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap',marginBottom:24}}>
      <div><div style={{display:'flex',alignItems:'center',gap:8,color:'var(--c3d-cyan)',fontSize:12,fontWeight:800,letterSpacing:1.5}}><Sparkles size={15}/> CODE VISION 3D / PRACTICE</div><h1 style={{fontSize:'clamp(28px,4vw,42px)',lineHeight:1.1,margin:'10px 0'}}>DSA Challenge <span style={{color:'var(--c3d-orange)'}}>Arena</span></h1><p style={{color:'var(--c3d-muted)',maxWidth:660,margin:0}}>Predict the trace, repair a bug, and strengthen your algorithmic thinking before you run code.</p></div>
      <button style={btn} onClick={reset} title="Reset score and progress"><RotateCcw size={16}/> Reset progress</button>
    </div>
    <div className="arena-stats" style={{marginBottom:18}}>
      {[{icon:<Trophy size={17}/>,label:'POINTS',value:score},{icon:<Flame size={17}/>,label:'CURRENT STREAK',value:streak},{icon:<CheckCircle2 size={17}/>,label:'SOLVED',value:completed.length}].map(x=><div key={x.label} style={{...panel,padding:14,display:'flex',alignItems:'center',gap:12}}><span style={{color:'var(--c3d-orange)'}}>{x.icon}</span><div><strong style={{fontSize:23,display:'block'}}>{x.value}</strong><small style={{color:'var(--c3d-muted)',fontSize:10,letterSpacing:1}}>{x.label}</small></div></div>)}
    </div>
    <div className="arena-grid">
      <aside style={{...panel,alignSelf:'start'}}>
        <div style={{fontSize:11,fontWeight:800,color:'var(--c3d-muted)',letterSpacing:1.2,marginBottom:10}}>CHALLENGE MODE</div>
        <button style={{...btn,width:'100%',justifyContent:'flex-start',marginBottom:8,borderColor:mode==='predict'?'var(--c3d-orange)':'var(--c3d-border)'}} onClick={()=>switchMode('predict')}><Code2 size={17}/> Predict output</button>
        <button style={{...btn,width:'100%',justifyContent:'flex-start',borderColor:mode==='repair'?'var(--c3d-orange)':'var(--c3d-border)'}} onClick={()=>switchMode('repair')}><Wrench size={17}/> Repair code</button>
        <label htmlFor="arena-difficulty" style={{display:'block',margin:'20px 0 8px',fontSize:11,fontWeight:800,color:'var(--c3d-muted)',letterSpacing:1}}>DIFFICULTY</label>
        <select id="arena-difficulty" value={difficulty} onChange={e=>{setDifficulty(e.target.value);setPIndex(0);setRIndex(0);setSelected('');setSubmitted(false);setRepairResult(null);setRepairCode(repairs[0].code);}} style={{width:'100%',padding:11,borderRadius:9,background:'var(--c3d-surface-2)',border:'1px solid var(--c3d-border)',color:'inherit'}}>
          {['All levels','Easy','Medium','Hard'].map(x=><option key={x}>{x}</option>)}
        </select>
        <div style={{marginTop:20,padding:12,borderRadius:10,background:'var(--c3d-surface-2)',fontSize:12,color:'var(--c3d-muted)',lineHeight:1.6}}><Lightbulb size={16} style={{verticalAlign:'middle',color:'var(--c3d-orange)',marginRight:6}}/><strong style={{color:'var(--c3d-text)'}}>Learning tip</strong><p style={{margin:'6px 0 0'}}>Trace variables and indexes line by line. Understanding beats guessing.</p></div>
        <div style={{marginTop:18}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:7}}><span>LOCAL PROGRESS</span><strong>{Math.round(completed.length/(predictions.length+repairs.length)*100)}%</strong></div><div style={{height:6,background:'var(--c3d-border)',borderRadius:8,overflow:'hidden'}}><div style={{width:`${completed.length/(predictions.length+repairs.length)*100}%`,height:'100%',background:'var(--c3d-cyan)'}}/></div><small style={{color:'var(--c3d-muted)'}}>{completed.length} of {predictions.length+repairs.length} sample challenges</small></div>
      </aside>
      <section style={panel}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',marginBottom:18}}><div><div style={{fontSize:11,color:'var(--c3d-cyan)',fontWeight:800,letterSpacing:1}}>{mode==='predict'?'PREDICT & TRACE':'REPAIR LAB'} · <span style={{color:'var(--c3d-muted)'}}>{mode==='predict'?pq.level:rq.level} · {mode==='predict'?pq.topic:rq.topic}</span></div><h2 style={{fontSize:23,margin:'8px 0'}}>{mode==='predict'?pq.title:rq.title}</h2><p style={{color:'var(--c3d-muted)',margin:0}}>{mode==='predict'?'Read each line and choose the exact output.':rq.prompt}</p></div><span style={{color:'var(--c3d-orange)'}}>{mode==='predict'?<Code2 size={24}/>:<Wrench size={24}/>}</span></div>
        {mode==='predict'?<>
          <div style={{border:'1px solid var(--c3d-border)',borderRadius:12,overflow:'hidden',marginBottom:18}}><div style={{padding:'9px 14px',background:'var(--c3d-surface-2)',display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--c3d-muted)'}}><span>challenge.js</span><span>JAVASCRIPT</span></div><pre className="arena-code" style={{margin:0,borderRadius:0}}>{pq.code.split('\n').map((line,i)=>String(i+1).padStart(2,' ')+'  '+line).join('\n')}</pre></div>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><strong>What will this print?</strong><small style={{color:'var(--c3d-muted)'}}>SELECT ONE ANSWER</small></div>
          {pq.options.map((opt,i)=><button key={opt} disabled={submitted} onClick={()=>setSelected(opt)} className={'arena-option '+(submitted&&opt===pq.answer?'correct':'')+(submitted&&selected===opt&&opt!==pq.answer?' wrong':'')+(!submitted&&selected===opt?' selected':'')}><span style={{border:'1px solid var(--c3d-border)',borderRadius:6,padding:'3px 8px'}}>{String.fromCharCode(65+i)}</span><span style={{flex:1}}>{opt}</span>{submitted&&opt===pq.answer&&<CheckCircle2 size={17}/ >}{submitted&&selected===opt&&opt!==pq.answer&&<XCircle size={17}/>}</button>)}
          {submitted&&<div role="status" style={{marginTop:14,padding:14,borderRadius:10,background:'var(--c3d-surface-2)',borderLeft:`3px solid ${selected===pq.answer?'#16a34a':'#dc2626'}`}}><strong>{selected===pq.answer?'Correct — nice trace!':`Not quite. The answer is ${pq.answer}.`}</strong><p style={{marginBottom:0,color:'var(--c3d-muted)'}}>{pq.explanation}</p></div>}
          <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',marginTop:20}}><span style={{fontSize:11,color:'var(--c3d-muted)',display:'flex',alignItems:'center',gap:6}}><Terminal size={14}/> Prediction quiz; no arbitrary code is executed.</span><button style={primary} disabled={!selected||submitted} onClick={checkPrediction}>Check answer <ArrowRight size={16}/></button></div>
        </>:<>
          <div style={{border:'1px solid var(--c3d-border)',borderRadius:12,overflow:'hidden'}}><div style={{padding:'9px 14px',background:'var(--c3d-surface-2)',display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--c3d-muted)'}}><span>repair.js</span><span>SAMPLE REPAIR</span></div><textarea aria-label="Edit code to repair" spellCheck="false" value={repairCode} onChange={e=>{setRepairCode(e.target.value);setRepairResult(null);}} className="arena-code" style={{display:'block',width:'100%',minHeight:180,resize:'vertical',border:0,borderRadius:0,boxSizing:'border-box'}}/></div>
          <p style={{display:'flex',gap:8,alignItems:'flex-start',color:'var(--c3d-muted)',fontSize:13}}><Lightbulb size={16} style={{flexShrink:0,color:'var(--c3d-orange)'}}/>{rq.prompt}</p>
          {repairResult&&<div role="status" style={{padding:14,borderRadius:10,background:'var(--c3d-surface-2)',borderLeft:`3px solid ${repairResult.correct?'#16a34a':'#dc2626'}`}}><strong>{repairResult.correct?'Repair accepted!':'Not accepted yet'}</strong><p style={{marginBottom:0,color:'var(--c3d-muted)'}}>{repairResult.correct?`${rq.explanation} Expected output: ${rq.expected}`:'This sample challenge compares against known accepted fixes; it has not executed your code. Check the syntax, variable names and indexes.'}</p></div>}
          <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',marginTop:20}}><span style={{fontSize:11,color:'var(--c3d-muted)',display:'flex',alignItems:'center',gap:6}}><Terminal size={14}/> Accepted-solution check only; not a runtime sandbox.</span><button style={primary} onClick={checkRepair}>Check my fix <ArrowRight size={16}/></button></div>
        </>}
        <div style={{borderTop:'1px solid var(--c3d-border)',marginTop:20,paddingTop:16,display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><span style={{fontSize:12,color:'var(--c3d-muted)'}}>CHALLENGE ARENA · SAMPLE SET</span><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={btn} onClick={()=>navigate('/dsa')}><Layers3 size={15}/> DSA Hub</button><button style={btn} onClick={()=>navigate('/visualizer')}><Code2 size={15}/> Open 3D Studio</button><button style={primary} onClick={nextQuestion}>Next challenge <ArrowRight size={15}/></button></div></div>
      </section>
    </div>
  </div>;
}
