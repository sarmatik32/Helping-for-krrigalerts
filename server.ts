import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Valid SHA-256 hashes for admin passwords (never store plaintext passwords in code)
const ALLOWED_PASSWORD_HASHES = [
  "8c187b404079d8c94914a7b53984bbed8249992bd7b4b741f33284aafb8b69d6", // SHA-256 hash 1
  "f2d1d9604cd4655a27d7852f8bd6b763f53423b1cab49223687a0423ab6e80c9", // SHA-256 hash 2
];

const app = express();
const PORT = 3000;

app.use(express.json());

const CONFIG_FILE = path.join(process.cwd(), "jar-config.json");

// Default initial state
let jarApiState = {
  id: "8cNidLyYfj",
  sendId: "jar/8cNidLyYfj",
  jarUrl: "https://send.monobank.ua/jar/8cNidLyYfj",
  title: "На РЕБ",
  description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен ваш пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
  currencyCode: 980,
  currencyName: "UAH",
  balance: 3184048, // in kopecks (31,840.48 UAH)
  goal: 4500000,    // in kopecks (45,000.00 UAH)
  ownerName: "Артем Г.",
  monobankToken: "",
  logoUrl: "/logo.png",
  isClosed: true,
  closedAt: "2026-10-08T05:23:57.297Z",
  closedReportTitle: "Збір успішно завершено! Мета досягнута!",
  closedReportText: "Збір закриваємо, час вже не на нашому боці, вже **вкрай необхідно**. Закрили потребу, вже здійснили закуп та відправлення на позицію.\nПоки збирали, **Чуйка** випустила **версію 4.0** (яку і купили).\nЗбір, на жаль, будемо закривати на [green]70%[/green], остаточну суму закрили коштами військових та банку.\nСума не ==45к==, а ==60к== — але то вже нюанси. Хоч і чутливі.\n\nДякуємо всім, хто долучився! **Завтра повний звіт.**\nХто ще має бажання долучитися — ще не пізно, будемо вдячні за **кожну гривню** 🫶",
  closedBalanceUah: 31840,
  closedGoalUah: 45000,
  closedPercentage: 71,
  cardNumber: "4874 1000 3205 4507",
  donateSiteUrl: "https://donate.krrigalerts.pp.ua/",
  reportUrl: "https://t.me/krrigalerts",
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

// Function to reload config from file if updated externally
function reloadConfigFromFile() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      jarApiState = { ...jarApiState, ...saved };
    } catch (e) {
      console.error("Failed to reload jar-config.json:", e);
    }
  }
}

// Recent donations list (populated dynamically from Monobank API statement)
let recentDonations: any[] = [];
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 60000;

// API: Fetch Monobank Jar API Data
app.get("/api/mono/jar-info", async (req, res) => {
  // Always ensure fresh data from root jar-config.json
  reloadConfigFromFile();
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const { jarId, token, force } = req.query;
  const targetToken = (token as string) || process.env.MONOBANK_TOKEN || jarApiState.monobankToken;
  const activeJarId = (jarId as string) || jarApiState.id;
  let apiStatusMsg = "Використовуються збережені дані збору";

  const now = Date.now();
  const isCacheFresh = (now - lastFetchTimestamp < CACHE_TTL_MS);
  const forceRefresh = force === "true" || force === "1";

  try {
    if (targetToken && targetToken.trim() !== "" && (!isCacheFresh || forceRefresh)) {
      // Fetch from Monobank Client API if token is set and cache expired
      const response = await fetch("https://api.monobank.ua/personal/client-info", {
        headers: { "X-Token": targetToken.trim() }
      });

      if (response.ok) {
        lastFetchTimestamp = now;
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
    } else if (isCacheFresh) {
      apiStatusMsg = "Синхронізовано з Monobank API (з кешу)";
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
        updatedAt: jarApiState.updatedAt,
        isClosed: Boolean((jarApiState as any).isClosed),
        closedAt: (jarApiState as any).closedAt || "",
        closedReportTitle: (jarApiState as any).closedReportTitle || "",
        closedReportText: (jarApiState as any).closedReportText || "",
        closedBalanceUah: (jarApiState as any).closedBalanceUah || balanceUah,
        closedGoalUah: (jarApiState as any).closedGoalUah || goalUah,
        closedPercentage: (jarApiState as any).closedPercentage || Math.min(100, Math.round((balanceUah / (goalUah || 1)) * 100)),
        cardNumber: (jarApiState as any).cardNumber || "4874 1000 3205 4507",
        cardNumbers: (jarApiState as any).cardNumbers || [(jarApiState as any).cardNumber || "4874 1000 3205 4507"],
        donateSiteUrl: (jarApiState as any).donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
        reportUrl: (jarApiState as any).reportUrl || "https://t.me/krrigalerts",
        showReportUrl: (jarApiState as any).showReportUrl !== undefined ? Boolean((jarApiState as any).showReportUrl) : true,
        closedGratitudeTitle: (jarApiState as any).closedGratitudeTitle || "Дякуємо за допомогу!",
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
        logoUrl: (jarApiState as any).logoUrl || "",
        isClosed: Boolean((jarApiState as any).isClosed),
        closedAt: (jarApiState as any).closedAt || "",
        closedReportTitle: (jarApiState as any).closedReportTitle || "",
        closedReportText: (jarApiState as any).closedReportText || "",
        closedBalanceUah: (jarApiState as any).closedBalanceUah || balanceUah,
        closedGoalUah: (jarApiState as any).closedGoalUah || goalUah,
        closedPercentage: (jarApiState as any).closedPercentage || Math.min(100, Math.round((balanceUah / (goalUah || 1)) * 100)),
        cardNumber: (jarApiState as any).cardNumber || "4874 1000 3205 4507",
        cardNumbers: (jarApiState as any).cardNumbers || [(jarApiState as any).cardNumber || "4874 1000 3205 4507"],
        donateSiteUrl: (jarApiState as any).donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
        reportUrl: (jarApiState as any).reportUrl || "https://t.me/krrigalerts",
        showReportUrl: (jarApiState as any).showReportUrl !== undefined ? Boolean((jarApiState as any).showReportUrl) : true,
        closedGratitudeTitle: (jarApiState as any).closedGratitudeTitle || "Дякуємо за допомогу!",
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
  const {
    adminPassword,
    jarId,
    jarUrl,
    title,
    description,
    balanceUah,
    goalUah,
    monobankToken,
    logoUrl,
    isClosed,
    closedAt,
    closedReportTitle,
    closedReportText,
    closedGratitudeTitle,
    closedBalanceUah,
    closedGoalUah,
    closedPercentage,
    cardNumber,
    cardNumbers,
    donateSiteUrl,
    reportUrl,
    showReportUrl,
    ownerName,
  } = req.body;

  const inputHash = crypto.createHash("sha256").update(String(adminPassword || "")).digest("hex");
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const isHashValid = ALLOWED_PASSWORD_HASHES.includes(inputHash) || (envHash && inputHash === envHash);

  if (!isHashValid) {
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
  if (isClosed !== undefined) {
    (jarApiState as any).isClosed = Boolean(isClosed);
    if (isClosed && !(jarApiState as any).closedAt) {
      (jarApiState as any).closedAt = new Date().toISOString();
    }
  }
  if (closedAt !== undefined) (jarApiState as any).closedAt = closedAt;
  if (closedReportTitle !== undefined) (jarApiState as any).closedReportTitle = closedReportTitle.trim();
  if (closedReportText !== undefined) (jarApiState as any).closedReportText = closedReportText.trim();
  if (closedBalanceUah !== undefined) (jarApiState as any).closedBalanceUah = Number(closedBalanceUah);
  else if (isClosed && !(jarApiState as any).closedBalanceUah) (jarApiState as any).closedBalanceUah = Math.round(jarApiState.balance / 100);
  if (closedGoalUah !== undefined) (jarApiState as any).closedGoalUah = Number(closedGoalUah);
  else if (isClosed && !(jarApiState as any).closedGoalUah) (jarApiState as any).closedGoalUah = Math.round(jarApiState.goal / 100);
  if (closedPercentage !== undefined) (jarApiState as any).closedPercentage = Number(closedPercentage);
  else if (isClosed && !(jarApiState as any).closedPercentage) (jarApiState as any).closedPercentage = Math.round(((jarApiState.balance / 100) / (jarApiState.goal / 100 || 1)) * 100);
  if (cardNumber !== undefined) {
    (jarApiState as any).cardNumber = cardNumber.trim();
    if (cardNumbers === undefined && !(jarApiState as any).cardNumbers) {
      (jarApiState as any).cardNumbers = [cardNumber.trim()];
    }
  }
  if (cardNumbers !== undefined) {
    if (Array.isArray(cardNumbers)) {
      (jarApiState as any).cardNumbers = cardNumbers.map((c: string) => String(c).trim()).filter(Boolean);
    } else if (typeof cardNumbers === "string") {
      (jarApiState as any).cardNumbers = cardNumbers.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
    }
    if ((jarApiState as any).cardNumbers && (jarApiState as any).cardNumbers.length > 0) {
      (jarApiState as any).cardNumber = (jarApiState as any).cardNumbers[0];
    }
  }
  if (donateSiteUrl !== undefined) (jarApiState as any).donateSiteUrl = donateSiteUrl.trim();
  if (reportUrl !== undefined) (jarApiState as any).reportUrl = reportUrl.trim();
  if (showReportUrl !== undefined) (jarApiState as any).showReportUrl = Boolean(showReportUrl);
  if (closedGratitudeTitle !== undefined) (jarApiState as any).closedGratitudeTitle = closedGratitudeTitle.trim();
  if (ownerName !== undefined && ownerName.trim() !== "") jarApiState.ownerName = ownerName.trim();
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
