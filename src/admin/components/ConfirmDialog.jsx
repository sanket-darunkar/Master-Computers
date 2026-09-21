/**
 * ConfirmDialog
 * ─────────────
 * Modal confirmation dialog. Prevents accidental destructive actions.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={open}
 *     title="Revoke Certificate"
 *     message="Are you sure? This cannot be undone."
 *     confirmLabel="Revoke"
 *     confirmClass="btn-danger"
 *     onConfirm={handleRevoke}
 *     onCancel={() => setOpen(false)}
 *   />
 */
import React, { useEffect, useRef } from 'react';

export default function ConfirmDialog({
  open,
  title       = 'Confirm',
  message     = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  confirmClass = 'bg-red-600 hover:bg-red-700 text-white',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const cancelBtnRef = useRef(null);

  // Focus cancel button when dialog opens (safer default for destructive actions)
  useEffect(() => {
    if (open) cancelBtnRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3
          id="confirm-dialog-title"
          className="text-base font-extrabold text-gray-900 mb-2"
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
                       hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                       disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
