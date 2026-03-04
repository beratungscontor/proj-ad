import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface TokenResponse {
  accessToken: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const clientId = process.env.SERVICE_PRINCIPAL_CLIENT_ID;
    const clientSecret = process.env.SERVICE_PRINCIPAL_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Missing service principal credentials',
      });
    }

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const response = await axios.post(tokenUrl, {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    });

    return res.status(200).json({ accessToken: response.data.access_token });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate access token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}