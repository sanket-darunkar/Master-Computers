import React, { useEffect, useRef, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { adminNavigate } from '../AdminApp';

const ADMIN_NAME   = 'Ravi Lande';
const ACADEMY_NAME = 'Master Computer Academy';
const ACADEMY_SUB  = 'Wathoda Layout, Nagpur';

// ── Icons ─────────────────────────────────────────────────────
const IcoMail  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoLock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoEye   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoEyeOff= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IcoSpin  = () => <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IcoAlert = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoShield= () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ── Feature bullets shown on the left panel ────────────────────
const FEATURES = [
  { icon: '🎓', text: 'Manage student admissions & records' },
  { icon: '📋', text: 'Issue & verify certificates' },
  { icon: '💰', text: 'Track fees & pending balances' },
  { icon: '📊', text: 'Dashboard overview at a glance' },
];

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
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>

      {/* ── LEFT — branded panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }} aria-hidden="true" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #e0f2fe, transparent)' }} aria-hidden="true" />

        {/* Logo + Academy name */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center p-2 shadow-lg flex-shrink-0">
              <img
                src="/images/master-computer-academy-logo.svg"
                alt={ACADEMY_NAME}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">{ACADEMY_NAME}</p>
              <p className="text-blue-300 text-sm font-medium">{ACADEMY_SUB}</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-white font-extrabold leading-tight mb-4" style={{ fontSize: 32 }}>
            Welcome back,<br />
            <span style={{ color: '#93c5fd' }}>{ADMIN_NAME}</span>
          </h1>
          <p className="text-blue-200 text-base leading-relaxed mb-10" style={{ maxWidth: 320 }}>
            Sign in to manage students, issue certificates, and track academy progress.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-base">{f.icon}</span>
                </div>
                <p className="text-blue-100 text-sm font-medium">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — version / copyright */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <div className="w-4 h-4 text-blue-400"><IcoShield /></div>
            <span>Secure Admin Portal · Master Computer Academy</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full" style={{ maxWidth: 420 }}>

          {/* Mobile logo (shown only on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-800 flex items-center justify-center p-1.5">
              <img src="/images/master-computer-academy-logo.svg" alt={ACADEMY_NAME}
                className="w-full h-full object-contain bg-white rounded p-0.5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-base leading-tight">{ACADEMY_NAME}</p>
              <p className="text-slate-400 text-xs">Admin Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-extrabold text-slate-900 mb-1" style={{ fontSize: 26 }}>
              Sign in
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>

          {/* Admin identity chip */}
          <div className="flex items-center gap-3 rounded-2xl p-3.5 mb-7"
            style={{ background: '#f0f7ff', border: '1px solid #bfdbfe' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              RL
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">{ADMIN_NAME}</p>
              <p className="text-slate-500 text-xs">Administrator · {ACADEMY_NAME}</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13.5 }}
            >
              <IcoAlert />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="login-email"
                className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <IcoMail />
                </div>
                <input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@mastercomputer.local"
                  autoComplete="username"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl border text-slate-800 placeholder-slate-400 bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                             transition-all disabled:opacity-60"
                  style={{ padding: '11px 14px 11px 40px', fontSize: 14, borderColor: '#cbd5e1' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password"
                className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <IcoLock />
                </div>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl border text-slate-800 placeholder-slate-400 bg-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400
                             transition-all disabled:opacity-60"
                  style={{ padding: '11px 48px 11px 40px', fontSize: 14, borderColor: '#cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400
                             hover:text-slate-600 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <IcoEyeOff /> : <IcoEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn || !email.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl text-white
                         font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         hover:shadow-lg active:scale-[0.99]"
              style={{
                padding: '13px 20px',
                fontSize: 15,
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}
            >
              {isLoggingIn ? (
                <><IcoSpin />Signing in…</>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 mt-8 text-xs">
            © {new Date().getFullYear()} {ACADEMY_NAME} · Wathoda Layout, Nagpur
          </p>
        </div>
      </div>
    </div>
  );
}
