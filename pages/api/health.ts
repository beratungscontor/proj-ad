import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Minimal health check for Azure. No env vars or DB – just confirms the app is running.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true });
}
