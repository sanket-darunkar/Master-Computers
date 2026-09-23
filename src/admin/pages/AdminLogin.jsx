import React, { useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { adminNavigate } from '../AdminApp';

export default function AdminLogin() {
  const { login, isLoggingIn, isAuthenticated } = useAdminAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      adminNavigate(params.get('next') || '/admin/dashboard');
    }
  }, [isAuthenticated]);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    try {
      await login(email.trim(), password);
      const params = new URLSearchParams(window.location.search);
      adminNavigate(params.get('next') || '/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">

        {/* Hero strip */}
        <div className="admin-login-hero">
          <img
            src="/images/master-computer-academy-logo.svg"
            alt="Master Computer Academy"
            className="admin-login-logo"
          />
          <h1 className="admin-login-title">Master Computer Academy</h1>
          <p className="admin-login-sub">Admin Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="admin-login-form">

          <div className="text-center mb-1">
            <p className="font-semibold text-slate-800" style={{ fontSize: 16 }}>Sign in to your account</p>
            <p className="text-slate-400 mt-1" style={{ fontSize: 13 }}>Enter your admin credentials below</p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13.5 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="admin-field-label">Email address</label>
            <input
              ref={emailRef}
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@mastercomputer.local"
              autoComplete="username"
              disabled={isLoggingIn}
              className="admin-input"
              style={isLoggingIn ? { opacity: 0.6 } : {}}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="admin-field-label">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoggingIn}
                className="admin-input"
                style={{ paddingRight: 52, ...(isLoggingIn ? { opacity: 0.6 } : {}) }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors font-medium"
                style={{ fontSize: 12 }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !email.trim() || !password.trim()}
            className="admin-btn-primary w-full justify-center mt-2"
          >
            {isLoggingIn ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        <p className="text-center text-slate-400 pb-6" style={{ fontSize: 12 }}>
          Master Computer Academy · Wathoda Layout, Nagpur
        </p>
      </div>
    </div>
  );
}
