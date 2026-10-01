/**
 * CourseSearchSelect
 * ──────────────────
 * A searchable / type-ahead course selector for the admin panel.
 *
 * Used in:
 *   - StudentForm   (multi-select mode — select multiple courses)
 *   - CertificateForm (single-select mode — one course per cert)
 *
 * Props (multi-select mode, mode="multi"):
 *   options   string[]          — full course list
 *   selected  string[]          — currently selected course names
 *   onChange  (string[]) => void
 *   error     string            — validation error message
 *
 * Props (single-select mode, mode="single"):
 *   options   string[]
 *   value     string            — currently selected course name
 *   onChange  (string) => void
 *   error     string
 *   placeholder string
 *
 * Behaviour:
 *   - Typing filters the list in real-time (case-insensitive substring match)
 *   - Keyboard: ArrowUp/Down navigate, Enter selects highlighted item, Escape closes
 *   - Click outside closes the dropdown
 *   - Selected items shown as dismissible badges (multi) or inline text (single)
 *   - "Other / Custom" option appended at end — lets admin type a free-form name
 */
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';

const CUSTOM_SENTINEL = '__CUSTOM__';

// ── Icons ─────────────────────────────────────────────────────
const IcoChevron = ({ open }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IcoX = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────
function filterOptions(options, query) {
  if (!query.trim()) return options;
  const q = query.toLowerCase();
  return options.filter(o => o.toLowerCase().includes(q));
}

// ── Multi-select ──────────────────────────────────────────────
export function CourseMultiSelect({ options, selected = [], onChange, error }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [active, setActive]   = useState(-1);     // keyboard-highlighted index
  const [customVal, setCustomVal] = useState(''); // free-form value when Custom chosen
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const uid      = useId();

  const fullOptions = [...options, 'Other / Custom'];
  const filtered    = filterOptions(fullOptions, query);

  // ── Keyboard nav ──────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setActive(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive(a => Math.min(a + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive(a => Math.max(a - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (active >= 0 && active < filtered.length) {
          toggleItem(filtered[active]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  const toggleItem = useCallback((course) => {
    if (course === 'Other / Custom') {
      // Don't add the sentinel — just keep the custom input visible
      setCustomVal('');
      return;
    }
    const next = selected.includes(course)
      ? selected.filter(c => c !== course)
      : [...selected, course];
    onChange(next);
  }, [selected, onChange]);

  const removeItem = (course) => onChange(selected.filter(c => c !== course));

  const addCustom = () => {
    const val = customVal.trim();
    if (!val || selected.includes(val)) { setCustomVal(''); return; }
    onChange([...selected, val]);
    setCustomVal('');
  };

  // ── Click outside ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Scroll active item into view ──────────────────────────
  useEffect(() => {
    if (!listRef.current || active < 0) return;
    const el = listRef.current.children[active];
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // ── Focus search when opened ──────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setActive(0);
    }
  }, [open]);

  const listboxId = `${uid}-listbox`;

  return (
    <div ref={wrapRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border
          text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all text-left
          ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'}`}
      >
        <span className={`truncate ${selected.length === 0 ? 'text-gray-400' : 'text-gray-700 font-medium'}`}>
          {selected.length === 0
            ? 'Type to search and select courses…'
            : `${selected.length} course${selected.length > 1 ? 's' : ''} selected`}
        </span>
        <IcoChevron open={open} />
      </button>

      {/* ── Selected badges ── */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(course => (
            <span
              key={course}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg
                         bg-primary-100 text-primary-800 text-xs font-semibold border border-primary-200"
            >
              <span className="max-w-[260px] truncate" title={course}>{course}</span>
              <button
                type="button"
                onClick={() => removeItem(course)}
                className="hover:bg-primary-200 rounded p-0.5 transition-colors flex-shrink-0"
                aria-label={`Remove ${course}`}
              >
                <IcoX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <IcoSearch />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search courses…"
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              aria-label="Search courses"
              aria-autocomplete="list"
              aria-controls={listboxId}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setActive(0); }} className="text-gray-400 hover:text-gray-600">
                <IcoX size={12} />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-gray-400">No courses match "{query}"</li>
            ) : (
              filtered.map((course, idx) => {
                const isSelected = selected.includes(course);
                const isActive   = idx === active;
                const isOther    = course === 'Other / Custom';
                return (
                  <li
                    key={course}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleItem(course)}
                    onMouseEnter={() => setActive(idx)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm select-none
                      ${isActive ? 'bg-primary-50' : ''}
                      ${isSelected ? 'text-primary-800 font-semibold' : isOther ? 'text-gray-500 italic' : 'text-gray-700'}
                      transition-colors duration-75`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 bg-white'}`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="1.5 6 4.5 9 10.5 3" />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1 leading-snug">{course}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* ── Custom / Other free-form input ── */}
      {/* Shown when user clicked "Other / Custom" OR typed something not in list */}
      <div className="mt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="Or type a custom course name and press Add…"
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customVal.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold
                       hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

// ── Single-select ─────────────────────────────────────────────
export function CourseSingleSelect({
  options,
  value = '',
  onChange,
  error,
  placeholder = 'Search and select a course…',
}) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [active, setActive] = useState(-1);
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal]   = useState('');
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const uid      = useId();

  const fullOptions = [...options, 'Other / Custom'];
  const filtered    = filterOptions(fullOptions, query);

  const selectItem = useCallback((course) => {
    if (course === 'Other / Custom') {
      setShowCustom(true);
      setOpen(false);
      setQuery('');
      return;
    }
    onChange(course);
    setOpen(false);
    setQuery('');
    setShowCustom(false);
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
        setActive(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive(a => Math.min(a + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive(a => Math.max(a - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (active >= 0 && active < filtered.length) selectItem(filtered[active]);
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!listRef.current || active < 0) return;
    const el = listRef.current.children[active];
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setActive(0);
    }
  }, [open]);

  const confirmCustom = () => {
    const val = customVal.trim();
    if (!val) return;
    onChange(val);
    setCustomVal('');
    setShowCustom(false);
  };

  const listboxId = `${uid}-listbox`;

  return (
    <div ref={wrapRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border
          text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:bg-white transition-all text-left
          ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'}`}
      >
        <span className={`truncate ${!value ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={e => { e.stopPropagation(); onChange(''); setShowCustom(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
              aria-label="Clear selection"
            >
              <IcoX size={12} />
            </span>
          )}
          <IcoChevron open={open} />
        </span>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2">
            <IcoSearch />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search…"
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              aria-label="Search courses"
              aria-autocomplete="list"
              aria-controls={listboxId}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setActive(0); }} className="text-gray-400 hover:text-gray-600">
                <IcoX size={12} />
              </button>
            )}
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-gray-400">No courses match "{query}"</li>
            ) : (
              filtered.map((course, idx) => {
                const isSel    = course === value;
                const isActive = idx === active;
                const isOther  = course === 'Other / Custom';
                return (
                  <li
                    key={`${course}-${idx}`}
                    role="option"
                    aria-selected={isSel}
                    onClick={() => selectItem(course)}
                    onMouseEnter={() => setActive(idx)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm select-none
                      ${isActive ? 'bg-primary-50' : ''}
                      ${isSel ? 'text-primary-800 font-semibold' : isOther ? 'text-gray-500 italic' : 'text-gray-700'}
                      transition-colors duration-75`}
                  >
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                      ${isSel ? 'border-primary-600' : 'border-gray-300'}`}>
                      {isSel && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </span>
                    <span className="flex-1 leading-snug">{course}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* ── Custom input ── */}
      {showCustom && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmCustom(); } }}
            placeholder="Type custom course name…"
            autoFocus
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={confirmCustom}
            disabled={!customVal.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold
                       hover:bg-primary-700 disabled:opacity-40 transition-colors"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => { setShowCustom(false); setCustomVal(''); }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-1 font-semibold">{error}</p>}
    </div>
  );
}
