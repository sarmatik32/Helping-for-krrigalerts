import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Перенесіть сюди логіку отримання даних банки з server.ts
    res.status(200).json({ success: true, /* ваші дані */ });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jar info' });
  }
}
