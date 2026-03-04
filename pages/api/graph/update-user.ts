import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface UpdateResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, updates, managerId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const clientId = process.env.SERVICE_PRINCIPAL_CLIENT_ID;
    const clientSecret = process.env.SERVICE_PRINCIPAL_CLIENT_SECRET;

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const tokenResponse = await axios.post(tokenUrl, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    });

    const accessToken = tokenResponse.data.access_token;
    const graphUrl = 'https://graph.microsoft.com/v1.0';

    if (updates && Object.keys(updates).length > 0) {
      await axios.patch(`${graphUrl}/users/${userId}`, updates, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
    }

    if (managerId) {
      const managerRef = { '@odata.id': `${graphUrl}/users/${managerId}` };
      await axios.put(`${graphUrl}/users/${userId}/manager/$ref`, managerRef, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      });
    }

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}