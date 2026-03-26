import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getGraphAccessToken } from '../../../lib/graph-token';

/**
 * Fetch a single user's photo from Microsoft Graph.
 * Returns the photo as a base64 data URI.
 * Usage: GET /api/graph/user-photo?id=<userId>
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.id as string;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    const accessToken = await getGraphAccessToken();
    const photoResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'arraybuffer',
      }
    );

    if (photoResponse.data) {
      const base64 = Buffer.from(photoResponse.data, 'binary').toString('base64');
      const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
      // Cache photo for 1 hour
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).json({ photoUrl: `data:${contentType};base64,${base64}` });
    }

    return res.status(404).json({ error: 'No photo' });
  } catch {
    return res.status(404).json({ error: 'No photo available' });
  }
}
