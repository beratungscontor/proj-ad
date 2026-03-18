import { Employee } from '../lib/types';
import styles from '../styles/form.module.css';

interface ReviewModalProps {
  original: Employee;
  updated: Partial<Employee>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  givenName: 'Vorname',
  surname: 'Nachname',
  displayName: 'Anzeigename',
  mobilePhone: 'Mobiltelefon',
  businessPhones: 'Bürotelefon',
  officeLocation: 'Bürostandort',
  jobTitle: 'Position',
  department: 'Abteilung',
  companyName: 'Firmenname',

  streetAddress: 'Straße',
  city: 'Stadt',
  state: 'Bundesland',
  postalCode: 'PLZ',
  country: 'Land',
};

// Removed 'mail' — it's read-only and should not appear as a change
const REVIEW_FIELDS = [
  'givenName', 'surname', 'displayName', 'mobilePhone', 'businessPhones',
  'officeLocation', 'jobTitle', 'department', 'companyName',
  'streetAddress', 'city', 'state', 'postalCode', 'country',
];

/**
 * Normalize a value to a plain string for comparison.
 * Handles null, undefined, arrays (businessPhones), and whitespace.
 */
function normalize(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val)) return (val[0] ?? '').toString().trim();
  return String(val).trim();
}

export default function ReviewModal({
  original,
  updated,
  onConfirm,
  onCancel,
  loading,
}: ReviewModalProps) {
  const changes: Record<string, { old: string; new: string }> = {};

  REVIEW_FIELDS.forEach((field) => {
    const key = field as keyof Employee;
    const oldVal = normalize(original[key]);
    const newVal = normalize((updated as any)[key]);

    if (oldVal !== newVal) {
      changes[field] = { old: oldVal || '—', new: newVal || '—' };
    }
  });

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Änderungen überprüfen</h2>
        <p className={styles.modalSubtitle}>
          {Object.keys(changes).length} Feld{Object.keys(changes).length !== 1 ? 'er' : ''} {Object.keys(changes).length !== 1 ? 'werden' : 'wird'} aktualisiert
        </p>

        <div className={styles.changesList}>
          {Object.keys(changes).length === 0 ? (
            <div className={styles.noChanges}>Keine Änderungen erkannt</div>
          ) : (
            Object.entries(changes).map(([field, change]) => (
              <div key={field} className={styles.changeItem}>
                <div className={styles.fieldName}>{FIELD_LABELS[field] || field}</div>
                <div className={styles.changeDetail}>
                  <span className={styles.old}>{change.old}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.new}>{change.new}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelButton} disabled={loading}>
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmButton}
            disabled={loading || Object.keys(changes).length === 0}
          >
            {loading ? '⏳ Speichern...' : '✔ Bestätigen & Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
