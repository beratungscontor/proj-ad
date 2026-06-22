import { Employee } from '../../lib/types';
import styles from '../../styles/form.module.css';

interface PersonalInfoSectionProps {
  formData: Partial<Employee>;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}
export default function PersonalInfoSection({ formData, onChange, readOnly = false }: PersonalInfoSectionProps) {
  return (
    <div className={styles.section} style={{ opacity: readOnly ? 0.7 : 1, pointerEvents: readOnly ? 'none' : 'auto' }}>
      <div className={styles.formGroup}>
        <label>Vorname <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={formData.givenName || ''}
          onChange={(e) => onChange('givenName', e.target.value)}
          placeholder="Vorname"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Nachname <span className={styles.required}>*</span></label>
        <input
          type="text"
          value={formData.surname || ''}
          onChange={(e) => onChange('surname', e.target.value)}
          placeholder="Nachname"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Anzeigename</label>
        <input
          type="text"
          value={formData.displayName || ''}
          onChange={(e) => onChange('displayName', e.target.value)}
          placeholder="Anzeigename (z.B. Max Mustermann)"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>E-Mail-Adresse <span className={styles.readOnlyBadge}>(nur Anzeige)</span></label>
        <input
          type="email"
          value={formData.mail || ''}
          readOnly
          disabled
          className={styles.readOnlyInput}
          placeholder="email@firma.de"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Mobiltelefon</label>
        <input
          type="tel"
          value={formData.mobilePhone || ''}
          onChange={(e) => onChange('mobilePhone', e.target.value)}
          placeholder="+49 151 1234567"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Bürotelefon</label>
        <input
          type="tel"
          value={formData.businessPhones?.[0] || ''}
          onChange={(e) => onChange('businessPhones', e.target.value)}
          placeholder="+49 30 123456"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Bürostandort</label>
        <input
          type="text"
          value={formData.officeLocation || ''}
          onChange={(e) => onChange('officeLocation', e.target.value)}
          placeholder="z.B. Gebäude A, 3. Stock"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
