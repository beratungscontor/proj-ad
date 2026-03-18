import React, { useState, useEffect } from 'react';
import { Employee } from '../lib/types';
import styles from '../styles/form.module.css';
import dirStyles from '../styles/directory.module.css';

interface UserDirectoryProps {
  onEmployeeSelected: (employee: Employee) => void;
}

const ATTR_COLUMNS: { key: keyof Employee | 'phone'; label: string }[] = [
  { key: 'displayName', label: 'Name' },
  { key: 'mail', label: 'E-Mail' },
  { key: 'jobTitle', label: 'Position' },
  { key: 'department', label: 'Abteilung' },
  { key: 'phone', label: 'Telefon' },
  { key: 'officeLocation', label: 'Standort' },
  { key: 'companyName', label: 'Firma' },
];

function getCellValue(user: Employee, key: string): string {
  if (key === 'phone') {
    return user.businessPhones?.[0] || user.mobilePhone || '';
  }
  return (user as any)[key] || '';
}

export default function UserDirectory({ onEmployeeSelected }: UserDirectoryProps) {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchUsers = async () => {
    if (users.length > 0) return; // already loaded
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
  };

  useEffect(() => {
    if (expanded && users.length === 0 && !loading) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const filtered = filter
    ? users.filter((u) => {
        const q = filter.toLowerCase();
        return (
          u.displayName?.toLowerCase().includes(q) ||
          u.mail?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.jobTitle?.toLowerCase().includes(q)
        );
      })
    : users;

  return (
    <div className={dirStyles.directorySection}>
      <button
        className={dirStyles.directoryToggle}
        onClick={() => setExpanded((prev) => !prev)}
      >
        📋 Alle internen Mitarbeiter {users.length > 0 && `(${users.length})`} {expanded ? '▲' : '▼'}
      </button>

      {expanded && (
        <div className={dirStyles.directoryContent}>
          {loading && (
            <div className={styles.loading}>Mitarbeiterdaten werden geladen…</div>
          )}
          {error && <div className={styles.error}>{error}</div>}

          {!loading && users.length > 0 && (
            <>
              <div className={styles.searchInputWrapper} style={{ marginBottom: '12px' }}>
                <i className={styles.searchIcon}>🔍</i>
                <input
                  type="text"
                  placeholder="Tabelle filtern…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={styles.searchInput}
                  autoComplete="off"
                />
              </div>

              <div className={dirStyles.tableWrapper}>
                <table className={dirStyles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      {ATTR_COLUMNS.map((col) => (
                        <th key={col.key}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => onEmployeeSelected(user)}
                        className={dirStyles.clickableRow}
                      >
                        <td>
                          <div className={dirStyles.miniAvatar}>
                            {user.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={user.photoUrl} alt="" className={styles.avatarImage} />
                            ) : (
                              user.displayName?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                        </td>
                        {ATTR_COLUMNS.map((col) => (
                          <td key={col.key}>{getCellValue(user, col.key)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={dirStyles.rowCount}>
                {filtered.length} von {users.length} Mitarbeitern
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
