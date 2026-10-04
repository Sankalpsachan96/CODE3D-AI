import React, { useState, useEffect } from 'react';
import { Settings, Cpu, HardDrive, CheckCircle2, ShieldCheck, Terminal, Layers, Sun, Moon, Palette, Gauge } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme, isBright } = useTheme();

  const [speed, setSpeed] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_default_speed');
      return saved ? Number(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      return localStorage.getItem('code3d_reduced_motion') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    try {
      localStorage.setItem('code3d_default_speed', String(newSpeed));
    } catch (e) {}
  };

  const handleReducedMotionToggle = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('code3d_reduced_motion', String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border ${
            isBright
              ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
              : 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400'
          }`}>
            <Settings size={13} />
            <span>Platform Configuration &amp; Diagnostics</span>
          </div>
          <h1 className={`text-3xl font-extrabold ${isBright ? 'text-slate-900' : 'text-white'}`}>
            System Settings &amp; Appearance
          </h1>
          <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            Configure color themes, compiler runtimes, AST sandboxes, and 3D WebGL rendering settings.
          </p>
        </div>

        {/* Theme Customizer Card */}
        <div className={`border rounded-2xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
              <Palette size={16} className="text-cyan-500" />
              <span>Appearance &amp; Display Theme</span>
            </h2>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isBright ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              Active: {isBright ? 'Bright Mode ☀️' : 'Dark Mode 🌙'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode Card */}
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                !isBright
                  ? 'bg-slate-950 border-cyan-500/80 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-100/80 border-slate-300 hover:border-slate-400 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Moon size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">Nebula Dark Space</span>
                  {!isBright && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Immersive deep space aesthetic (`#070b14`), glowing neon pointers, vs-dark Monaco code editor.
                </p>
              </div>
            </button>

            {/* Bright Mode Card */}
            <button
              onClick={() => setTheme('bright')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                isBright
                  ? 'bg-white border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-100'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Sun size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>
                    Daylight Studio Bright
                  </span>
                  {isBright && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-[11px] leading-snug ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  Crisp daylight studio lighting, clean high-contrast text, soft studio 3D floor, light Monaco editor.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Animation Speed & Motion Accessibility Card */}
        <div className={`border rounded-2xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
            <Gauge size={16} className="text-cyan-500" />
            <span>3D Playback &amp; Motion Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Playback Speed */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
                  Default Playback Speed
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{speed}x</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Speed used when launching new algorithm visualizations.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                {[0.25, 0.5, 1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition cursor-pointer ${
                      speed === s
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : isBright ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isBright ? 'text-slate-800' : 'text-slate-200'}`}>
                    Reduced Motion
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    reducedMotion
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {reducedMotion ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Disables rapid 3D camera sweeps and pulsating lighting effects.
                </p>
              </div>

              <button
                onClick={handleReducedMotionToggle}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  reducedMotion
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : isBright ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {reducedMotion ? 'Disable Reduced Motion' : 'Enable Reduced Motion'}
              </button>
            </div>
          </div>
        </div>

        {/* Runtime Stack Info */}
        <div className={`border rounded-2xl p-6 space-y-4 transition-colors ${
          isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
            <Cpu size={16} className="text-cyan-500" />
            <span>Active Software Runtimes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>5-Language Polyglot Engine</div>
              <div className={`font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Java, C++, Python, JS &amp; C</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Normalized Trace Pipeline
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Full-Stack Backend Server</div>
              <div className={`font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Node.js / Express + PostgreSQL (Neon) / Prisma</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Port 5000 (Cookie Sessions + Sandbox)
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Frontend Bundler</div>
              <div className={`font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Vite 5.4 + React 18</div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> Port 5173 (HMR Active)
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-1 ${
              isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className={`uppercase text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>3D Graphics Pipeline</div>
              <div className={`font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>Three.js + React Three Fiber 8</div>
              <div className="text-cyan-600 dark:text-cyan-400 text-[11px] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> WebGL 2.0 Hardware Accelerated
              </div>
            </div>
          </div>
        </div>

        {/* Security & Sandboxing Info */}
        <div className={`border rounded-2xl p-6 space-y-3 transition-colors ${
          isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className={`text-sm font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Code Execution Sandbox &amp; Security Protocol</span>
          </h2>
          <p className={`text-xs leading-relaxed font-sans ${isBright ? 'text-slate-600' : 'text-slate-300'}`}>
            In compliance with Section 29, user-submitted code is first verified through JavaParser AST validation.
            The backend rejects filesystem operations, reflection, network requests, and dangerous system calls,
            executing only controlled AST program models within an isolated simulation sandbox.
          </p>
        </div>

        {/* Exhibition Info */}
        <div className={`border rounded-2xl p-6 flex items-center justify-between transition-colors ${
          isBright
            ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-slate-800'
            : 'bg-gradient-to-r from-cyan-950/40 to-slate-900/60 border-cyan-800/40 text-white'
        }`}>
          <div className="space-y-1">
            <h3 className={`text-sm font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>
              Student Technology Exhibition Build
            </h3>
            <p className={`text-xs font-sans ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Designed for high-impact live student demonstrations, interactive code walkthroughs, and Big-O complexity explanations.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-cyan-500 text-slate-950 px-3 py-1.5 rounded-lg shrink-0">
            v1.0 Release
          </span>
        </div>
      </div>
    </div>
  );
}

