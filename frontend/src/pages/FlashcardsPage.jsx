import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, RotateCcw, Sparkles, Layers, X, Box, Trophy, Zap } from 'lucide-react';
import { generateFlashcards, LEVELS } from '../services/flashcardService';
import { FLASHCARDS } from '../utils/flashcardBank';
import { SAMPLE_PROGRAMS } from '../utils/sampleCodes';
import { useTheme } from '../context/ThemeContext';

const ROUND_SIZE = 5;
const PROMOTE_AT = 3;
const LEVEL_KEY = 'code3d_flashcard_levels';
const TOPICS = [
  { label: 'Arrays', conceptId: 'array-loop' }, { label: 'Linked List', conceptId: 'linked-list' },
  { label: 'Stack', conceptId: 'stack' }, { label: 'Queue', conceptId: 'queue' },
  { label: 'Binary Search Tree', conceptId: 'bst' }, { label: 'Sorting', conceptId: 'bubble-sort' },
  { label: 'Binary Search', conceptId: 'binary-search' }, { label: 'Recursion', conceptId: 'recursion' },
  { label: 'Graphs', conceptId: 'graph-bfs' }, { label: 'Dynamic Programming', conceptId: null },
  { label: 'Hashing', conceptId: null }, { label: 'Big-O Notation', conceptId: null },
];
const loadLevels = () => { try { return JSON.parse(localStorage.getItem(LEVEL_KEY) || '{}'); } catch { return {}; } };
const saveLevel = (topic, idx) => { try { localStorage.setItem(LEVEL_KEY, JSON.stringify({ ...loadLevels(), [topic]: idx })); } catch {} };

export default function FlashcardsPage({ onSelectConcept }) {
  const { isBright } = useTheme();
  const [phase, setPhase] = useState('pick');
  const [topic, setTopic] = useState('');
  const [custom, setCustom] = useState('');
  const [levelIndex, setLevelIndex] = useState(0);
  const [queue, setQueue] = useState([]);
  const [missed, setMissed] = useState([]);
  const [roundSize, setRoundSize] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [notice, setNotice] = useState('');
  const [knownCount, setKnownCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastSwipe, setLastSwipe] = useState('');
  const touchStart = useRef(null);
  const seen = useRef([]);
  const text = isBright ? '#111827' : '#f4f4f5';
  const muted = isBright ? '#64748b' : '#a1a1aa';
  const surface = isBright ? '#ffffff' : '#18181b';
  const panel = isBright ? '#f8fafc' : '#111114';
  const border = isBright ? '#e2e8f0' : '#303038';
  const accent = '#f97316';

  useEffect(() => { if (phase === 'play' && queue.length === 0) setPhase('summary'); }, [phase, queue]);

  const startRound = async (name, lvl) => {
    setPhase('loading'); setNotice(''); setFlipped(false); setLastSwipe('');
    try {
      const cards = await generateFlashcards({ topic: name, levelIndex: lvl, count: ROUND_SIZE, avoid: seen.current });
      seen.current.push(...cards.map((c) => c.front));
      setQueue(cards); setRoundSize(cards.length);
    } catch (err) {
      const filtered = FLASHCARDS.filter((c) => !c.topic || name.toLowerCase().includes(c.topic.toLowerCase()) || c.front.toLowerCase().includes(name.toLowerCase()));
      const deck = (filtered.length >= 3 ? filtered : FLASHCARDS).map((c, i) => ({ ...c, id: c.id + '-' + Date.now() + '-' + i, level: 'Offline deck' }));
      setQueue(deck); setRoundSize(deck.length);
      setNotice('AI cards unavailable: ' + (err?.message || 'network issue') + '. Playing the offline deck instead.');
    }
    setMissed([]); setKnownCount(0); setStreak(0); setPhase('play');
  };
  const pickTopic = (value) => {
    const name = String(value || '').trim().slice(0, 60);
    if (!name) return;
    const lvl = Math.min(loadLevels()[name] ?? 0, LEVELS.length - 1);
    setTopic(name); setLevelIndex(lvl); seen.current = []; startRound(name, lvl);
  };
  const card = queue[0];
  const answer = (knew) => {
    if (!card) return;
    setFlipped(false); setLastSwipe(knew ? 'known' : 'missed');
    if (knew) { setKnownCount((n) => n + 1); setStreak((n) => n + 1); setQueue((q) => q.slice(1)); }
    else { setStreak(0); setMissed((m) => m.includes(card.id) ? m : [...m, card.id]); setQueue((q) => [...q.slice(1), q[0]]); }
  };
  const firstTryKnown = Math.max(0, roundSize - missed.length);
  const promoted = firstTryKnown >= PROMOTE_AT && levelIndex < LEVELS.length - 1;
  const nextRound = () => { const next = promoted ? levelIndex + 1 : levelIndex; setLevelIndex(next); saveLevel(topic, next); startRound(topic, next); };
  const openIn3D = () => {
    const t = TOPICS.find((x) => x.label === topic);
    const concept = t?.conceptId && SAMPLE_PROGRAMS.find((p) => p.id === t.conceptId);
    if (concept && onSelectConcept) onSelectConcept(concept);
  };
  const canOpen3D = !!TOPICS.find((x) => x.label === topic)?.conceptId;
  const onTouchStart = (e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    if (!touchStart.current || !flipped) { touchStart.current = null; return; }
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) answer(dx > 0);
    touchStart.current = null;
  };
  const buttonStyle = (bg, fg = '#fff') => ({ background: bg, color: fg, border: '1px solid transparent', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform .18s, opacity .18s' });
  const chipStyle = (active = false) => ({ border: '1px solid ' + (active ? accent : border), background: active ? (isBright ? '#fff7ed' : '#431407') : surface, color: active ? accent : text, borderRadius: 999, padding: '9px 13px', cursor: 'pointer', fontSize: 13, fontWeight: 600 });
  const levelBar = <div style={{ display: 'flex', gap: 6, margin: '14px 0 18px' }}>{LEVELS.map((l, i) => <div key={l.name} title={l.name} style={{ flex: 1, height: 5, borderRadius: 9, background: i <= levelIndex ? accent : border }} />)}</div>;

  return <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(22px,4vw,48px) clamp(16px,3vw,32px) 64px', color: text }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30, padding: '8px 2px 18px', borderBottom: '1px solid ' + border }}>
      <div style={{ width: 58, height: 58, flexShrink: 0, borderRadius: 19, display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#fb923c 0%,#f97316 48%,#c2410c 100%)', boxShadow: '0 12px 30px #f9731638' }}><Layers size={22} /></div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: accent, fontWeight: 800, letterSpacing: 1.5 }}>CODE3D AI · ACTIVE RECALL</div><h1 style={{ fontSize: 'clamp(28px,3.2vw,38px)', lineHeight: 1.08, letterSpacing: '-1.2px', margin: '5px 0 8px', fontWeight: 850 }}>AI Flashcards</h1><p style={{ color: muted, margin: 0, fontSize: 13 }}>Flip it. Recall it. Master DSA.</p></div>
      {phase !== 'pick' && <button aria-label="Choose another topic" onClick={() => { setPhase('pick'); setFlipped(false); }} style={{ ...buttonStyle('transparent', text), borderColor: border, padding: 10 }}><ArrowLeft size={17} /></button>}
    </div>

    {phase === 'pick' && <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,' + (isBright ? '#ffffff' : '#17171b') + ' 0%,' + (isBright ? '#fff7ed' : '#141114') + ' 100%)', border: '1px solid ' + border, borderRadius: 26, padding: 'clamp(22px,4vw,38px)', boxShadow: '0 24px 70px #00000020' }}><div style={{ position: 'absolute', right: -70, top: -90, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,#f9731624,transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}><div style={{ fontSize: 22, letterSpacing: '-.5px', fontWeight: 850 }}>Choose your deck</div><span style={{ border: '1px solid #f9731648', color: accent, background: isBright ? '#fff7ed' : '#43140755', borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 850, letterSpacing: 1 }}>12 TOPICS</span></div><p style={{ color: muted, marginTop: 0, marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>AI creates fresh questions for your topic. Difficulty adapts as you improve.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 10, marginBottom: 28 }}>{TOPICS.map((t, i) => <button key={t.label} onClick={() => pickTopic(t.label)} style={{ ...chipStyle(topic === t.label), minHeight: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, textAlign: 'left', padding: '12px 14px', background: topic === t.label ? (isBright ? '#fff7ed' : '#431407') : surface, boxShadow: topic === t.label ? '0 0 0 2px #f9731622' : 'none', transition: 'all .18s' }}><span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 27, height: 27, borderRadius: 9, display: 'grid', placeItems: 'center', background: topic === t.label ? '#f9731620' : panel, color: accent, fontSize: 11, fontWeight: 850 }}>{String(i + 1).padStart(2,'0')}</span><span>{t.label}</span></span><ChevronRight size={15} color={topic === t.label ? accent : muted} /></button>)}</div>
      <div style={{ borderTop: '1px solid ' + border, paddingTop: 22, display: 'flex', alignItems: 'center', gap: 8, color: muted, fontSize: 11, fontWeight: 850, letterSpacing: 1.4, marginBottom: 10 }}><Sparkles size={14} color={accent} /> OR CREATE A CUSTOM DECK</div>
      <form onSubmit={(e) => { e.preventDefault(); pickTopic(custom); }} style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <input value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Heap Sort, Graph BFS, Big-O…" style={{ flex: '1 1 260px', minWidth: 0, padding: '15px 16px', borderRadius: 14, color: text, background: surface, border: '1px solid ' + border, outlineColor: accent, fontSize: 14 }} />
        <button type="submit" style={{ ...buttonStyle(accent), minHeight: 52, borderRadius: 14, padding: '0 22px', boxShadow: '0 8px 22px #f973162c' }}><Sparkles size={17} /> Generate deck</button>
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginTop: 22 }}>{[{icon:<Zap size={16}/>,title:'AI-powered',sub:'Fresh questions each round'},{icon:<Layers size={16}/>,title:'Active recall',sub:'Flip, answer, remember'},{icon:<RotateCcw size={16}/>,title:'Smart review',sub:'Missed cards return'}].map((x) => <div key={x.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 13px', background: isBright ? '#f8fafc' : '#ffffff05', border: '1px solid ' + border, borderRadius: 13 }}><span style={{ color: accent }}>{x.icon}</span><span><b style={{ display: 'block', fontSize: 12 }}>{x.title}</b><small style={{ display: 'block', color: muted, fontSize: 11, marginTop: 3 }}>{x.sub}</small></span></div>)}</div>
    </div>}

    {phase === 'loading' && <div style={{ textAlign: 'center', padding: 60, background: panel, border: '1px solid ' + border, borderRadius: 20 }}><Sparkles size={28} color={accent} /><h2>Building your deck…</h2><p style={{ color: muted }}>Creating {LEVELS[levelIndex].name} cards about {topic}.</p></div>}

    {phase === 'play' && card && <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: muted, fontSize: 13 }}><span>{topic} <span style={{ opacity: .6 }}>·</span> <b style={{ color: text }}>{LEVELS[levelIndex]?.name || 'Review'}</b></span><span>{queue.length} cards in deck</span></div>
      {levelBar}
      {notice && <div role="status" style={{ padding: 12, border: '1px solid #f59e0b55', background: isBright ? '#fffbeb' : '#42200655', color: isBright ? '#92400e' : '#fcd34d', borderRadius: 12, marginBottom: 14, fontSize: 13 }}>{notice}</div>}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); } }} aria-label={flipped ? 'Flashcard answer. Activate to see question' : 'Flashcard question. Activate to reveal answer'} style={{ position: 'relative', minHeight: 320, cursor: 'pointer', background: 'radial-gradient(circle at 10% 0%,' + (isBright ? '#fff7ed' : '#43140755') + ',transparent 50%),' + surface, border: '1px solid ' + (lastSwipe === 'known' ? '#22c55e' : lastSwipe === 'missed' ? '#ef4444' : border), borderRadius: 24, padding: 'clamp(24px,5vw,42px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', userSelect: 'none', boxShadow: '0 20px 55px #00000012', transition: 'border-color .2s' }}>
        <div style={{ position: 'absolute', top: 18, left: 20, fontSize: 11, color: muted, letterSpacing: 1.5, fontWeight: 800 }}>{flipped ? 'THE ANSWER' : 'QUICK RECALL'}</div><div style={{ position: 'absolute', top: 16, right: 20, fontSize: 12, color: muted }}>{queue.length} left</div>
        {!flipped ? <><div style={{ color: accent, marginBottom: 18 }}><Sparkles size={24} /></div><p style={{ fontSize: 'clamp(21px,3vw,28px)', fontWeight: 800, lineHeight: 1.35, margin: 0 }}>{card.front}</p><p style={{ color: muted, fontSize: 13, marginTop: 24 }}>Tap to reveal answer</p></> : <><div style={{ color: '#22c55e', marginBottom: 12 }}><Check size={27} /></div><p style={{ fontSize: 'clamp(23px,3vw,30px)', color: accent, fontWeight: 850, lineHeight: 1.25, margin: '0 0 14px' }}>{card.back}</p><p style={{ fontSize: 15, lineHeight: 1.65, color: muted, maxWidth: 520, margin: 0 }}>{card.explain}</p><p style={{ color: muted, fontSize: 11, marginTop: 24 }}>Swipe right = knew it · Swipe left = review again</p></>}
      </div>
      {flipped && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}><button onClick={() => answer(false)} style={buttonStyle('#dc2626')}><X size={17} /> Didn't know <span style={{ opacity: .8, fontSize: 11 }}>←</span></button><button onClick={() => answer(true)} style={buttonStyle('#16a34a')}><Check size={17} /> Knew it <span style={{ opacity: .8, fontSize: 11 }}>→</span></button></div>}
      {canOpen3D && <button onClick={openIn3D} style={{ ...buttonStyle('transparent', text), width: '100%', borderColor: border, marginTop: 12 }}><Box size={16} /> Explore {topic} in 3D <ChevronRight size={16} /></button>}
      <div style={{ display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 12, marginTop: 18 }}><span>Known first try: {knownCount}</span><span>Current streak: {streak} 🔥</span></div>
    </div>}

    {phase === 'summary' && <div style={{ textAlign: 'center', padding: 'clamp(24px,5vw,44px)', background: panel, border: '1px solid ' + border, borderRadius: 22 }}><div style={{ width: 60, height: 60, margin: '0 auto 14px', borderRadius: 20, display: 'grid', placeItems: 'center', background: '#16a34a18', color: '#22c55e' }}><Trophy size={30} /></div><h2 style={{ fontSize: 26, margin: '0 0 8px' }}>Deck complete!</h2><p style={{ color: muted }}>You knew <b style={{ color: text }}>{firstTryKnown}</b> of {roundSize} cards on the first try.</p><div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '22px 0' }}><div><div style={{ fontSize: 25, fontWeight: 850 }}>{knownCount}</div><div style={{ color: muted, fontSize: 12 }}>Known</div></div><div><div style={{ fontSize: 25, fontWeight: 850 }}>{missed.length}</div><div style={{ color: muted, fontSize: 12 }}>Need review</div></div></div><p style={{ color: muted, marginBottom: 22 }}>{promoted ? 'Level up unlocked: ' + LEVELS[levelIndex + 1].name + ' 🚀' : levelIndex === LEVELS.length - 1 ? 'Expert level. Keep your knowledge sharp!' : 'Repeat this level to build stronger recall.'}</p><div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}><button onClick={nextRound} style={buttonStyle(accent)}><RotateCcw size={16} /> Next round</button><button onClick={() => { setPhase('pick'); setCustom(''); }} style={{ ...buttonStyle('transparent', text), borderColor: border }}><ArrowLeft size={16} /> Change topic</button></div></div>}
  </div>;
}