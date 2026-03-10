import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getGraphAccessToken } from '../../../lib/graph-token';
import { addAuditLog } from '../../../lib/audit-store';

const BULK_ALLOWED_FIELDS = new Set([
  'businessPhones',
  'officeLocation',
  'department',
  'companyName',
  'streetAddress',
  'city',
  'state',
  'postalCode',
  'country',
]);

type BulkUpdates = Record<string, unknown>;

interface BulkUpdateSelectedBody {
  userIds: string[];
  updates: BulkUpdates;
}

interface BulkUpdateSelectedResponse {
  updated: number;
  failed: number;
  total: number;
  errors: string[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function patchWithRetry(
  url: string,
  payload: Record<string, unknown>,
  headers: Record<string, string>
) {
  const MAX_ATTEMPTS = 4;
  let attempt = 0;
  let delay = 400;

  while (true) {
    try {
      await axios.patch(url, payload, { headers });
      return;
    } catch (err: any) {
      attempt++;
      const status = err?.response?.status;
      const retryAfterHeader = err?.response?.headers?.['retry-after'];
      const retryAfterMs =
        typeof retryAfterHeader === 'string' ? Number(retryAfterHeader) * 1000 : undefined;

      const retryable = status === 429 || status === 503 || status === 502 || status === 504;
      if (!retryable || attempt >= MAX_ATTEMPTS) throw err;

      await sleep(Number.isFinite(retryAfterMs) ? (retryAfterMs as number) : delay);
      delay *= 2;
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkUpdateSelectedResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userIds, updates } = req.body as BulkUpdateSelectedBody;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'userIds is required' });
  }
  if (userIds.length > 100) {
    return res.status(400).json({ error: 'Too many users selected', details: 'Max 100 users per bulk operation' });
  }
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'updates is required' });
  }

  // Build clean payload
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (!BULK_ALLOWED_FIELDS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (key === 'businessPhones') {
      if (Array.isArray(value)) payload[key] = value;
      else if (typeof value === 'string' && value.trim()) payload[key] = [value.trim()];
      continue;
    }
    if (typeof value === 'string') payload[key] = value;
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'No allowed updates provided' });
  }

  try {
    const accessToken = await getGraphAccessToken();
    const graphUrl = 'https://graph.microsoft.com/v1.0';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let updated = 0;
    const errors: string[] = [];
    const CONCURRENCY = 6;

    for (let i = 0; i < userIds.length; i += CONCURRENCY) {
      const batch = userIds.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (userId) => {
          try {
            await patchWithRetry(`${graphUrl}/users/${userId}`, payload, headers);
            updated++;
            addAuditLog({
              changedBy: 'bulk-operation',
              employeeId: userId,
              employeeName: 'Bulk update',
              changes: Object.fromEntries(
                Object.entries(payload).map(([field, newVal]) => [
                  field,
                  { old: '', new: Array.isArray(newVal) ? newVal.join(',') : String(newVal) },
                ])
              ),
              status: 'success',
            });
          } catch (err: any) {
            const msg = err?.response?.data?.error?.message || err?.message || 'Unknown error';
            errors.push(`${userId}: ${msg}`);
            addAuditLog({
              changedBy: 'bulk-operation',
              employeeId: userId,
              employeeName: 'Bulk update',
              changes: {},
              status: 'failed',
              errorMessage: msg,
            });
          }
        })
      );
    }

    return res.status(200).json({
      updated,
      failed: errors.length,
      total: userIds.length,
      errors: errors.slice(0, 25),
    });
  } catch (error: any) {
    const details =
      error?.response?.data?.error?.message || (error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Bulk update selected failed', details });
  }
}

