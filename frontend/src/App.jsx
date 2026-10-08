import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import HomeDashboard from './pages/HomeDashboard';
import Visualizer from './pages/Visualizer';
import DsaHub from './pages/DsaHub';
import QuizArena from './pages/QuizArena';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AiTutorPage from './pages/AiTutorPage';
import SheetsPage from './pages/SheetsPage';
import DsaProblemPage from './pages/DsaProblemPage';
import SavedVisualizationsPage from './pages/SavedVisualizationsPage';
import ComingSoonPage from './pages/ComingSoonPage';
import LoginModal from './components/LoginModal';
import CodeDoctorModal from './components/CodeDoctorModal';
import { AppErrorBoundary } from './components/ErrorBoundaries';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function PlatformGate({ children }) {
  const status = String(import.meta.env.VITE_PLATFORM_STATUS || 'LIVE').toUpperCase();
  if (status !== 'LIVE') return <ComingSoonPage />;
  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="route-loading">Loading CODE3D AI…</div>;
if (!isAuthenticated) return <Navigate to="/" replace />;  return children;
}

function MainAppContent() {
  const { user, isAuthenticated } = useAuth();
  const { isBright } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);

  const currentTab =
    location.pathname === '/' || location.pathname === '/app'
      ? 'home'
      : location.pathname.slice(1);

  const handleLaunchConcept = (concept) => { setSelectedConcept(concept); navigate('/visualizer'); };
  const handleApplyDoctorCode = ({ code, language, trace, problemTitle, timeComplexity, spaceComplexity }) => {
    setSelectedConcept({ id: 'personal-problem', title: problemTitle ? `💡 ${problemTitle}` : `Personal Problem (${(language || 'java').toUpperCase()})`, category: 'Personal Problem', description: 'Custom personal problem solved and fully simulated in 3D WebGL.', difficulty: 'Custom', timeComplexity: timeComplexity || 'O(n)', spaceComplexity: spaceComplexity || 'O(1)', code, language: language || 'java', trace: trace || null });
    navigate('/visualizer');
  };
  const handleRerunFromHistory = (record) => {
    setSelectedConcept({ id: record.conceptId || 'history-run', title: record.programTitle, category: 'History Replay', description: `Recorded execution on ${record.executedAt}. Restored into 3D Studio.`, code: record.code || '', language: record.language || 'java' });
    navigate('/visualizer');
  };

  return (
    <div className={`app-shell ${isBright ? 'app-light' : 'app-dark'}`}>
      <Navbar
        activeTab={currentTab}
        setActiveTab={(id) => {
          if (id === 'editor') setSelectedConcept(null);
          navigate(id === 'home' ? (isAuthenticated ? '/app' : '/') : `/${id}`);
        }}
      />

      <main className="app-main">
        <Routes>
<Route
  path="/"
  element={
    user
      ? <Navigate to="/app" replace />
      : <Dashboard />
  }
/>          <Route path="/app" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/visualizer" element={<ProtectedRoute><Visualizer key="dsa-studio" initialConcept={selectedConcept} /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><Visualizer key="universal-editor" universalOnly /></ProtectedRoute>} />
          <Route path="/visualize" element={<ProtectedRoute><Visualizer initialConcept={selectedConcept} /></ProtectedRoute>} />
          <Route path="/dsa" element={<ProtectedRoute><DsaHub initialTab="curriculum" onSelectConcept={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/algorithms" element={<ProtectedRoute><DsaHub initialTab="algorithms" onSelectConcept={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/dsa/:problemSlug" element={<ProtectedRoute><DsaProblemPage onVisualizeProblem={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AiTutorPage onSendToVisualizer={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizArena /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage onRerunProgram={handleRerunFromHistory} /></ProtectedRoute>} />
          <Route path="/saved" element={<ProtectedRoute><SavedVisualizationsPage onReplay={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/sheets" element={<ProtectedRoute><SheetsPage onSelectProblem={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/sheets/:sheetSlug" element={<ProtectedRoute><SheetsPage onSelectProblem={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="/striver" element={<ProtectedRoute><DsaHub initialTab="striver" onSelectConcept={handleLaunchConcept} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <LoginModal />
      <CodeDoctorModal isOpen={isDoctorOpen} onClose={() => setIsDoctorOpen(false)} onApplyCorrectedCode={handleApplyDoctorCode} />
    </div>
  );
}

export default function App() {
  return <AppErrorBoundary><ThemeProvider><AuthProvider><HashRouter><PlatformGate><MainAppContent /></PlatformGate></HashRouter></AuthProvider></ThemeProvider></AppErrorBoundary>;
}