import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Moon,
  Sun,
  UserRound,
  Code2,
  Layers3,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkBackendHealth } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AccountMenu from './AccountMenu';

export default function Navbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    openLoginModal,
  } = useAuth();

  const {
    isBright,
    toggleTheme,
  } = useTheme();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const accountMenuRef = useRef(null);

  /*
   * ================================
   * NAVIGATION LINKS
   * ================================
   *
   * Home is always visible.
   *
   * Code Editor + DSA Hub are shown
   * ONLY when the user is logged in.
   */
  const navLinks = [
  ...(isAuthenticated
    ? [
        {
          id: 'home',
          path: '/app',
          label: 'Home',
        },
        {
          id: 'editor',
          path: '/editor',
          label: 'Code Editor',
          icon: Code2,
        },
        {
          id: 'dsa',
          path: '/dsa',
          label: 'DSA Hub',
          icon: Layers3,
        },
      ]
    : []),
];

  /*
   * ================================
   * BACKEND HEALTH CHECK
   * ================================
   */
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);

    const id = setInterval(() => {
      checkBackendHealth().then(setBackendOnline);
    }, 15000);

    return () => clearInterval(id);
  }, []);

  /*
   * ================================
   * CLOSE ACCOUNT MENU
   * ================================
   */
  useEffect(() => {
    const close = (e) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', close);

    return () => {
      document.removeEventListener('mousedown', close);
    };
  }, []);

  /*
   * ================================
   * NAVIGATION HANDLER
   * ================================
   */
  const go = (path) => {
    /*
     * If user tries to access anything
     * other than Home while logged out,
     * open the login modal.
     */
    if (path !== '/' && !isAuthenticated) {
      openLoginModal('login');
      return;
    }

    navigate(path);

    setActiveTab?.(
      path === '/'
        ? 'home'
        : path.slice(1)
    );

    // Close profile menu after navigation
    setIsAccountMenuOpen(false);
  };

  return (
    <header className="app-navbar">

      {/* =================================
          BRAND
          ================================= */}
      <button
        className="app-brand"
        onClick={() => go('/')}
        aria-label="CODE3D AI Home"
      >
        <span className="app-brand-mark">
          <span />
        </span>

        <span className="app-brand-name">
          CODE<span>3D</span><b>AI</b>
        </span>
      </button>


      {/* =================================
          NAVIGATION
          ================================= */}
      <nav className="app-nav-links">
        {navLinks.map((item) => {
          const active = location.pathname === item.path ||
  (item.path !== '/app' && location.pathname.startsWith(item.path));

          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => go(item.path)}
              className={active ? 'active' : ''}
            >
              {Icon && <Icon size={14} />}

              {item.label}
            </button>
          );
        })}
      </nav>


      {/* =================================
          RIGHT SIDE
          ================================= */}
      <div className="app-nav-right">

        {/* Backend status */}
        <span
          className={`system-status ${
            backendOnline ? 'online' : 'offline'
          }`}
        >
          <i />

          {backendOnline
            ? 'Systems online'
            : 'Local mode'}
        </span>


        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={
            isBright
              ? 'Dark mode'
              : 'Light mode'
          }
          aria-label={
            isBright
              ? 'Switch to dark mode'
              : 'Switch to light mode'
          }
        >
          {isBright ? (
            <Moon size={15} />
          ) : (
            <Sun size={15} />
          )}
        </button>


        {/* =================================
            ACCOUNT
            ================================= */}
        <div
          className="account-anchor"
          ref={accountMenuRef}
        >
          <button
            className="account-trigger"
            onClick={() =>
              setIsAccountMenuOpen((v) => !v)
            }
            aria-expanded={isAccountMenuOpen}
            aria-haspopup="menu"
          >

            {isAuthenticated && user ? (
              <>
                <span className="avatar">
                  <img
                    src={
                      user.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=70'
                    }
                    alt=""
                  />
                </span>

                <span className="account-name">
                  {user.fullName?.split(' ')[0] ||
                    user.username ||
                    'Account'}
                </span>
              </>
            ) : (
              <>
                <UserRound size={15} />

                <span>
                  Sign in
                </span>
              </>
            )}

            <ChevronDown size={13} />
          </button>


          {/* Profile dropdown */}
          {isAccountMenuOpen && (
            <AccountMenu
              onClose={() =>
                setIsAccountMenuOpen(false)
              }
            />
          )}
        </div>

      </div>
    </header>
  );
}