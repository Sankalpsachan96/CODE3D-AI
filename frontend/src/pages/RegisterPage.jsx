import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Box, Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/visualizer');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({ username, email, password });
    setIsSubmitting(false);

    if (res.success) {
      navigate('/visualizer');
    } else {
      setError(res.message || 'Registration failed. Try a different username or email.');
    }
  };

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 transition-colors ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl relative overflow-hidden ${
        isBright
          ? 'bg-white border-slate-200 shadow-slate-200'
          : 'bg-slate-900/90 border-slate-800 shadow-cyan-950/20'
      }`}>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 mb-2">
            <Box size={24} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create an Account</h1>
          <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Join CODE3D-AI to visualize algorithms, solve DSA problems, and track real cloud progress.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              Username
            </label>
            <div className="relative">
              <User size={16} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="algo_master"
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>
              Password
            </label>
            <div className="relative">
              <Lock size={16} className={`absolute left-3 top-3 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer ${
              isSubmitting
                ? 'opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/25'
            }`}
          >
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p className={`text-xs ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
