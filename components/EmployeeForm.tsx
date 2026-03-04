import { useState } from 'react';
import { Employee } from '../lib/types';
import PersonalInfoSection from './FormSections/PersonalInfoSection';
import WorkInfoSection from './FormSections/WorkInfoSection';
import AddressSection from './FormSections/AddressSection';
import ReviewModal from './ReviewModal';
import styles from '../styles/form.module.css';

interface EmployeeFormProps {
  employee: Employee;
}

export default function EmployeeForm({ employee }: EmployeeFormProps) {
  const [formData, setFormData] = useState(employee);
  const [showReview, setShowReview] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graph/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: employee.id, updates: formData }),
      });

      if (response.ok) {
        setSuccess('Employee profile updated successfully!');
        setShowReview(false);
      } else {
        const data = await response.json();
        setError(data.details || 'Failed to update employee');
      }
    } catch (err) {
      setError('An error occurred while updating the employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Employee: {employee.displayName}</h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'personal' ? styles.active : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'work' ? styles.active : ''}`}
          onClick={() => setActiveTab('work')}
        >
          Work Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'address' ? styles.active : ''}`}
          onClick={() => setActiveTab('address')}
        >
          Address
        </button>
      </div>

      {success && <div className={styles.successMessage}>✓ {success}</div>}
      {error && <div className={styles.errorMessage}>✕ {error}</div>}

      <div className={styles.tabContent}>
        {activeTab === 'personal' && (
          <PersonalInfoSection formData={formData} onChange={handleFieldChange} />
        )}
        {activeTab === 'work' && (
          <WorkInfoSection formData={formData} onChange={handleFieldChange} />
        )}
        {activeTab === 'address' && (
          <AddressSection formData={formData} onChange={handleFieldChange} />
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          onClick={() => setShowReview(true)}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Review & Save'}
        </button>
      </div>

      {showReview && (
        <ReviewModal
          original={employee}
          updated={formData}
          onConfirm={handleSubmit}
          onCancel={() => setShowReview(false)}
          loading={loading}
        />
      )}
    </div>
  );
}