import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Логіка оновлення даних
  res.status(200).json({ success: true });
}
