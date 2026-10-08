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
      <div className="cs-tree-title">3D DSA Visualization</div>
      <div className="cs-tree-scene">
        <div className="cs-tree-node n1">8</div>
        <div className="cs-tree-node n2">3</div>
        <div className="cs-tree-node n3">10</div>
        <div className="cs-tree-node n4">1</div>
        <div className="cs-tree-node n5">6</div>
        <div className="cs-tree-node n6">14</div>
        <i className="e e1" /><i className="e e2" /><i className="e e3" /><i className="e e4" /><i className="e e5" />
      </div>
      <div className="cs-tree-caption">Binary Search Tree</div>
    </div>
  );
}

function GraphGraphic() {
  return (
    <div className="cs-graph-card" aria-hidden="true">
      <div className="cs-graph-title">AI + Execution + 3D</div>
      <div className="cs-graph-scene">
        <span className="g g1">A</span><span className="g g2">B</span><span className="g g3">C</span><span className="g g4">D</span><span className="g g5">E</span>
        <i className="ge ge1" /><i className="ge ge2" /><i className="ge ge3" /><i className="ge ge4" /><i className="ge ge5" />
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
            <div className="cs-kicker">THE NEXT GENERATION OF DSA LEARNING</div>
            <h1>Programming is about <em>understanding,</em><br />not memorizing.</h1>
            <p>{subtitle}</p>
            <div className="cs-cta">
              <span className="cs-cta-icon">{isMaintenance ? '↻' : '✦'}</span>
              <span>{isMaintenance ? 'Platform Maintenance' : 'Coming Soon'}</span>
            </div>
            <div className="cs-flow">
              <span>Code</span><i>→</i><span>Execute</span><i>→</i><span>Visualize</span><i>→</i><span>Understand</span>
            </div>
          </div>

          <div className="cs-visual right">
            <TreeGraphic />
            <GraphGraphic />
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
          <article><span>⌘</span><h3>Any DSA Code</h3><p>Write and run code in multiple languages.</p></article>
          <article><span>▤</span><h3>DSA Notes</h3><p>Easy theory connected to examples and 3D.</p></article>
          <article><span>✦</span><h3>AI Tutor</h3><p>Code explanations, complexity and guidance.</p></article>
          <article><span>◈</span><h3>Interactive 3D</h3><p>Watch data structures come to life.</p></article>
        </section>
      </main>

      <footer className="cs-footer">CODE3D-AI <span>•</span> Learn by seeing what your code does.</footer>
    </div>
  );
}
