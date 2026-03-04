import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Employee } from '../../../lib/types';

interface SearchResponse {
  users: Employee[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query required' });
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

    const searchResponse = await axios.get('https://graph.microsoft.com/v1.0/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        $filter: `startswith(userPrincipalName,'${query}') or startswith(displayName,'${query}')`,
        $select: 'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country',
        $top: 10,
      },
    });

    return res.status(200).json({ users: searchResponse.data.value });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}