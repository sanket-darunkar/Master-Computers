/**
 * AdminAuthContext
 * ─────────────────
 * Provides authentication state for the entire admin section.
 *
 * - isAuthenticated : boolean
 * - login(email, pw): calls backend, stores token, returns void
 * - logout()        : clears token, redirects to /admin/login
 *
 * Listens for the 'mca:admin:unauthorized' event emitted by
 * adminApi.js on any 401 response so ANY page automatically
 * redirects to login when a JWT expires.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  adminLogin,
  AUTH_TOKEN_KEY,
  clearToken,
  getStoredToken,
  storeToken,
} from '../services/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // Derive initial state synchronously from sessionStorage so there
  // is no flash of unauthenticated content on refresh.
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));
  const [isLoggingIn,     setIsLoggingIn]     = useState(false);
  const [loginError,      setLoginError]      = useState('');

  // ── Handle 401 from any API call ──────────────────────────
  useEffect(() => {
    const onUnauthorized = () => {
      setIsAuthenticated(false);
      // Use window.location so the full app re-evaluates the route
      window.location.href = '/admin/login';
    };
    window.addEventListener('mca:admin:unauthorized', onUnauthorized);
    return () => window.removeEventListener('mca:admin:unauthorized', onUnauthorized);
  }, []);

  // ── Login ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const { token } = await adminLogin(email, password);
      storeToken(token);
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
      throw err; // let the form handle it too
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearToken();
    setIsAuthenticated(false);
    window.location.href = '/admin/login';
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, isLoggingIn, loginError, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
