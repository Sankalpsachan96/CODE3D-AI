import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BookOpen, BrainCircuit, Clock3, History, LogIn, LogOut, PlaySquare, Settings, Trophy, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccountMenu({ onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openLoginModal, openRegisterModal } = useAuth();
  const action = (fn) => { onClose?.(); fn(); };
  const go = (path) => action(() => navigate(path));

  if (!isAuthenticated) {
    return (
      <div className="account-menu">
        <div className="account-menu-head"><strong>CODE3D AI</strong><span>Your workspace starts here.</span></div>
        <button onClick={() => action(() => openLoginModal('login'))}><LogIn size={15} /> Sign in</button>
        <button onClick={() => action(() => openRegisterModal())}><UserRound size={15} /> Create account</button>
      </div>
    );
  }

  return (
    <div className="account-menu">
      <div className="account-menu-head">
        <strong>{user?.fullName || user?.username || 'Developer'}</strong>
        <span>{user?.email || 'Signed in'}</span>
      </div>
      <div className="account-menu-label">Workspace</div>
      <button onClick={() => navigate('/editor')}><PlaySquare size={15} /> Code Editor <kbd>⌘1</kbd></button>
      <button onClick={() => go('/dsa')}><BookOpen size={15} /> DSA Hub</button>
      <button onClick={() => go('/ai')}><Bot size={15} /> AI Tutor</button>
      <button onClick={() => go('/quiz')}><Trophy size={15} /> Quiz Arena</button>
      <button onClick={() => go('/dsa-learning')}><BookOpen size={15} /> DSA Learning</button>
      <div className="account-menu-label">Your activity</div>
      <button onClick={() => go('/history')}><History size={15} /> Execution History</button>
      <button onClick={() => go('/saved')}><Clock3 size={15} /> Saved Visualizations</button>
      <button onClick={() => go('/striver')}><BrainCircuit size={15} /> DSA Sheets</button>
      <button onClick={() => go('/settings')}><Settings size={15} /> Profile & Settings</button>
      <div className="account-menu-divider" />
      <button className="danger" onClick={() => action(logout)}><LogOut size={15} /> Sign out</button>
    </div>
  );
}
