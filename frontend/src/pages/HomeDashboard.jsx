import React from 'react';
import {
  ArrowRight,
  Code2,
  Layers3,
  BrainCircuit,
  Trophy,
  Activity,
  Zap,
  Play,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBright } = useTheme();

  const name =
    user?.name ||
    user?.username ||
    user?.fullName ||
    'Developer';

  const firstName = name.split(' ')[0];

  const workspaceCards = [
    {
      icon: Code2,
      title: 'Code Editor',
      description:
        'Write, execute and visualize your algorithms with step-by-step 3D execution.',
      action: 'Open Editor',
      path: '/editor',
      accent: 'orange',
    },
    {
      icon: Layers3,
      title: 'DSA Hub',
      description:
        'Explore data structures, algorithms, patterns and problems in one place.',
      action: 'Explore DSA',
      path: '/dsa',
      accent: 'cyan',
    },
    {
      icon: BrainCircuit,
      title: 'AI Tutor',
      description:
        'Get intelligent explanations, debugging help and guidance while learning.',
      action: 'Ask AI',
      path: '/ai',
      accent: 'violet',
    },
    {
      icon: Trophy,
      title: 'Quiz Arena',
      description:
        'Challenge yourself with topic-based DSA quizzes and track your progress.',
      action: 'Take Quiz',
      path: '/quiz',
      accent: 'emerald',
    },
  ];

  return (
    <div
      className={`min-h-full flex-1 overflow-y-auto ${
        isBright
          ? 'bg-[#f7f9fc] text-slate-900'
          : 'bg-[#070b14] text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10">

        {/* HEADER */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-7 md:p-10 ${
            isBright
              ? 'bg-white border-slate-200'
              : 'bg-[#0b111d] border-slate-800'
          }`}
        >
          <div
            className={`absolute -top-32 -right-32 h-72 w-72 rounded-full blur-3xl pointer-events-none ${
              isBright
                ? 'bg-cyan-200/40'
                : 'bg-cyan-500/10'
            }`}
          />

          <div
            className={`absolute -bottom-40 left-1/3 h-80 w-80 rounded-full blur-3xl pointer-events-none ${
              isBright
                ? 'bg-violet-200/30'
                : 'bg-violet-500/10'
            }`}
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${
                  isBright
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Activity size={13} />
                CODE3D AI WORKSPACE
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  isBright
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-emerald-950/40 text-emerald-400'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                SYSTEM READY
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Welcome,{' '}
              <span className="bg-gradient-to-r from-orange-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {firstName}
              </span>
              <span className="ml-2">👋</span>
            </h1>

            <p
              className={`mt-4 max-w-2xl text-sm md:text-base leading-7 ${
                isBright
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }`}
            >
              Your coding workspace is ready. Build, visualize and
              understand algorithms with the power of AI and interactive
              3D execution.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/editor')}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 hover:-translate-y-0.5"
              >
                <Play size={16} />
                Start Coding
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate('/dsa')}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                  isBright
                    ? 'bg-white border-slate-300 hover:bg-slate-50'
                    : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Layers3 size={16} />
                Explore DSA
              </button>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            {
              icon: Code2,
              label: 'Code Workspace',
              value: '3D',
            },
            {
              icon: BrainCircuit,
              label: 'AI Powered',
              value: 'ON',
            },
            {
              icon: Layers3,
              label: 'DSA Learning',
              value: '24/7',
            },
            {
              icon: Zap,
              label: 'Execution',
              value: 'LIVE',
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className={`rounded-2xl border p-5 ${
                isBright
                  ? 'bg-white border-slate-200'
                  : 'bg-[#0b111d] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isBright
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  <Icon size={17} />
                </div>

                <span className="text-sm font-bold">
                  {value}
                </span>
              </div>

              <p
                className={`mt-3 text-xs ${
                  isBright
                    ? 'text-slate-500'
                    : 'text-slate-500'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </section>

        {/* WORKSPACE */}
        <section className="mt-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                Your Workspace
              </h2>

              <p
                className={`mt-1 text-sm ${
                  isBright
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                Everything you need to learn, practice and improve.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workspaceCards.map(
              ({
                icon: Icon,
                title,
                description,
                action,
                path,
                accent,
              }) => (
                <button
                  key={title}
                  onClick={() => navigate(path)}
                  className={`group text-left rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 ${
                    isBright
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl'
                      : 'bg-[#0b111d] border-slate-800 hover:border-slate-700 hover:bg-[#0d1421]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        accent === 'orange'
                          ? 'bg-orange-500/10 text-orange-500'
                          : accent === 'cyan'
                          ? 'bg-cyan-500/10 text-cyan-500'
                          : accent === 'violet'
                          ? 'bg-violet-500/10 text-violet-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        isBright
                          ? 'bg-slate-100 group-hover:bg-slate-200'
                          : 'bg-slate-900 group-hover:bg-slate-800'
                      }`}
                    >
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>

                  <h3 className="mt-6 text-lg font-bold">
                    {title}
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${
                      isBright
                        ? 'text-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {description}
                  </p>

                  <div
                    className={`mt-5 text-xs font-bold ${
                      accent === 'orange'
                        ? 'text-orange-500'
                        : accent === 'cyan'
                        ? 'text-cyan-500'
                        : accent === 'violet'
                        ? 'text-violet-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {action} →
                  </div>
                </button>
              )
            )}
          </div>
        </section>

        {/* AI BANNER */}
        <section
          className={`relative overflow-hidden mt-8 rounded-2xl border p-6 md:p-7 ${
            isBright
              ? 'bg-gradient-to-r from-violet-50 via-white to-cyan-50 border-slate-200'
              : 'bg-gradient-to-r from-violet-950/20 via-[#0b111d] to-cyan-950/20 border-slate-800'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isBright
                    ? 'bg-violet-100 text-violet-600'
                    : 'bg-violet-950/50 text-violet-400'
                }`}
              >
                <Sparkles size={20} />
              </div>

              <div>
                <h3 className="font-bold">
                  Need help with your code?
                </h3>

                <p
                  className={`mt-1 text-sm ${
                    isBright
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  Ask Code3D AI to explain, debug or improve your
                  solution.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/ai')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5"
            >
              Open AI Tutor
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <div
          className={`pt-3 pb-6 text-center text-xs ${
            isBright
              ? 'text-slate-400'
              : 'text-slate-600'
          }`}
        >
          Code3D AI · Learn. Code. Visualize.
        </div>
      </div>
    </div>
  );
}