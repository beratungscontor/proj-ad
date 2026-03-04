import { useEffect, useState } from 'react';
import { AuditLog as AuditLogType } from '../lib/types';
import styles from '../styles/form.module.css';

interface AuditLogProps {
  employeeId: string;
}

export default function AuditLog({ employeeId }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch audit logs for this employee
    // setLogs([]);
  }, [employeeId]);

  return (
    <div className={styles.auditLog}>
      <h3>Change History</h3>
      {logs.length === 0 ? (
        <p>No changes recorded yet</p>
      ) : (
        <div className={styles.logsList}>
          {logs.map((log) => (
            <div key={log.id} className={styles.logEntry}>
              <div className={styles.logHeader}>
                <span className={styles.date}>{new Date(log.timestamp).toLocaleString()}</span>
                <span className={`${styles.status} ${styles[log.status]}`}>{log.status}</span>
              </div>
              <div className={styles.logBody}>Changed by: {log.changedBy}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}