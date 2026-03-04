import type { NextApiRequest, NextApiResponse } from 'next';
import { AuditLog } from '../../../lib/types';

interface LogResponse {
  success: boolean;
  logId: string;
}

interface ErrorResponse {
  error: string;
}

const auditLogs: AuditLog[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { changedBy, employeeId, employeeName, changes, status } = req.body;

  const logEntry: AuditLog = {
    id: Date.now().toString(),
    timestamp: new Date(),
    changedBy,
    employeeId,
    employeeName,
    changes,
    status,
  };

  auditLogs.push(logEntry);

  return res.status(200).json({ success: true, logId: logEntry.id });
}