import { Employee } from '../../lib/types';
import styles from '../../styles/form.module.css';

interface WorkInfoSectionProps {
  formData: Partial<Employee>;
  onChange: (field: string, value: string) => void;
}

export default function WorkInfoSection({ formData, onChange }: WorkInfoSectionProps) {
  return (
    <div className={styles.section}>
      <div className={styles.formGroup}>
        <label>Job Title</label>
        <input
          type="text"
          value={formData.jobTitle || ''}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          placeholder="Job title"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Department</label>
        <input
          type="text"
          value={formData.department || ''}
          onChange={(e) => onChange('department', e.target.value)}
          placeholder="Department"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Manager UPN</label>
        <input
          type="email"
          value={formData.manager?.userPrincipalName || ''}
          onChange={(e) => onChange('manager', e.target.value)}
          placeholder="manager@company.com"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Company Name</label>
        <input
          type="text"
          value={formData.companyName || ''}
          onChange={(e) => onChange('companyName', e.target.value)}
          placeholder="Company name"
        />
      </div>
    </div>
  );
}