import React, { useEffect, useRef } from 'react';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Layers3,
  Play,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const features = [
  { icon: Terminal, title: 'Live Code Execution', text: 'Run your program and follow the execution path instead of guessing what happens between lines.' },
  { icon: Layers3, title: '3D Data Structures', text: 'Turn arrays, linked lists, trees, stacks, queues and graphs into interactive visual states.' },
  { icon: BrainCircuit, title: 'AI Code Tutor', text: 'Understand errors, outputs and logic with explanations grounded in your current code.' },
  { icon: Workflow, title: 'Step-by-Step Tracing', text: 'Move through execution one step at a time and inspect variables, branches and state changes.' },
  { icon: Zap, title: 'DSA Learning Hub', text: 'Explore structured algorithms and practice problems from one focused workspace.' },
  { icon: Bot, title: 'Personal Problem Solver', text: 'Bring your own problem and turn the solution into a visual execution story.' },
];

const steps = [
  ['01', 'Write', 'Start with your code in the editor.'],
  ['02', 'Execute', 'Run it through the execution engine.'],
  ['03', 'Visualize', 'Watch memory and data structures evolve.'],
  ['04', 'Understand', 'Use AI to explain what happened and why.'],
];

export default function Dashboard() {
  const { isBright } = useTheme();
  const { isAuthenticated, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const showcaseRef = useRef(null);

  const enterStudio = () => {
    if (isAuthenticated) navigate('/visualizer');
    else openLoginModal('login');
  };

  const enterDsa = () => {
    if (isAuthenticated) navigate('/dsa');
    else openLoginModal('login');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const setSpeed = () => { video.playbackRate = 1.5; };
    setSpeed();
    video.addEventListener('loadedmetadata', setSpeed);
    return () => video.removeEventListener('loadedmetadata', setSpeed);
  }, []);

  useEffect(() => {
    const showcase = showcaseRef.current;
    if (!showcase) return;
    let ticking = false;

    const update = () => {
      const rect = showcase.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (vh * 0.85);
      const p = Math.max(0, Math.min(1, raw));
      const y = 82 - p * 82;
      const scale = 0.84 + p * 0.16;
      const rotate = 7 - p * 7;
      showcase.style.transform = `perspective(1500px) translateY(${y}px) scale(${scale}) rotateX(${rotate}deg)`;
      showcase.style.opacity = String(0.22 + p * 0.78);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className={`marketing-home ${isBright ? 'marketing-light' : 'marketing-dark'}`}>
      <section className="marketing-hero">
        <div className="marketing-grid" />
        <div className="marketing-orb marketing-orb-a" />
        <div className="marketing-orb marketing-orb-b" />

        <div className="marketing-hero-copy">
          <div className="marketing-eyebrow"><span /> AI-POWERED CODE EXECUTION & VISUALIZATION</div>
          <h1>See your code.<br /><em>Understand its execution.</em></h1>
          <p>
            CODE3D AI turns source code into an interactive execution experience —
            with step-by-step tracing, 3D data structures and an AI tutor that explains the logic behind every state change.
          </p>
          <div className="marketing-actions">
            <button className="marketing-btn marketing-btn-primary" onClick={enterStudio}>
              <Play size={16} fill="currentColor" /> Open Code Studio <ArrowRight size={16} />
            </button>
            <button className="marketing-btn marketing-btn-secondary" onClick={enterDsa}>
              Explore DSA Hub <ChevronRight size={16} />
            </button>
          </div>
          <div className="marketing-proof">
            <span><Check size={14} /> Step-by-step execution</span>
            <span><Check size={14} /> 3D memory visualization</span>
            <span><Check size={14} /> AI-assisted explanation</span>
          </div>
        </div>

        <div className="marketing-showcase-wrap">
          <div className="marketing-showcase-glow" />
          <div className="marketing-showcase" ref={showcaseRef}>
            <div className="marketing-window-bar">
              <div className="window-dots"><i /><i /><i /></div>
              <span>CODE3D AI · EXECUTION STUDIO</span>
              <span className="window-live"><b /> LIVE</span>
            </div>
            <video ref={videoRef} src="/showcase.mp4" autoPlay muted loop playsInline preload="auto" />
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-stats">
        <div><strong>01</strong><span>Write</span><small>Code in a focused editor</small></div>
        <div><strong>02</strong><span>Execute</span><small>Trace every meaningful step</small></div>
        <div><strong>03</strong><span>Visualize</span><small>See state change in 3D</small></div>
        <div><strong>04</strong><span>Understand</span><small>Learn with AI explanations</small></div>
      </section>

      <section className="marketing-section">
        <div className="marketing-section-head">
          <div><span className="marketing-label">THE WORKSPACE</span><h2>Everything you need to understand execution.</h2></div>
          <p>One environment for coding, debugging, DSA practice and visual learning.</p>
        </div>
        <div className="marketing-feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="marketing-card" key={title}>
              <div className="marketing-card-icon"><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="marketing-card-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-workflow">
        <div className="marketing-section-head centered">
          <span className="marketing-label">HOW IT WORKS</span>
          <h2>From source code to spatial execution.</h2>
          <p>The interface stays simple. The execution model does the heavy lifting.</p>
        </div>
        <div className="marketing-steps">
          {steps.map(([num, title, text]) => (
            <div className="marketing-step" key={num}>
              <span>{num}</span><h3>{title}</h3><p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-cta">
        <div className="marketing-cta-inner">
          <div className="marketing-cta-icon"><Code2 size={22} /></div>
          <span className="marketing-label">BUILT FOR DEVELOPERS & DSA LEARNERS</span>
          <h2>Stop guessing what your code is doing.</h2>
          <p>Open the studio, run a program and step inside its execution.</p>
          <button className="marketing-btn marketing-btn-primary" onClick={enterStudio}>Enter CODE3D AI <ArrowRight size={16} /></button>
        </div>
      </section>

      <footer className="marketing-footer">
        <div><strong>CODE<span>3D</span> AI</strong><small>Interactive code execution, visualization and AI learning.</small></div>
        <div><button onClick={enterStudio}>Code Studio</button><button onClick={enterDsa}>DSA Hub</button></div>
        <span>© 2026 CODE3D AI</span>
      </footer>
    </div>
  );
}
