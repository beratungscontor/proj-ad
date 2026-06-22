import { Employee } from '../../lib/types';
import styles from '../../styles/form.module.css';

interface AddressSectionProps {
  formData: Partial<Employee>;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}
export default function AddressSection({ formData, onChange, readOnly = false }: AddressSectionProps) {
  return (
    <div className={styles.section} style={{ opacity: readOnly ? 0.7 : 1, pointerEvents: readOnly ? 'none' : 'auto' }}>
      <div className={styles.formGroup}>
        <label>Straße und Hausnummer</label>
        <input type="text" value={formData.streetAddress || ''} onChange={(e) => onChange('streetAddress', e.target.value)} placeholder="Musterstraße 1" readOnly={readOnly} disabled={readOnly} />
      </div>
      <div className={styles.formGroup}>
        <label>Stadt</label>
        <input type="text" value={formData.city || ''} onChange={(e) => onChange('city', e.target.value)} placeholder="Stadt" readOnly={readOnly} disabled={readOnly} />
      </div>
      <div className={styles.formGroup}>
        <label>Bundesland/Kanton</label>
        <input type="text" value={formData.state || ''} onChange={(e) => onChange('state', e.target.value)} placeholder="Z.B. Bayern" readOnly={readOnly} disabled={readOnly} />
      </div>
      <div className={styles.formGroup}>
        <label>Postleitzahl</label>
        <input type="text" value={formData.postalCode || ''} onChange={(e) => onChange('postalCode', e.target.value)} placeholder="Postleitzahl" readOnly={readOnly} disabled={readOnly} />
      </div>
      <div className={styles.formGroup}>
        <label>Land</label>
        <input type="text" value={formData.country || ''} onChange={(e) => onChange('country', e.target.value)} placeholder="Deutschland" readOnly={readOnly} disabled={readOnly} />
      </div>
    </div>
  );
}
