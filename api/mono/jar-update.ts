export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { adminPassword } = req.body || {};
  if (adminPassword !== "25510032" && adminPassword !== "alerts2026") {
    return res.status(401).json({ success: false, message: "Невірний пароль адміністратора" });
  }

  return res.status(200).json({ success: true, message: "Налаштування збережено" });
}
