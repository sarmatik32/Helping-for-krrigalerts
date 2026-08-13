import crypto from "crypto";

// Valid SHA-256 hashes for admin passwords (never store plaintext passwords in code)
const ALLOWED_PASSWORD_HASHES = [
  "8c187b404079d8c94914a7b53984bbed8249992bd7b4b741f33284aafb8b69d6", // SHA-256 hash 1
  "f2d1d9604cd4655a27d7852f8bd6b763f53423b1cab49223687a0423ab6e80c9", // SHA-256 hash 2
];

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
  const inputHash = crypto.createHash("sha256").update(String(adminPassword || "")).digest("hex");

  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const isHashValid = ALLOWED_PASSWORD_HASHES.includes(inputHash) || (envHash && inputHash === envHash);

  if (!isHashValid) {
    return res.status(401).json({ success: false, message: "Невірний пароль адміністратора" });
  }

  return res.status(200).json({ success: true, message: "Налаштування збережено" });
}
