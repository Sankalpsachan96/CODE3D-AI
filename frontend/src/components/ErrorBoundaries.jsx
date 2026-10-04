/**
 * CODE3D-AI - Granular Error Boundaries
 * 
 * Provides recovery mechanisms for UI components:
 * - AppErrorBoundary
 * - VisualizerErrorBoundary
 * - EditorErrorBoundary
 * - ExecutionErrorBoundary
 */

import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('AppErrorBoundary caught an unhandled error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-6 bg-[#070b14] text-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle size={30} />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-400 mb-4 max-w-md text-center font-mono">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition"
          >
            <RefreshCw size={14} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export class VisualizerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('VisualizerErrorBoundary caught 3D/scene error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white border border-rose-900/40 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-sm font-bold mb-1">Visualizer Render Error</h3>
          <p className="text-xs text-slate-400 mb-3 max-w-sm text-center font-mono">
            {this.state.error?.message || 'Failed to render 3D scene elements.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-400 transition"
          >
            <RotateCcw size={13} />
            <span>Reset Visualizer</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export class EditorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('EditorErrorBoundary caught editor error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white">
          <AlertTriangle size={24} className="text-amber-400 mb-2" />
          <h3 className="text-sm font-bold mb-1">Code Editor Error</h3>
          <p className="text-xs text-slate-400 mb-3 text-center font-mono">
            {this.state.error?.message || 'Monaco editor crashed.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Reload Editor
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
