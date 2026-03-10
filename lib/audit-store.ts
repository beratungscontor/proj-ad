import { AuditLog } from './types';

// In-memory store (suitable for MVP/demo; replace with DB for production)
const auditLogs: AuditLog[] = [];

export function addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const logEntry: AuditLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date(),
    ...entry,
  };

  auditLogs.unshift(logEntry); // newest first
  if (auditLogs.length > 500) auditLogs.pop();
  return logEntry;
}

export function getAuditLogs(employeeId?: string): AuditLog[] {
  const filtered = employeeId ? auditLogs.filter((l) => l.employeeId === employeeId) : auditLogs;
  return filtered.slice(0, 50);
}

