/**
 * StatusBadge
 * ───────────
 * Renders a coloured pill for ACTIVE / REVOKED / PENDING.
 * Matches the public-facing statusBadge() helper in CertificateVerification.jsx
 * but as a standalone reusable component.
 */
export default function StatusBadge({ status }) {
  const map = {
    ACTIVE : { label: 'Active',  cls: 'bg-green-100  text-green-800  border-green-200'  },
    REVOKED: { label: 'Revoked', cls: 'bg-red-100    text-red-800    border-red-200'    },
    PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  };
  const s = map[status] ?? { label: status ?? '—', cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
}
