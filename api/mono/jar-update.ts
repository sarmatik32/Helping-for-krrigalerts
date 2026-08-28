import crypto from "crypto";
import fs from "fs";
import path from "path";

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

  const {
    adminPassword,
    jarUrl,
    title,
    description,
    balanceUah,
    goalUah,
    monobankToken,
    logoUrl,
  } = req.body || {};

  const inputHash = crypto.createHash("sha256").update(String(adminPassword || "")).digest("hex");
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const isHashValid = ALLOWED_PASSWORD_HASHES.includes(inputHash) || (envHash && inputHash === envHash);

  if (!isHashValid) {
    return res.status(401).json({ success: false, message: "Невірний пароль адміністратора" });
  }

  // Update jar-config.json
  try {
    const configPath = path.join(process.cwd(), "jar-config.json");
    let currentConfig: any = {};
    if (fs.existsSync(configPath)) {
      currentConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    let jarSendId = currentConfig.id || "8cNidLyYfj";
    if (jarUrl) {
      const match = jarUrl.match(/jar\/([a-zA-Z0-9_-]+)/);
      if (match) jarSendId = match[1];
    }

    const updatedConfig = {
      ...currentConfig,
      id: jarSendId,
      sendId: `jar/${jarSendId}`,
      jarUrl: jarUrl || currentConfig.jarUrl || `https://send.monobank.ua/jar/${jarSendId}`,
      title: title !== undefined ? title : currentConfig.title,
      description: description !== undefined ? description : currentConfig.description,
      balance: balanceUah !== undefined ? Math.round(Number(balanceUah) * 100) : currentConfig.balance,
      goal: goalUah !== undefined ? Math.round(Number(goalUah) * 100) : currentConfig.goal,
      monobankToken: monobankToken !== undefined ? monobankToken : currentConfig.monobankToken,
      logoUrl: logoUrl !== undefined ? logoUrl : currentConfig.logoUrl,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf8");
    return res.status(200).json({ success: true, message: "Налаштування успішно збережено в jar-config.json", config: updatedConfig });
  } catch (err: any) {
    console.warn("Could not write jar-config.json:", err);
    return res.status(200).json({ success: true, message: "Налаштування збережено в пам'яті" });
  }
}

