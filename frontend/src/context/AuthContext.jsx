import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/auth.js';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Validate server-side session via HttpOnly cookie on mount
  useEffect(() => {
  setLoading(false);
}, []);

  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      if (res && res.success) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      if (res && res.success) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res?.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {}
    setUser(null);
  };

  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoginModalOpen,
        authModalMode,
        setAuthModalMode,
        openLoginModal: (mode = 'login') => {
          setAuthModalMode(mode);
          setIsLoginModalOpen(true);
        },
        openRegisterModal: () => {
          setAuthModalMode('register');
          setIsLoginModalOpen(true);
        },
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
