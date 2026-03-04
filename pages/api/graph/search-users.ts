import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Buffer } from 'buffer';
import { getGraphAccessToken } from '../../../lib/graph-token';
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
    const accessToken = await getGraphAccessToken();

    const searchResponse = await axios.get('https://graph.microsoft.com/v1.0/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        $filter: `startswith(userPrincipalName,'${query}') or startswith(displayName,'${query}')`,
        $select:
          'id,userPrincipalName,displayName,givenName,surname,mail,mobilePhone,officeLocation,businessPhones,jobTitle,department,companyName,streetAddress,city,state,postalCode,country',
        $top: 15,
      },
    });

    const users = searchResponse.data.value;

    // Fetch photos for all users in parallel
    const usersWithPhotos = await Promise.all(
      users.map(async (user: any) => {
        let photoUrl = undefined;
        try {
          const photoResponse = await axios.get(
            `https://graph.microsoft.com/v1.0/users/${user.id}/photo/$value`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
              responseType: 'arraybuffer',
            }
          );

          if (photoResponse.data) {
            const base64 = Buffer.from(photoResponse.data, 'binary').toString('base64');
            const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
            photoUrl = `data:${contentType};base64,${base64}`;
          }
        } catch (photoError) {
          // It's normal for users not to have a photo (404), so we just ignore this error
        }

        return {
          ...user,
          photoUrl,
        };
      })
    );

    return res.status(200).json({ users: usersWithPhotos });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Failed to search users',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}