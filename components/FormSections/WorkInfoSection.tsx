import { Employee } from '../../lib/types';
import styles from '../../styles/form.module.css';

interface WorkInfoSectionProps {
  formData: Partial<Employee>;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
}
export default function WorkInfoSection({ formData, onChange, readOnly = false }: WorkInfoSectionProps) {
  return (
    <div className={styles.section} style={{ opacity: readOnly ? 0.7 : 1, pointerEvents: readOnly ? 'none' : 'auto' }}>
      <div className={styles.formGroup}>
        <label>Position</label>
        <input
          type="text"
          value={formData.jobTitle || ''}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          placeholder="z.B. Software Engineer"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Abteilung</label>
        <input
          type="text"
          value={formData.department || ''}
          onChange={(e) => onChange('department', e.target.value)}
          placeholder="z.B. IT-Abteilung"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Firmenname</label>
        <input
          type="text"
          value={formData.companyName || ''}
          onChange={(e) => onChange('companyName', e.target.value)}
          placeholder="Firmenname"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}
