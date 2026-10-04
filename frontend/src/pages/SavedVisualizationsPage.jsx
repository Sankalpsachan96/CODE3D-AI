import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedList, deleteSaved } from '../services/saved.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bookmark, Play, Trash2, Calendar, Code2, Plus, Sparkles } from 'lucide-react';

export default function SavedVisualizationsPage({ onReplay }) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSaved = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getSavedList();
      if (res?.success) {
        setSavedItems(res.saved || []);
      }
    } catch (err) {
      setError(err.message || 'Could not fetch saved items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [isAuthenticated]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this saved visualization?')) return;
    try {
      await deleteSaved(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete saved visualization.');
    }
  };

  const handleLaunch = (item) => {
    if (onReplay) {
      onReplay({
        id: item.id,
        title: item.title,
        language: item.language,
        code: item.code,
        category: 'Saved Visualization',
        description: `Saved user simulation for ${item.algorithm}`,
        defaultInput: item.input,
      });
    } else {
      navigate('/visualize');
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 select-none transition-colors ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
              isBright ? 'bg-cyan-50 border-cyan-300 text-cyan-800' : 'bg-cyan-950/60 border-cyan-800 text-cyan-400'
            }`}>
              <Bookmark size={13} />
              <span>Workspace Library</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Saved Visualizations
            </h1>
            <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Access your personal collection of custom code snippets and 3D simulation configurations.
            </p>
          </div>

          <button
            onClick={() => navigate('/visualize')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>New Visualization</span>
          </button>
        </div>

        {/* Not Logged In Notice */}
        {!isAuthenticated && (
          <div className={`p-8 rounded-2xl border text-center space-y-3 ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <Bookmark size={32} className="mx-auto text-cyan-400 opacity-60" />
            <h3 className="text-base font-bold">Sign in to sync your saved visualizations</h3>
            <p className={`text-xs max-w-md mx-auto ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Save your favorite algorithms, dry-run traces, and custom problems to PostgreSQL cloud storage.
            </p>
            <button
              onClick={openLoginModal}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer"
            >
              Sign In to View Saved
            </button>
          </div>
        )}

        {/* Loading & Error States */}
        {isAuthenticated && loading && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading saved visualizations from database...
          </div>
        )}

        {isAuthenticated && error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Empty State */}
        {isAuthenticated && !loading && savedItems.length === 0 && (
          <div className={`p-12 rounded-2xl border text-center space-y-3 ${
            isBright ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <Sparkles size={32} className="mx-auto text-amber-400 opacity-60" />
            <h3 className="text-base font-bold">No saved visualizations yet</h3>
            <p className={`text-xs max-w-md mx-auto ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
              Click "Save Visualization" inside the 3D Studio while visualizing any custom code.
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {isAuthenticated && savedItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition group hover:border-cyan-500/60 ${
                  isBright
                    ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-900/90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {item.language}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1.5 group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className={`text-xs font-mono line-clamp-3 mb-4 p-2 rounded ${
                    isBright ? 'bg-slate-100 text-slate-700' : 'bg-slate-950/80 text-slate-300'
                  }`}>
                    {item.code.slice(0, 120)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => handleLaunch(item)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Launch 3D</span>
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer border border-transparent hover:border-rose-500/30"
                    title="Delete saved item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
