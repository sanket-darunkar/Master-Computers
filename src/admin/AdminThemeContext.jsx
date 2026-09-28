/**
 * AdminThemeContext
 * ─────────────────
 * Provides dark/light mode for the admin panel only.
 * Applies the class "admin-dark" to <body> so it doesn't
 * affect the public website (which uses different CSS layers).
 *
 * Theme is persisted in localStorage under 'mca_admin_theme'.
 * Default: 'light'
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'mca_admin_theme';
const DARK_CLASS  = 'admin-dark';

const ThemeContext = createContext(null);

export function AdminThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'light'; }
    catch { return 'light'; }
  });

  // Apply / remove the class on <body> whenever theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add(DARK_CLASS);
    } else {
      document.body.classList.remove(DARK_CLASS);
    }
    try { localStorage.setItem(STORAGE_KEY, theme); }
    catch { /* storage unavailable */ }
    return () => document.body.classList.remove(DARK_CLASS);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used inside <AdminThemeProvider>');
  return ctx;
}
