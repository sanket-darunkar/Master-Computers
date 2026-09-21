/**
 * Toast notification system
 * ──────────────────────────
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Certificate saved!', 'success');
 *   showToast('Something went wrong.', 'error');
 *
 * Wrap your admin app in <ToastProvider>.
 */

import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let _nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++_nextId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    success: 'bg-green-700 border-green-600 text-white',
    error  : 'bg-red-700   border-red-600   text-white',
    info   : 'bg-primary-700 border-primary-600 text-white',
    warning: 'bg-amber-600 border-amber-500 text-white',
  };
  const icons = {
    success: '✓',
    error  : '✕',
    info   : 'ℹ',
    warning: '⚠',
  };
  const cls = styles[toast.type] ?? styles.info;
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold ${cls}`}
      role="alert"
    >
      <span className="flex-shrink-0 font-bold">{icons[toast.type] ?? 'ℹ'}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
