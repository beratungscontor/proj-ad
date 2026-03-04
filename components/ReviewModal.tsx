import { Employee } from '../lib/types';
import styles from '../styles/form.module.css';

interface ReviewModalProps {
  original: Employee;
  updated: Partial<Employee>;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ReviewModal({
  original,
  updated,
  onConfirm,
  onCancel,
  loading,
}: ReviewModalProps) {
  const changes: Record<string, { old: string; new: string }> = {};

  const fields = [
    'givenName', 'surname', 'displayName', 'mail', 'mobilePhone',
    'officeLocation', 'jobTitle', 'department', 'companyName',
    'streetAddress', 'city', 'state', 'postalCode', 'country',
  ];

  fields.forEach((field) => {
    const key = field as keyof Employee;
    if (original[key] !== updated[key]) {
      changes[field] = {
        old: String(original[key] || 'N/A'),
        new: String(updated[key] || 'N/A'),
      };
    }
  });

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Review Changes</h2>
        <div className={styles.changesList}>
          {Object.entries(changes).length === 0 ? (
            <p>No changes to review</p>
          ) : (
            Object.entries(changes).map(([field, change]) => (
              <div key={field} className={styles.changeItem}>
                <div className={styles.fieldName}>{field}</div>
                <div className={styles.changeDetail}>
                  <span className={styles.old}>Old: {change.old}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.new}>New: {change.new}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmButton} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}