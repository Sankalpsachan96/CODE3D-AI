import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Box,
  Cpu,
  Layers,
  CheckCircle2,
  Database,
  Lock,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

export default function AuthGate() {
  const { login, register } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student Developer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!username || !email || !password) {
          setError('Please fill all required fields');
          setLoading(false);
          return;
        }
        const res = await register({ username, email, password, fullName: fullName || username, role });
        if (!res.success) {
          setError(res.message || 'Registration failed');
        }
      } else {
        if (!username || !password) {
          setError('Please enter username/email and password');
          setLoading(false);
          return;
        }
        const res = await login({ username, password });
        if (!res.success) {
          setError(res.message || 'Invalid username or password');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between overflow-x-hidden overflow-y-auto selection:bg-cyan-500/30 bg-[#060911] text-slate-100">
      {/* Subtle Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] ${
          isBright ? 'bg-cyan-200/30' : 'bg-cyan-500/10'
        }`} />
        <div className={`absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full blur-[140px] ${
          isBright ? 'bg-indigo-200/30' : 'bg-indigo-500/10'
        }`} />
      </div>

      {/* Top Header */}
      <header className={`relative z-10 w-full px-4 sm:px-6 py-3.5 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
        isBright
          ? 'bg-white/80 border-slate-200'
          : 'bg-slate-950/70 border-slate-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Box size={18} className="text-white" />
          </div>
          <div>
            <h1 className={`text-xs sm:text-sm font-bold tracking-wider ${isBright ? 'text-slate-900' : 'text-white'}`}>
              CODE3D <span className="text-cyan-500">AI</span>
            </h1>
            <p className={`text-[9px] sm:text-[10px] font-mono ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
              Algorithm &amp; AST 3D Visualizer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isBright
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-300'
            }`}
            title="Toggle Bright/Dark Mode"
          >
            {isBright ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
            isBright
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <Database size={11} className="animate-pulse" />
            <span>Neon DB: Live</span>
          </div>
        </div>
      </header>

      {/* Main Center Content */}
      <div className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-10">
        {/* Left Side: Product Value & Exhibition Info */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isBright
              ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`}>
            <Lock size={12} />
            <span>Authentication Required to Access Visualizer</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
            isBright ? 'text-slate-900' : 'text-white'
          }`}>
            See Algorithms Execute in <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 bg-clip-text text-transparent">3D Spatial Canvas</span>
          </h2>

          <p className={`text-sm max-w-xl leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
            CODE3D AI compiles and steps through <span className={`font-semibold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>Java, Python, C, C++, and JavaScript</span> programs into interactive 3D WebGL scenes with automated error diagnosis and AST memory traces.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
              isBright ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <Box size={16} className="text-cyan-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className={`text-xs font-semibold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>Full DSA Curriculum</p>
                <p className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Arrays, Heaps, Trees, Graphs, AVL, Knapsack</p>
              </div>
            </div>

            <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
              isBright ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <Cpu size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className={`text-xs font-semibold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>Personal Problem Solver</p>
                <p className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Solves any custom problem &amp; 3D visualizes complete code</p>
              </div>
            </div>

            <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
              isBright ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <Layers size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className={`text-xs font-semibold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>5-Language AST</p>
                <p className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Java, Python, C, C++, and ES2024 JavaScript</p>
              </div>
            </div>

            <div className={`flex items-start gap-2.5 p-3 rounded-xl border transition-colors ${
              isBright ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <Database size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className={`text-xs font-semibold ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>Live Cloud Database</p>
                <p className={`text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>AWS Neon PostgreSQL table &amp; runs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className={`w-full max-w-md border rounded-2xl shadow-2xl p-6 sm:p-7 relative transition-colors duration-200 ${
          isBright
            ? 'bg-white border-slate-300 shadow-slate-300 text-slate-900'
            : 'bg-[#090d18] border-cyan-500/30 shadow-cyan-950/40 text-white'
        }`}>
          {/* Form Tabs */}
          <div className={`flex rounded-xl p-1 border mb-5 ${
            isBright ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegister
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegister
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : isBright ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              isBright
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600'
                      : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500'
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`block text-[11px] font-mono mb-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                {isRegister ? 'Username *' : 'Username or Email'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegister ? 'e.g. himanshu' : 'himanshu or student.alex'}
                required
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500'
                }`}
              />
            </div>

            {isRegister && (
              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  required
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600'
                      : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500'
                  }`}
                />
              </div>
            )}

            {isRegister && (
              <div>
                <label className={`block text-[11px] font-mono mb-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Your Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-cyan-600'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500'
                  }`}
                >
                  <option value="Student Developer">Student Developer</option>
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Exhibition Evaluator">Exhibition Evaluator / Judge</option>
                </select>
              </div>
            )}

            <div>
              <label className={`block text-[11px] font-mono mb-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none transition-colors ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-cyan-600'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 mt-2 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isBright
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account & Enter' : 'Sign In to Workspace'}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          <p className={`text-[10px] text-center mt-4 font-mono ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>
            Default test account: <span className={isBright ? 'text-slate-800 font-semibold' : 'text-slate-400'}>himanshu</span> / <span className={isBright ? 'text-slate-800 font-semibold' : 'text-slate-400'}>admin123</span>
          </p>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className={`relative z-10 w-full py-3 px-6 text-center text-[11px] font-mono border-t ${
        isBright ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-600'
      }`}>
        CODE3D AI • Powered by Spring Boot 3.2, Three.js &amp; Neon Cloud PostgreSQL
      </footer>
    </div>
  );
}
