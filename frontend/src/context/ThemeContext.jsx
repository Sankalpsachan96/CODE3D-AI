import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('code3d_theme');
      if (saved === 'bright' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const isBright = theme === 'bright';

  useEffect(() => {
    try {
      localStorage.setItem('code3d_theme', theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }

    const root = document.documentElement;
    if (theme === 'bright') {
      root.classList.remove('dark');
      root.classList.add('bright');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    } else {
      root.classList.remove('bright');
      root.classList.add('dark');
      document.body.style.backgroundColor = '#070b14';
      document.body.style.color = '#f8fafc';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isBright, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'dark',
      setTheme: () => {},
      isBright: false,
      toggleTheme: () => {},
    };
  }
  return context;
}
