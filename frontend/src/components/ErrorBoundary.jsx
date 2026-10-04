import React from 'react';
import { AlertTriangle, RefreshCw, Home, Sparkles } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CODE3D AI Caught Rendering Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('code3d_user');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#070b14] text-slate-100 font-sans select-none">
          {/* Subtle background glow */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[140px] bg-cyan-500/10" />
            <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] rounded-full blur-[140px] bg-rose-500/10" />
          </div>

          <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-cyan-950/40 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Something unexpected occurred
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The visualizer encountered an issue while rendering. Your code and workspace data remain safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-28 custom-scrollbar">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <RefreshCw size={13} />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700"
              >
                <Home size={13} />
                <span>Reset to Login</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono pt-1">
              CODE3D AI • Spatial AST Execution Platform
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
