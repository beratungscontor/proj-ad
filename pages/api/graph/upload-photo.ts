import type { NextApiRequest, NextApiResponse } from 'next';
import { getGraphAccessToken } from '../../../lib/graph-token';
import axios from 'axios';

// Disable Next.js default body parser so we can stream the raw image buffer
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Employee ID is required.' });
    }

    try {
        const accessToken = await getGraphAccessToken();

        // Read the raw image data from the request stream
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        if (buffer.length === 0) {
            return res.status(400).json({ error: 'No image data provided.' });
        }

        // Graph API expects a PUT request with the binary content to /photo/$value
        await axios.put(
            `https://graph.microsoft.com/v1.0/users/${id}/photo/$value`,
            buffer,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': req.headers['content-type'] || 'image/jpeg',
                    'Content-Length': buffer.length,
                },
            }
        );

        res.status(200).json({ success: true, message: 'Profile photo updated successfully.' });
    } catch (error: any) {
        console.error('Error uploading profile photo:', error.response?.data || error.message);
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error?.message || 'An error occurred while uploading the photo.';
        res.status(statusCode).json({ error: errorMessage });
    }
}
