'use client';

import React, { useMemo, useState } from 'react';
import { Employee } from '../lib/types';
import styles from '../styles/form.module.css';

type BulkAttr =
  | 'businessPhones'
  | 'officeLocation'
  | 'department'
  | 'companyName'
  | 'streetAddress'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country';

const BULK_ATTRS: { value: BulkAttr; label: string; placeholder: string }[] = [
  { value: 'businessPhones', label: 'Büro-Telefon', placeholder: 'z. B. +49 30 123456' },
  { value: 'officeLocation', label: 'Büro-Standort', placeholder: 'z. B. Berlin, Gebäude A' },
  { value: 'department', label: 'Abteilung', placeholder: 'z. B. IT' },
  { value: 'companyName', label: 'Firma', placeholder: 'z. B. Muster GmbH' },
  { value: 'streetAddress', label: 'Straße', placeholder: 'z. B. Musterstraße 1' },
  { value: 'city', label: 'Ort', placeholder: 'z. B. Berlin' },
  { value: 'state', label: 'Bundesland', placeholder: 'z. B. Berlin' },
  { value: 'postalCode', label: 'PLZ', placeholder: 'z. B. 10115' },
  { value: 'country', label: 'Land', placeholder: 'z. B. Deutschland' },
];

export default function BulkUpdateSelected() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [attribute, setAttribute] = useState<BulkAttr>('officeLocation');
  const [value, setValue] = useState('');
  const [showReview, setShowReview] = useState(false);

  const attrMeta = useMemo(() => BULK_ATTRS.find((a) => a.value === attribute), [attribute]);

  const isSelected = (id: string) => selected.some((u) => u.id === id);

  const addSelected = (emp: Employee) => {
    if (isSelected(emp.id)) return;
    setSelected((prev) => [...prev, emp]);
  };

  const removeSelected = (id: string) => {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  };

  const clearSelection = () => setSelected([]);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setSuccess(null);
    setError(null);

    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await fetch(`/api/graph/search-users?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.details || data.error || 'Suche fehlgeschlagen.');
        setResults([]);
      } else {
        setResults(data.users || []);
      }
    } catch {
      setError('Netzwerkfehler bei der Suche.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const applyBulk = async () => {
    const trimmed = value.trim();
    if (selected.length === 0) {
      setError('Bitte mindestens einen Mitarbeiter auswählen.');
      return;
    }
    if (!trimmed) {
      setError('Bitte einen Wert eingeben.');
      return;
    }

    setLoadingApply(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/graph/bulk-update-selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selected.map((u) => u.id),
          updates: {
            [attribute]: attribute === 'businessPhones' ? [trimmed] : trimmed,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.details || data.error || 'Massenänderung fehlgeschlagen.');
        return;
      }
      setSuccess(`✓ ${data.updated} von ${data.total} aktualisiert.${data.failed ? ` ${data.failed} fehlgeschlagen.` : ''}`);
      setShowReview(false);
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setLoadingApply(false);
    }
  };

  return (
    <div className={`${styles.searchContainer}`} style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--clr-border)' }}>
      <h2 className={styles.searchLabel}>Massenänderung (Auswahl)</h2>
      <p className={styles.searchHint} style={{ marginTop: '-6px' }}>
        Wählen Sie mehrere Mitarbeiter aus und setzen Sie ein gemeinsames Feld.
      </p>

      <div className={styles.searchInputWrapper}>
        <i className={styles.searchIcon}>🔎</i>
        <input
          type="text"
          placeholder="Mitarbeiter suchen…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className={styles.searchInput}
          autoComplete="off"
        />
      </div>

      {loadingSearch && <div className={styles.loading}>Suchen…</div>}

      {results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map((employee) => (
            <div
              key={employee.id}
              className={styles.resultItem}
              role="button"
              tabIndex={0}
              onClick={() => addSelected(employee)}
              onKeyDown={(e) => e.key === 'Enter' && addSelected(employee)}
              style={{ opacity: isSelected(employee.id) ? 0.55 : 1 }}
            >
              <div className={styles.resultAvatar}>
                {employee.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={employee.photoUrl} alt="Avatar" className={styles.avatarImage} />
                ) : (
                  employee.displayName?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className={styles.resultInfo}>
                <div className={styles.resultName}>{employee.displayName}</div>
                <div className={styles.resultEmail}>{employee.userPrincipalName}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontWeight: 700, opacity: 0.8 }}>
                {isSelected(employee.id) ? '✓' : '+'}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className={styles.searchHint}><strong>Ausgewählt:</strong> {selected.length} (max. 100)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {selected.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => removeSelected(u.id)}
                className={styles.tab}
                style={{ padding: '6px 10px', borderRadius: '999px' }}
                title="Entfernen"
              >
                {u.displayName} ×
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className={styles.cancelButton} onClick={clearSelection}>
              Auswahl leeren
            </button>
          </div>
        </div>
      )}

      <div className={styles.formGroup} style={{ marginTop: '6px' }}>
        <label>Attribut</label>
        <select
          value={attribute}
          onChange={(e) => setAttribute(e.target.value as BulkAttr)}
          className={styles.searchInput}
          style={{ paddingLeft: 'var(--space-md)' }}
          disabled={loadingApply}
        >
          {BULK_ATTRS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Neuer Wert</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={attrMeta?.placeholder}
          className={styles.searchInput}
          disabled={loadingApply}
        />
      </div>

      <button
        type="button"
        className={styles.submitButton}
        onClick={() => setShowReview(true)}
        disabled={loadingApply || selected.length === 0}
        style={{ width: '100%' }}
      >
        Überprüfen & Anwenden
      </button>

      {error && <div className={styles.errorMessage} style={{ marginTop: '8px' }}>✕ {error}</div>}
      {success && <div className={styles.successMessage} style={{ marginTop: '8px' }}>{success}</div>}

      {showReview && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Überprüfen</h2>
            <p style={{ marginTop: 0 }}>
              Sie ändern <strong>{attrMeta?.label}</strong> für <strong>{selected.length}</strong> Mitarbeiter auf:
            </p>
            <div className={styles.changeDetail} style={{ justifyContent: 'flex-start' }}>
              <span className={styles.new}>{value.trim()}</span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.9 }}>
              Beispiele:
              <ul style={{ margin: '6px 0 0', paddingLeft: '1.2rem' }}>
                {selected.slice(0, 5).map((u) => (
                  <li key={u.id}>{u.displayName} ({u.userPrincipalName})</li>
                ))}
                {selected.length > 5 && <li>…</li>}
              </ul>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowReview(false)}
                className={styles.cancelButton}
                disabled={loadingApply}
              >
                Abbrechen
              </button>
              <button
                onClick={applyBulk}
                className={styles.confirmButton}
                disabled={loadingApply}
              >
                {loadingApply ? 'Wird angewendet…' : 'Anwenden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

