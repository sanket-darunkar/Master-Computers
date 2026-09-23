/**
 * StatusBadge — Unified status pill for certificates and students.
 *
 * Certificate statuses: ACTIVE | REVOKED | PENDING
 * Student statuses:     ACTIVE | INACTIVE | COMPLETED | DROPPED
 */
export default function StatusBadge({ status }) {
  const map = {
    // Certificate
    ACTIVE    : { label: 'Active',    bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    REVOKED   : { label: 'Revoked',   bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
    PENDING   : { label: 'Pending',   bg: '#fef9c3', text: '#a16207', border: '#fef08a' },
    // Student
    INACTIVE  : { label: 'Inactive',  bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
    COMPLETED : { label: 'Completed', bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
    DROPPED   : { label: 'Dropped',   bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  };

  const s = map[status];
  if (!s) {
    return (
      <span className="admin-badge" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#e2e8f0' }}>
        {status ?? '—'}
      </span>
    );
  }

  return (
    <span
      className="admin-badge"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  );
}
