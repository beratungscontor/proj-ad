import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface CheckAccessResponse {
  hasAccess: boolean;
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
    const allowedSecurityGroupId = process.env.ALLOWED_SECURITY_GROUP_ID;

    const response = await axios.get('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { $select: 'id,displayName' },
    });

    const groups = response.data.value;
    const groupIds = groups.map((g: any) => g.id);

    const hasAccess = allowedSecurityGroupId ? groupIds.includes(allowedSecurityGroupId) : true;

    return res.status(200).json({ hasAccess, groups: groupIds });
  } catch (error) {
    console.error('Access check error:', error);
    return res.status(500).json({
      error: 'Failed to check access',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}