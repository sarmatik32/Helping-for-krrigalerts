import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const CONFIG_FILE = path.join(process.cwd(), "jar-config.json");

// Default initial state
let jarApiState = {
  id: "8cNidLyYfj",
  sendId: "jar/8cNidLyYfj",
  jarUrl: "https://send.monobank.ua/jar/8cNidLyYfj",
  title: "🚨 Терміновий збір: Детектор дронів для нашого побратима! 🚨",
  description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен вашій пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
  currencyCode: 980,
  currencyName: "UAH",
  balance: 3845000, // in kopecks (38,450.00 UAH)
  goal: 8500000,    // in kopecks (85,000.00 UAH)
  ownerName: "Сергій К. (Кривий Ріг Оповіщення / АЛЕРТС)",
  monobankToken: "IuK_IXCutZiDcSLBr8d5X_IJbcAlkv714_PpNWfOxEZy0",
  logoUrl: "/logo.png",
  updatedAt: new Date().toISOString()
};

// Load saved config if exists
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    jarApiState = { ...jarApiState, ...saved };
    console.log("Loaded saved Monobank Jar configuration from jar-config.json");
  } catch (e) {
    console.error("Failed to parse jar-config.json:", e);
  }
}

// Function to save config
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(jarApiState, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save jar-config.json:", e);
  }
}

// Recent donations list
let recentDonations = [
  { id: "1", name: "Андрій М.", amount: 500, time: "2 хв тому", comment: "Разом до перемоги! 🇺🇦" },
  { id: "2", name: "Олена К.", amount: 200, time: "5 хв тому", comment: "На захист хлопців" },
  { id: "3", name: "Анонімний донатор", amount: 1000, time: "12 хв тому", comment: "Тримайтесь!" },
  { id: "4", name: "Володимир П.", amount: 350, time: "18 хв тому", comment: "Слава Україні!" },
  { id: "5", name: "Спільнота АЛЕРТС", amount: 5000, time: "25 хв тому", comment: "Внесок від адмінів" },
  { id: "6", name: "Олексій С.", amount: 100, time: "30 хв тому", comment: "Кожна гривня важлива" },
  { id: "7", name: "Сергій В.", amount: 2000, time: "45 хв тому", comment: "На детектор РЕР" },
  { id: "8", name: "Марія Г.", amount: 150, time: "1 год тому", comment: "Божої опіки воїнам" },
  { id: "9", name: "Анонімний донатор", amount: 500, time: "1 год тому", comment: "" },
  { id: "10", name: "Дмитро Т.", amount: 300, time: "2 год тому", comment: "Захисникам Покровського напрямку" }
];

// API: Fetch Monobank Jar API Data
app.get("/api/mono/jar-info", async (req, res) => {
  const { jarId, token } = req.query;
  const targetToken = (token as string) || jarApiState.monobankToken;
  const activeJarId = (jarId as string) || jarApiState.id;
  let apiStatusMsg = "Використовуються збережені дані збору";

  try {
    if (targetToken && targetToken.trim() !== "") {
      // Fetch from Monobank Client API if token is set
      const response = await fetch("https://api.monobank.ua/personal/client-info", {
        headers: { "X-Token": targetToken.trim() }
      });

      if (response.ok) {
        const clientInfo = await response.json();
        if (clientInfo.jars && clientInfo.jars.length > 0) {
          const cleanActiveId = activeJarId.replace("jar/", "").trim();
          const foundJar = clientInfo.jars.find((j: any) => {
            const jId = String(j.id || "");
            const jSendId = String(j.sendId || "");
            return (
              jId === cleanActiveId ||
              jSendId === cleanActiveId ||
              jSendId.includes(cleanActiveId) ||
              cleanActiveId.includes(jSendId)
            );
          }) || clientInfo.jars[0];

          if (foundJar) {
            if (foundJar.id) jarApiState.id = foundJar.id;
            if (foundJar.sendId) jarApiState.sendId = foundJar.sendId;
            if (foundJar.title) jarApiState.title = foundJar.title;
            if (foundJar.description) jarApiState.description = foundJar.description;
            if (foundJar.balance !== undefined) jarApiState.balance = foundJar.balance;
            if (foundJar.goal !== undefined) jarApiState.goal = foundJar.goal;
            if (foundJar.currencyCode) jarApiState.currencyCode = foundJar.currencyCode;
            if (foundJar.ownerName) jarApiState.ownerName = foundJar.ownerName;
            jarApiState.updatedAt = new Date().toISOString();
            saveConfig();
            apiStatusMsg = "Дані успішно оновлено через Monobank API";

            // Try to fetch recent donations statement from Monobank API
            try {
              const nowSec = Math.floor(Date.now() / 1000);
              const thirtyDaysAgoSec = nowSec - 30 * 24 * 3600;
              const jarAccId = foundJar.id || activeJarId;

              const stmtRes = await fetch(`https://api.monobank.ua/personal/statement/${jarAccId}/${thirtyDaysAgoSec}`, {
                headers: { "X-Token": targetToken.trim() }
              });

              if (stmtRes.ok) {
                const statementData = await stmtRes.json();
                if (Array.isArray(statementData) && statementData.length > 0) {
                  // Deduplicate by transaction id
                  const uniqueMap = new Map<string, any>();
                  for (const item of statementData) {
                    if (item && item.amount > 0) {
                      const itemKey = item.id || `${item.time}-${item.amount}`;
                      if (!uniqueMap.has(itemKey)) {
                        uniqueMap.set(itemKey, item);
                      }
                    }
                  }

                  const fetchedDonations = Array.from(uniqueMap.values())
                    .slice(0, 20)
                    .map((item: any, idx: number) => {
                      let donorName = "Анонімний донатор";
                      if (item.description) {
                        const cleanDesc = item.description
                          .replace(/^Поповнення банки від /i, "")
                          .replace(/^Переказ від /i, "")
                          .replace(/^Поповнення банки/i, "")
                          .trim();
                        if (cleanDesc && cleanDesc.length > 1) {
                          donorName = cleanDesc;
                        }
                      }

                      // Format time relative or date string
                      const dateObj = new Date(item.time * 1000);
                      const diffMins = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60));
                      let timeStr = "";
                      if (diffMins < 2) timeStr = "щойно";
                      else if (diffMins < 60) timeStr = `${diffMins} хв тому`;
                      else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} год тому`;
                      else timeStr = dateObj.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

                      return {
                        id: item.id || `stmt-${idx}`,
                        name: donorName,
                        amount: Math.round(item.amount / 100),
                        time: timeStr,
                        comment: item.comment || ""
                      };
                    });

                  if (fetchedDonations.length > 0) {
                    recentDonations = fetchedDonations;
                    apiStatusMsg = "Дані та список остатніх донатів оновлено з Monobank!";
                  }
                }
              }
            } catch (stmtErr) {
              console.log("Statement fetch notice:", stmtErr);
            }
          }
        } else {
          apiStatusMsg = "Не знайдено банок в акаунті Monobank";
        }
      } else if (response.status === 429) {
        apiStatusMsg = "Ліміт запитів Monobank API (1 запит на хв). Відображаються поточні дані.";
      } else if (response.status === 403) {
        apiStatusMsg = "Недійсний токен Monobank API. Перевірте токен на api.monobank.ua";
      } else {
        apiStatusMsg = `Помилка Monobank API (${response.status}). Відображаються поточні дані.`;
      }
    }

    // Convert kopecks to UAH
    const balanceUah = Math.floor(jarApiState.balance / 100);
    const goalUah = Math.floor(jarApiState.goal / 100);

    return res.json({
      success: true,
      apiEndpoint: `https://api.monobank.ua/bank/jar/${jarApiState.id}`,
      apiStatusMsg,
      rawMonobankResponse: {
        id: jarApiState.id,
        sendId: jarApiState.sendId,
        title: jarApiState.title,
        description: jarApiState.description,
        currencyCode: jarApiState.currencyCode,
        balance: jarApiState.balance,
        goal: jarApiState.goal,
        ownerName: jarApiState.ownerName,
        updatedAt: jarApiState.updatedAt
      },
      parsed: {
        jarUrl: jarApiState.jarUrl,
        title: jarApiState.title,
        description: jarApiState.description,
        balanceUah,
        goalUah,
        currency: "UAH",
        percentage: Math.min(100, Math.round((balanceUah / (goalUah || 1)) * 100)),
        remainingUah: Math.max(0, goalUah - balanceUah),
        logoUrl: (jarApiState as any).logoUrl || ""
      },
      donations: recentDonations
    });
  } catch (error: any) {
    console.error("Monobank Jar API Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// API: Update Monobank Jar settings
app.post("/api/mono/jar-update", (req, res) => {
  const { adminPassword, jarId, jarUrl, title, description, balanceUah, goalUah, monobankToken, logoUrl } = req.body;

  if (adminPassword !== "25510032") {
    return res.status(401).json({ success: false, message: "Невірний пароль адміністратора" });
  }

  if (jarUrl !== undefined && jarUrl.trim() !== "") {
    jarApiState.jarUrl = jarUrl.trim();
    if (jarUrl.includes("/jar/")) {
      const parts = jarUrl.split("/jar/");
      if (parts[1]) {
        const cleanSendId = parts[1].split("?")[0].trim();
        jarApiState.id = cleanSendId;
        jarApiState.sendId = `jar/${cleanSendId}`;
      }
    }
  }

  if (jarId !== undefined && jarId.trim() !== "") jarApiState.id = jarId.trim();
  if (title !== undefined && title.trim() !== "") jarApiState.title = title.trim();
  if (description !== undefined && description.trim() !== "") jarApiState.description = description.trim();
  if (balanceUah !== undefined) jarApiState.balance = Math.round(Number(balanceUah) * 100);
  if (goalUah !== undefined) jarApiState.goal = Math.round(Number(goalUah) * 100);
  if (monobankToken !== undefined) jarApiState.monobankToken = monobankToken.trim();
  if (logoUrl !== undefined) (jarApiState as any).logoUrl = logoUrl.trim();
  jarApiState.updatedAt = new Date().toISOString();

  saveConfig();

  res.json({
    success: true,
    message: "Дані збору Monobank успішно збережено",
    data: jarApiState
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
