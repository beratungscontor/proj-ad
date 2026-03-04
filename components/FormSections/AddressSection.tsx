import { Employee } from '../../lib/types';
import styles from '../../styles/form.module.css';

interface AddressSectionProps {
  formData: Partial<Employee>;
  onChange: (field: string, value: string) => void;
}

export default function AddressSection({ formData, onChange }: AddressSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.formGroup}>
        <label>Street Address</label>
        <input type="text" value={formData.streetAddress || ''} onChange={(e) => onChange('streetAddress', e.target.value)} placeholder="Street address" />
      </div>
      <div className={styles.formGroup}>
        <label>City</label>
        <input type="text" value={formData.city || ''} onChange={(e) => onChange('city', e.target.value)} placeholder="City" />
      </div>
      <div className={styles.formGroup}>
        <label>State/Province</label>
        <input type="text" value={formData.state || ''} onChange={(e) => onChange('state', e.target.value)} placeholder="State/Province" />
      </div>
      <div className={styles.formGroup}>
        <label>Postal Code</label>
        <input type="text" value={formData.postalCode || ''} onChange={(e) => onChange('postalCode', e.target.value)} placeholder="Postal code" />
      </div>
      <div className={styles.formGroup}>
        <label>Country</label>
        <input type="text" value={formData.country || ''} onChange={(e) => onChange('country', e.target.value)} placeholder="Country" />
      </div>
    </div>
  );
}