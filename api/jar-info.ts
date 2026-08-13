// api/jar-info.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Скопіюй сюди логіку з server.ts, яка робить запит до Monobank
    const jarId = "ВАШ_ID_БАНКИ"; 
    const response = await fetch(`https://api.monobank.ua/bank/jar/${jarId}`);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch jar info' });
  }
}
