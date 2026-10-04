import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Box,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail || !password) {
      setError('Please enter your email or username and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login({ usernameOrEmail, password });
    setIsSubmitting(false);

    if (res.success) {
      navigate('/app');
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 transition-colors ${
        isBright
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#070b14] text-slate-100'
      }`}
    >
      <div
        className={`w-full max-w-md p-8 rounded-2xl border shadow-2xl relative overflow-hidden ${
          isBright
            ? 'bg-white border-slate-200 shadow-slate-200'
            : 'bg-slate-900/90 border-slate-800 shadow-cyan-950/20'
        }`}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/30 mb-2">
            <Box size={24} className="stroke-[2.5]" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome Back
          </h1>

          <p
            className={`text-xs ${
              isBright ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Log in to access your saved 3D visualizations, cloud progress, and
            execution history.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isBright ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Username or Email
            </label>

            <div className="relative">
              <User
                size={16}
                className={`absolute left-3 top-3 ${
                  isBright ? 'text-slate-400' : 'text-slate-500'
                }`}
              />

              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="developer@example.com"
                className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isBright ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isBright ? 'text-slate-400' : 'text-slate-500'
                }`}
              />

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-11 py-2.5 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
                required
              />

              {/* Show / Hide Password */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                  isBright
                    ? 'text-slate-400 hover:text-cyan-600 hover:bg-cyan-50'
                    : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition duration-150 shadow-md cursor-pointer ${
              isSubmitting
                ? 'opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
            }`}
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          <p
            className={`text-xs ${
              isBright ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-cyan-400 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}