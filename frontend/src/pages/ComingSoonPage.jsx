import React from 'react';
import './ComingSoonPage.css';

const status = String(import.meta.env.VITE_PLATFORM_STATUS || 'COMING_SOON').toUpperCase();

const isMaintenance = status === 'MAINTENANCE';

function FloatingParticles() {
  return (
    <div className="cs-particles" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
    </div>
  );
}

function CodePanel() {
  return (
    <div className="cs-code-panel">
      <div className="cs-window-bar">
        <span /><span /><span />
        <b>C++</b>
      </div>
      <pre>{`class TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
};

void insert(TreeNode*& root, int val) {
  if (!root) root = new TreeNode(val);
  else if (val < root->val)
    insert(root->left, val);
  else
    insert(root->right, val);
}`}</pre>
      <div className="cs-code-glow" />
    </div>
  );
}

function TreeGraphic() {
  return (
    <div className="cs-tree-card" aria-hidden="true">
      <div className="cs-tree-title">DSA Visualization</div>
      <div className="cs-tree-scene">
        <svg viewBox="0 0 420 190" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g className="cs-svg-edges">
            <line x1="210" y1="38" x2="105" y2="92" />
            <line x1="210" y1="38" x2="315" y2="92" />
            <line x1="105" y1="92" x2="48" y2="150" />
            <line x1="105" y1="92" x2="162" y2="150" />
            <line x1="315" y1="92" x2="366" y2="150" />
          </g>
          <g className="cs-svg-tree-nodes">
            <circle cx="210" cy="38" r="18" /><text x="210" y="38">8</text>
            <circle cx="105" cy="92" r="18" /><text x="105" y="92">3</text>
            <circle cx="315" cy="92" r="18" /><text x="315" y="92">10</text>
            <circle cx="48" cy="150" r="18" /><text x="48" y="150">1</text>
            <circle cx="162" cy="150" r="18" /><text x="162" y="150">6</text>
            <circle cx="366" cy="150" r="18" /><text x="366" y="150">14</text>
          </g>
        </svg>
      </div>
      <div className="cs-tree-caption">Binary Search Tree</div>
    </div>
  );
}

function GraphGraphic() {
  return (
    <div className="cs-graph-card" aria-hidden="true">
      <div className="cs-graph-title">AI + Execution + Visualization</div>
      <div className="cs-graph-scene">
        <svg viewBox="0 0 420 125" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <g className="cs-svg-edges">
            <line x1="48" y1="62" x2="145" y2="28" />
            <line x1="48" y1="62" x2="145" y2="96" />
            <line x1="145" y1="28" x2="270" y2="62" />
            <line x1="145" y1="96" x2="270" y2="62" />
            <line x1="270" y1="62" x2="370" y2="28" />
          </g>
          <g className="cs-svg-graph-nodes">
            <circle cx="48" cy="62" r="18" /><text x="48" y="62">A</text>
            <circle cx="145" cy="28" r="18" /><text x="145" y="28">B</text>
            <circle cx="145" cy="96" r="18" /><text x="145" y="96">D</text>
            <circle cx="270" cy="62" r="18" /><text x="270" y="62">C</text>
            <circle cx="370" cy="28" r="18" /><text x="370" y="28">E</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function ComingSoonPage() {
  if (status === 'LIVE') return null;

  const title = isMaintenance ? 'We’ll be back shortly.' : 'Something exciting is being built.';
  const subtitle = isMaintenance
    ? 'CODE3D-AI is temporarily offline while we improve the platform.'
    : 'An interactive programming platform where code comes to life in 3D.';

  return (
    <div className="cs-page">
      <FloatingParticles />

      <header className="cs-header">
        <div className="cs-brand">
          <div className="cs-brand-mark">C</div>
          <div>
            <strong>CODE3D-AI</strong>
            <small>Code • Visualize • Understand</small>
          </div>
        </div>
        <div className="cs-status"><span />{isMaintenance ? 'Maintenance' : 'Under Development'}</div>
      </header>

      <main className="cs-main">
        <div className="cs-orbit o1" />
        <div className="cs-orbit o2" />

        <section className="cs-hero">
          <div className="cs-visual left">
            <CodePanel />
            <div className="cs-lang-badges">
              <b>C++</b><b>Python</b><b>Java</b><b>JS</b><b>C</b>
            </div>
          </div>

          <div className="cs-copy">
            <div className="cs-kicker"><span /> THE NEXT GENERATION OF DSA LEARNING</div>
            <h1><span>See your code.</span><strong>Understand its</strong><em>execution.</em></h1>
            <p>{subtitle}</p>
            <div className="cs-cta">
              <span className="cs-cta-icon">{isMaintenance ? '↻' : '✦'}</span>
              <span>{isMaintenance ? 'Platform Maintenance' : 'Coming Soon'}</span>
            </div>
            <div className="cs-upcoming-label">WHAT'S COMING</div>
            <div className="cs-flow">
              <span>Code</span><i>→</i><span>Execute</span><i>→</i><span>Visualize</span><i>→</i><span>Understand</span>
            </div>
          </div>

          <div className="cs-visual right">
            <div className="cs-dsa-art">
              <img src="/coming-soon-dsa.svg" alt="DSA visualization preview" />
            </div>
          </div>
        </section>

        <section className="cs-message">
          <div className="cs-message-line" />
          <h2>{title}</h2>
          <p>Universal coding • DSA notes • AI Tutor • Interactive 3D visualization</p>
          <div className="cs-progress"><span /></div>
          <small>Building the future of interactive programming education.</small>
        </section>

        <section className="cs-features">
          <article><span>⌘</span><h3>Universal Code Editor</h3><p>C, C++, Java, Python & JavaScript — execute and understand DSA code.</p><b>COMING SOON</b></article>
          <article><span>▤</span><h3>DSA Notes</h3><p>Easy theory, examples, complexity, applications and visual learning.</p><b>COMING SOON</b></article>
          <article><span>✦</span><h3>AI Tutor 2.0</h3><p>Smarter explanations, errors, complexity analysis and follow-up guidance.</p><b>COMING SOON</b></article>
          <article><span>◈</span><h3>Interactive 3D</h3><p>Turn algorithms and data structures into step-by-step visual experiences.</p><b>COMING SOON</b></article>
        </section>
      </main>

      <footer className="cs-footer">CODE3D-AI <span>•</span> Learn by seeing what your code does.</footer>
    </div>
  );
}
