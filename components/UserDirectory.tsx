import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Employee } from '../lib/types';
import dirStyles from '../styles/directory.module.css';

/* ─── column definition ──────────────────────────── */
interface ColDef {
  key: string;
  label: string;
  editable: boolean;
  width?: string;
}

const COLUMNS: ColDef[] = [
  { key: 'displayName', label: 'Name', editable: true },
  { key: 'mail', label: 'E-Mail', editable: false },
  { key: 'jobTitle', label: 'Position', editable: true },
  { key: 'department', label: 'Abteilung', editable: true },
  { key: 'companyName', label: 'Firma', editable: true },
  { key: 'phone', label: 'Telefon', editable: true },
  { key: 'officeLocation', label: 'Standort', editable: true },
  { key: 'city', label: 'Stadt', editable: true },
  { key: 'customAttribute2', label: 'CustomAttribute2', editable: true },
];

/* filterable columns (auto-populate from data) */
const FILTER_KEYS = ['department', 'companyName', 'officeLocation', 'jobTitle', 'city'] as const;

const FILTER_LABELS: Record<string, string> = {
  department: 'Abteilung',
  companyName: 'Firma',
  officeLocation: 'Standort',
  jobTitle: 'Position',
  city: 'Stadt',
};

/* ─── helpers ─────────────────────────────────────── */
function getCellValue(user: Employee, key: string): string {
  if (key === 'phone') return user.businessPhones?.[0] || user.mobilePhone || '';
  if (key === 'customAttribute2') return user.onPremisesExtensionAttributes?.extensionAttribute2 || '';
  return (user as any)[key] || '';
}

/* ─── props ───────────────────────────────────────── */
interface UserDirectoryProps {
  onEmployeeSelected: (employee: Employee) => void;
  refreshKey?: number; // increment to force re-fetch
}

/* ═══════════════════════════════════════════════════ */
export default function UserDirectory({ onEmployeeSelected, refreshKey }: UserDirectoryProps) {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});

  /* inline edit state */
  const [editCell, setEditCell] = useState<{ userId: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── fetch users ─────────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/graph/list-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Fehler');
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Laden fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, []);

  /* initial load */
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* refresh when refreshKey changes */
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  /* ── progressive photo loading ──────────────────── */
  useEffect(() => {
    if (users.length === 0) return;

    let cancelled = false;
    const BATCH = 5;

    async function loadPhotos() {
      for (let i = 0; i < users.length; i += BATCH) {
        if (cancelled) break;
        const batch = users.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map(async (u) => {
            try {
              const res = await fetch(`/api/graph/user-photo?id=${u.id}`);
              if (!res.ok) return { id: u.id, url: '' };
              const data = await res.json();
              return { id: u.id, url: data.photoUrl || '' };
            } catch {
              return { id: u.id, url: '' };
            }
          })
        );
        if (cancelled) break;
        setPhotos((prev) => {
          const next = { ...prev };
          for (const r of results) {
            if (r.status === 'fulfilled' && r.value.url) {
              next[r.value.id] = r.value.url;
            }
          }
          return next;
        });
      }
    }

    loadPhotos();
    return () => { cancelled = true; };
  }, [users]);

  /* ── filter options (unique values from data) ───── */
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    for (const fk of FILTER_KEYS) {
      const set = new Set<string>();
      for (const u of users) {
        const v = (u as any)[fk];
        if (v) set.add(v);
      }
      opts[fk] = Array.from(set).sort((a, b) => a.localeCompare(b, 'de'));
    }
    return opts;
  }, [users]);

  /* ── apply search + filters ─────────────────────── */
  const filtered = useMemo(() => {
    let result = users;

    // text search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.mail?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q) ||
        u.jobTitle?.toLowerCase().includes(q) ||
        u.companyName?.toLowerCase().includes(q) ||
        u.officeLocation?.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.userPrincipalName?.toLowerCase().includes(q) ||
        u.givenName?.toLowerCase().includes(q) ||
        u.surname?.toLowerCase().includes(q)
      );
    }

    // dropdown filters
    for (const [key, val] of Object.entries(filters)) {
      if (val) {
        result = result.filter((u) => (u as any)[key] === val);
      }
    }

    return result;
  }, [users, search, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  /* ── inline edit handlers ───────────────────────── */
  const startEdit = (userId: string, key: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setEditCell({ userId, key });
    setEditValue(getCellValue(user, key));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEdit = () => {
    setEditCell(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editCell) return;
    const { userId, key } = editCell;
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const oldValue = getCellValue(user, key);
    if (editValue === oldValue) { cancelEdit(); return; }

    setSaving(true);
    try {
      // build the update payload
      let updates: Record<string, any> = {};
      if (key === 'phone') {
        updates = { businessPhones: [editValue] };
      } else if (key === 'customAttribute2') {
        updates = {
          onPremisesExtensionAttributes: {
            extensionAttribute2: editValue || null,
          },
        };
      } else {
        updates = { [key]: editValue };
      }

      const res = await fetch('/api/graph/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.details || errData.error || 'Fehler beim Speichern');
      }

      // update local state in-place
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (key === 'phone') return { ...u, businessPhones: [editValue] };
          if (key === 'customAttribute2') {
            return {
              ...u,
              onPremisesExtensionAttributes: {
                ...u.onPremisesExtensionAttributes,
                extensionAttribute2: editValue || null,
              },
            };
          }
          return { ...u, [key]: editValue };
        })
      );

      cancelEdit();
    } catch (err: any) {
      alert(err.message || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  /* ── clear all filters ──────────────────────────── */
  const clearFilters = () => {
    setSearch('');
    setFilters({});
  };

  /* ── render ──────────────────────────────────────── */
  return (
    <div className={dirStyles.directorySection}>
      {/* toolbar */}
      <div className={dirStyles.toolbar}>
        <div className={dirStyles.searchBox}>
          <span className={dirStyles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Suchen (Name, E-Mail, Abteilung …)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={dirStyles.searchInput}
            autoComplete="off"
          />
        </div>

        <div className={dirStyles.filterRow}>
          {FILTER_KEYS.map((fk) => (
            <select
              key={fk}
              value={filters[fk] || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, [fk]: e.target.value }))}
              className={dirStyles.filterSelect}
            >
              <option value="">{FILTER_LABELS[fk]}</option>
              {filterOptions[fk]?.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          ))}

          {activeFilterCount > 0 && (
            <button className={dirStyles.clearBtn} onClick={clearFilters} title="Alle Filter löschen">
              ✕ Filter ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className={dirStyles.loadingBar}>Mitarbeiterdaten werden geladen…</div>
      )}
      {error && <div className={dirStyles.errorBar}>{error}</div>}

      {!loading && users.length > 0 && (
        <>
          <div className={dirStyles.tableWrapper}>
            <table className={dirStyles.table}>
              <thead>
                <tr>
                  <th style={{ width: '36px' }}></th>
                  {COLUMNS.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={dirStyles.row}>
                    {/* avatar */}
                    <td>
                      <div
                        className={dirStyles.miniAvatar}
                        onClick={() => onEmployeeSelected(user)}
                        title="Profil öffnen"
                      >
                        {photos[user.id] ? (
                          <img src={photos[user.id]} alt="" />
                        ) : (
                          user.displayName?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                    </td>

                    {/* data cells */}
                    {COLUMNS.map((col) => {
                      const isEditing = editCell?.userId === user.id && editCell?.key === col.key;
                      const value = getCellValue(user, col.key);

                      if (isEditing) {
                        return (
                          <td key={col.key} className={dirStyles.editingCell}>
                            <input
                              ref={inputRef}
                              className={dirStyles.cellInput}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              disabled={saving}
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className={col.editable ? dirStyles.editableCell : undefined}
                          onClick={() => col.editable ? startEdit(user.id, col.key) : undefined}
                          title={col.editable ? 'Klicken zum Bearbeiten' : undefined}
                        >
                          {value || <span className={dirStyles.empty}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className={dirStyles.noResults}>
                      Keine Mitarbeiter gefunden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={dirStyles.rowCount}>
            {filtered.length} von {users.length} Mitarbeitern
          </div>
        </>
      )}
    </div>
  );
}
