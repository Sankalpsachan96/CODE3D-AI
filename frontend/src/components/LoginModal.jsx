import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Key,
  Mail,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, register, authModalMode } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(authModalMode === 'register');

  React.useEffect(() => {
    setIsRegister(authModalMode === 'register');
  }, [authModalMode]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student Developer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register({ username, email, password, fullName, role });

        if (res.success) {
          closeLoginModal();
          navigate('/app');
        } else {
          setError(res.message);
        }
      } else {
        const res = await login({
          usernameOrEmail: username || email,
          password,
        });

        if (res.success) {
          closeLoginModal();
          navigate('/app');
        } else {
          setError(res.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 ${
          isBright
            ? 'bg-white border-slate-300 text-slate-900 shadow-slate-300'
            : 'bg-[#090d16] border-cyan-500/30 text-white shadow-cyan-950/60'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between transition-colors ${
            isBright
              ? 'bg-gradient-to-r from-slate-50 via-cyan-50/40 to-blue-50/40 border-slate-200'
              : 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isBright
                  ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}
            >
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3
                className={`text-base font-bold tracking-wide ${
                  isBright ? 'text-slate-900' : 'text-white'
                }`}
              >
                {isRegister ? 'Create CODE3D Account' : 'Welcome to CODE3D AI'}
              </h3>

              <p
                className={`text-xs ${
                  isBright ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {isRegister
                  ? 'Join the next-gen 3D code execution platform'
                  : 'Sign in to access your saved execution history'}
              </p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isBright
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div
              className={`p-2.5 rounded-lg text-xs border ${
                isBright
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-red-950/60 border-red-800/60 text-red-400'
              }`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label
                    className={`block text-[11px] font-medium mb-1 ${
                      isBright ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <User
                      size={13}
                      className={`absolute left-3 top-3 ${
                        isBright ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    />

                    <input
                      type="text"
                      placeholder="e.g. Himanshu Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                        isBright
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                          : 'bg-[#050811] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-medium mb-1 ${
                      isBright ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    Exhibition Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-cyan-600'
                        : 'bg-[#050811] border-slate-800 text-cyan-300 focus:border-cyan-500'
                    }`}
                  >
                    <option value="Student Developer">Student Developer</option>
                    <option value="Exhibition Evaluator">
                      Exhibition Evaluator / Judge
                    </option>
                    <option value="Lead Architect">Lead Architect</option>
                    <option value="Guest Explorer">Guest Explorer</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label
                className={`block text-[11px] font-medium mb-1 ${
                  isBright ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Username
              </label>

              <div className="relative">
                <UserCheck
                  size={13}
                  className={`absolute left-3 top-3 ${
                    isBright ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />

                <input
                  type="text"
                  required
                  placeholder="e.g. himanshu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                      : 'bg-[#050811] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500'
                  }`}
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label
                  className={`block text-[11px] font-medium mb-1 ${
                    isBright ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={13}
                    className={`absolute left-3 top-3 ${
                      isBright ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  />

                  <input
                    type="email"
                    required
                    placeholder="e.g. himanshu@code3d.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                        : 'bg-[#050811] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                className={`block text-[11px] font-medium mb-1 ${
                  isBright ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                Password
              </label>

              <div className="relative">
                <Key
                  size={13}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    isBright ? 'text-slate-400' : 'text-slate-500'
                  }`}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-xl pl-8 pr-11 py-2 text-xs focus:outline-none transition-colors ${
                    isBright
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
                      : 'bg-[#050811] border-slate-800 text-white placeholder-slate-600 focus:border-cyan-500'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                    isBright
                      ? 'text-slate-400 hover:text-cyan-600 hover:bg-cyan-50'
                      : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10'
                  }`}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition shadow-lg cursor-pointer disabled:opacity-50 mt-2 ${
                isBright
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              {isRegister ? <UserPlus size={14} /> : <LogIn size={14} />}
              <span>
                {loading
                  ? 'Authenticating...'
                  : isRegister
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Switch between Login and Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className={`text-xs transition cursor-pointer ${
                isBright
                  ? 'text-cyan-700 hover:text-cyan-900 font-semibold'
                  : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              {isRegister
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Section 9: Named Exports for SignInModal and SignUpModal
export function SignInModal() {
  return <LoginModal />;
}

export function SignUpModal() {
  return <LoginModal />;
}