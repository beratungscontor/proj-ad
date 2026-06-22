import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { checkEditorPimStatus } from '../../../lib/pim-check';

interface CheckAccessResponse {
  hasReadAccess: boolean;
  hasWriteAccess: boolean;
  writeExpiresAt: string | null;
  groups?: string[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckAccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token required' });
  }

  try {
    const readerSecurityGroupId = process.env.READER_SECURITY_GROUP_ID || process.env.ALLOWED_SECURITY_GROUP_ID;

    // Call /me/memberOf to get groups and /me to get the principalId
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { $select: 'id,displayName' },
    });
    
    const meResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { $select: 'id' },
    });
    const principalId = meResponse.data.id;

    const groups = response.data.value;
    const groupIds = groups.map((g: any) => g.id);

    const hasReadAccess = readerSecurityGroupId ? groupIds.includes(readerSecurityGroupId) : true;
    
    // Check write access via PIM
    let hasWriteAccess = false;
    let writeExpiresAt: string | null = null;
    
    if (hasReadAccess) {
      const pimStatus = await checkEditorPimStatus(principalId);
      hasWriteAccess = pimStatus.hasWriteAccess;
      writeExpiresAt = pimStatus.writeExpiresAt;
    }

    return res.status(200).json({ hasReadAccess, hasWriteAccess, writeExpiresAt, groups: groupIds });
  } catch (error) {
    console.error('Access check error:', error);
    return res.status(500).json({
      error: 'Failed to check access',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}