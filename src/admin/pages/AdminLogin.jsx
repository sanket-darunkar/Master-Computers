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

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const next   = params.get('next') || '/admin/dashboard';
      adminNavigate(next);
    }
  }, [isAuthenticated]);

  // Focus email on mount
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">

        {/* Header strip */}
        <div className="bg-hero-gradient px-6 py-7 text-center">
          <img
            src="/images/master-computer-academy-logo.svg"
            alt="Master Computer Academy"
            className="h-12 mx-auto mb-3 bg-white rounded-xl px-3 py-1.5"
          />
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest">
            Admin Panel
          </p>
          <p className="text-white font-bold text-lg mt-1">Sign In</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-semibold"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@mastercomputer.local"
              autoComplete="username"
              disabled={isLoggingIn}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                         disabled:opacity-60 transition-all"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoggingIn}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                           disabled:opacity-60 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                           text-xs font-semibold"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !email.trim() || !password.trim()}
            className="w-full btn-primary btn-md mt-2 disabled:opacity-60"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

        </form>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Master Computer Academy · Admin Portal
      </p>
    </div>
  );
}
