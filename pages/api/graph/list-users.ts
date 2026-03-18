import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Buffer } from 'buffer';
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
 * Uses pagination to ensure we get every user.
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
      'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country';

    let allUsers: any[] = [];
    let nextLink: string | null =
      `https://graph.microsoft.com/v1.0/users?$select=${selectFields}&$top=100&$filter=endsWith(mail,'@beratungscontor.de')&$count=true`;

    // Microsoft Graph requires ConsistencyLevel header for advanced queries
    const graphHeaders = {
      ...headers,
      ConsistencyLevel: 'eventual',
    };

    while (nextLink) {
      const response = await axios.get(nextLink, { headers: graphHeaders });
      const users = response.data.value || [];
      allUsers = allUsers.concat(users);
      nextLink = response.data['@odata.nextLink'] || null;

      // Safety: stop after 1000 users to prevent runaway pagination
      if (allUsers.length > 1000) break;
    }

    // Fetch photos in parallel (batches of 10 to avoid rate limiting)
    const PHOTO_BATCH = 10;
    const usersWithPhotos: Employee[] = [];

    for (let i = 0; i < allUsers.length; i += PHOTO_BATCH) {
      const batch = allUsers.slice(i, i + PHOTO_BATCH);
      const results = await Promise.all(
        batch.map(async (user: any) => {
          let photoUrl: string | undefined;
          try {
            const photoResponse = await axios.get(
              `https://graph.microsoft.com/v1.0/users/${user.id}/photo/$value`,
              { headers, responseType: 'arraybuffer' }
            );
            if (photoResponse.data) {
              const base64 = Buffer.from(photoResponse.data, 'binary').toString('base64');
              const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
              photoUrl = `data:${contentType};base64,${base64}`;
            }
          } catch {
            // no photo — that's fine
          }
          return { ...user, photoUrl } as Employee;
        })
      );
      usersWithPhotos.push(...results);
    }

    // Sort alphabetically by displayName
    usersWithPhotos.sort((a, b) =>
      (a.displayName || '').localeCompare(b.displayName || '', 'de')
    );

    return res.status(200).json({
      users: usersWithPhotos,
      totalCount: usersWithPhotos.length,
    });
  } catch (error: any) {
    console.error('List users error:', error?.response?.data || error?.message);
    return res.status(500).json({
      error: 'Failed to list users',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
