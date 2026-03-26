import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosResponse } from 'axios';
import { getGraphAccessToken } from '../../../lib/graph-token';
import { Employee } from '../../../lib/types';

interface ListUsersResponse {
  users: Employee[];
  totalCount: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * Fetch ALL internal users (@beratungscontor.de) from Microsoft Graph.
 * Returns users WITHOUT photos for fast loading.
 * Photos are loaded separately via /api/graph/user-photo.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListUsersResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = await getGraphAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    const selectFields =
      'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country,onPremisesExtensionAttributes';

    let allUsers: any[] = [];
    let nextLink: string | null =
      `https://graph.microsoft.com/v1.0/users?$select=${selectFields}&$top=100&$filter=endsWith(mail,'@beratungscontor.de')&$count=true`;

    const graphHeaders = {
      ...headers,
      ConsistencyLevel: 'eventual',
    };

    while (nextLink) {
      const response: AxiosResponse<any> = await axios.get(nextLink, { headers: graphHeaders });
      const users = response.data.value || [];
      allUsers = allUsers.concat(users);
      nextLink = response.data['@odata.nextLink'] || null;

      if (allUsers.length > 1000) break;
    }

    // Map to Employee shape (no photos — those load progressively on the client)
    const employees: Employee[] = allUsers.map((user: any) => ({
      ...user,
      onPremisesExtensionAttributes: user.onPremisesExtensionAttributes || {},
    }));

    // Sort alphabetically by displayName
    employees.sort((a, b) =>
      (a.displayName || '').localeCompare(b.displayName || '', 'de')
    );

    return res.status(200).json({
      users: employees,
      totalCount: employees.length,
    });
  } catch (error: any) {
    console.error('List users error:', error?.response?.data || error?.message);
    return res.status(500).json({
      error: 'Failed to list users',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
