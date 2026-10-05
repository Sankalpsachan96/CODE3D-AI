import React, { useState, useEffect } from 'react';

import { History, CheckCircle, Award, Code2, Database, Clock, RefreshCw, Trash2, Play, Zap } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

import { getExecutionHistory, clearExecutionHistory } from '../services/apiService';

const formatISTDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};



export default function HistoryPage({ onRerunProgram }) {

  const { isBright } = useTheme();

  const [historyData, setHistoryData] = useState(null);

  const [loading, setLoading] = useState(true);



  const loadHistory = async () => {

    setLoading(true);

    try {

      const data = await getExecutionHistory();

      setHistoryData(data);

    } finally {

      setLoading(false);

    }

  };



  const handleClear = async () => {

    if (window.confirm('Are you sure you want to clear all execution and quiz history?')) {

      clearExecutionHistory();

      loadHistory();

    }

  };



  useEffect(() => {

    loadHistory();

  }, []);



  return (

    <div className={`flex-1 overflow-y-auto p-6 md:p-10 select-none transition-colors duration-200 ${

      isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'

    }`}>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium mb-2 border ${

              isBright

                ? 'bg-cyan-50 border-cyan-300 text-cyan-800'

                : 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400'

            }`}>

              <Database size={13} />

              <span>{historyData?.isBackendConnected ? 'Synced History' : 'Local History'}</span>

            </div>

            <h1 className={`text-3xl font-extrabold ${isBright ? 'text-slate-900' : 'text-white'}`}>

              Execution History &amp; Logs

            </h1>

            <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>

              Audit trail of program simulations, statement traces, and quiz assessment results.

            </p>

          </div>



          <div className="flex items-center gap-2">

            <button

              onClick={handleClear}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${

                isBright

                  ? 'bg-white border-rose-300 text-rose-700 hover:bg-rose-50'

                  : 'bg-slate-900 border-rose-900/40 text-rose-400 hover:bg-rose-950/40'

              }`}

              title="Clear all recorded history"

            >

              <Trash2 size={13} />

              <span>Clear History</span>

            </button>



            <button

              onClick={loadHistory}

              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${

                isBright

                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm'

                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'

              }`}

            >

              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />

              <span>Refresh</span>

            </button>

          </div>

        </div>



        {/* Stats Row */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className={`border rounded-xl p-4 transition-colors ${

            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'

          }`}>

            <span className={`text-xs uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>

              Total Executions

            </span>

            <div className={`text-2xl font-bold font-mono mt-1 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>

              {historyData?.totalExecutionsCount ?? 0}

            </div>

            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Database recorded</span>

          </div>



          <div className={`border rounded-xl p-4 transition-colors ${

            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'

          }`}>

            <span className={`text-xs uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>

              Quizzes Completed

            </span>

            <div className={`text-2xl font-bold font-mono mt-1 ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>

              {historyData?.totalQuizzesTaken ?? 0}

            </div>

            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Assessment logs</span>

          </div>



          <div className={`border rounded-xl p-4 transition-colors ${

            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'

          }`}>

            <span className={`text-xs uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>

              Database Mode

            </span>

            <div className={`text-lg font-bold font-mono mt-1 ${isBright ? 'text-slate-900' : 'text-white'}`}>

              PostgreSQL / Neon

            </div>

            <span className={`text-[10px] font-medium ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>{historyData?.isBackendConnected ? 'Server synced' : 'Browser fallback active'}</span>

          </div>



          <div className={`border rounded-xl p-4 transition-colors ${

            isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'

          }`}>

            <span className={`text-xs uppercase font-medium ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>

              AST Engine

            </span>

            <div className={`text-lg font-bold font-mono mt-1 ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>

              Node Execution + Trace Engine

            </div>

            <span className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Execution trace ready</span>

          </div>

        </div>



        {/* Executions Table */}

        <div className={`border rounded-2xl p-6 space-y-4 shadow-xl transition-colors ${

          isBright ? 'bg-white border-slate-200 shadow-slate-200' : 'bg-slate-900/50 border-slate-800/90'

        }`}>

          <div className="flex items-center gap-2 text-sm font-bold">

            <Clock size={16} className={isBright ? 'text-cyan-600' : 'text-cyan-400'} />

            <span className={isBright ? 'text-slate-900' : 'text-white'}>Recent Code Executions</span>

          </div>



          <div className="overflow-x-auto">

            <table className={`w-full text-left text-xs font-mono ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>

              <thead className={`text-[11px] uppercase tracking-wider border-b ${

                isBright

                  ? 'bg-slate-100/90 text-slate-600 border-slate-200'

                  : 'bg-slate-950/70 text-slate-400 border-slate-800'

              }`}>

                <tr>

                  <th className="py-2.5 px-3">Run ID</th>

                  <th className="py-2.5 px-3">Program / Concept</th>

                  <th className="py-2.5 px-3">Language</th>

                  <th className="py-2.5 px-3">Steps</th>

                  <th className="py-2.5 px-3">Status</th>

                  <th className="py-2.5 px-3">Timestamp</th>

                  <th className="py-2.5 px-3 text-right">Action</th>

                </tr>

              </thead>

              <tbody className={`divide-y ${isBright ? 'divide-slate-200' : 'divide-slate-800/60'}`}>

                {historyData?.recentExecutions?.map((rec, idx) => (

                  <tr key={idx} className={`transition ${isBright ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>

                    <td className={`py-2.5 px-3 font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-400'}`}>#{String(rec.id).slice(-6)}</td>

                    <td className={`py-2.5 px-3 font-sans font-medium ${isBright ? 'text-slate-900' : 'text-white'}`}>

                      {rec.programTitle}

                    </td>

                    <td className="py-2.5 px-3">

                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${

                        isBright ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-cyan-300'

                      }`}>

                        {rec.language || 'java'}

                      </span>

                    </td>

                    <td className="py-2.5 px-3">{rec.totalSteps} steps</td>

                    <td className="py-2.5 px-3">

                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${

                        rec.status === 'COMPLETED'

                          ? isBright ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'

                          : isBright ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-950/60 border-amber-800/60 text-amber-400'

                      }`}>

                        {rec.status}

                      </span>

                    </td>

                    <td className={`py-2.5 px-3 text-[11px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>{formatISTDateTime(rec.executedAt)}</td>

                    <td className="py-2.5 px-3 text-right">

                      {onRerunProgram && (

                        <button

                          onClick={() => onRerunProgram(rec)}

                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ml-auto transition cursor-pointer ${

                            isBright

                              ? 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border border-cyan-300'

                              : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'

                          }`}

                          title="Load code and re-simulate in 3D Studio"

                        >

                          <Zap size={11} className="fill-current" />

                          <span>Re-run 3D</span>

                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>



        {/* Quiz Results Table */}

        <div className={`border rounded-2xl p-6 space-y-4 shadow-xl transition-colors ${

          isBright ? 'bg-white border-slate-200 shadow-slate-200' : 'bg-slate-900/50 border-slate-800/90'

        }`}>

          <div className="flex items-center gap-2 text-sm font-bold">

            <Award size={16} className={isBright ? 'text-emerald-600' : 'text-emerald-400'} />

            <span className={isBright ? 'text-slate-900' : 'text-white'}>Quiz Assessment History</span>

          </div>



          <div className="overflow-x-auto">

            <table className={`w-full text-left text-xs font-mono ${isBright ? 'text-slate-700' : 'text-slate-300'}`}>

              <thead className={`text-[11px] uppercase tracking-wider border-b ${

                isBright

                  ? 'bg-slate-100/90 text-slate-600 border-slate-200'

                  : 'bg-slate-950/70 text-slate-400 border-slate-800'

              }`}>

                <tr>

                  <th className="py-2.5 px-3">Attempt ID</th>

                  <th className="py-2.5 px-3">Topic / Concept</th>

                  <th className="py-2.5 px-3">Score</th>

                  <th className="py-2.5 px-3">Accuracy</th>

                  <th className="py-2.5 px-3">Date</th>

                </tr>

              </thead>

              <tbody className={`divide-y ${isBright ? 'divide-slate-200' : 'divide-slate-800/60'}`}>

                {historyData?.recentQuizzes?.map((q, idx) => (

                  <tr key={idx} className={`transition ${isBright ? 'hover:bg-slate-50' : 'hover:bg-slate-800/30'}`}>

                    <td className={`py-2.5 px-3 font-bold ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>#{q.id}</td>

                    <td className={`py-2.5 px-3 font-sans font-medium uppercase ${isBright ? 'text-slate-900' : 'text-white'}`}>{q.conceptId}</td>

                    <td className="py-2.5 px-3">{q.score} / {q.totalQuestions}</td>

                    <td className="py-2.5 px-3">

                      <div className="flex items-center gap-2">

                        <div className={`w-16 h-1.5 rounded-full overflow-hidden ${isBright ? 'bg-slate-200' : 'bg-slate-800'}`}>

                          <div

                            className={`h-full rounded-full ${isBright ? 'bg-cyan-600' : 'bg-cyan-400'}`}

                            style={{ width: `${q.accuracy}%` }}

                          />

                        </div>

                        <span>{q.accuracy}%</span>

                      </div>

                    </td>

                    <td className={`py-2.5 px-3 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>{formatISTDateTime(q.completedAt)}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}
