import fs from "fs";
import path from "path";

// In-memory cache for Vercel serverless / Node environment
let cachedJarState: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60000; // Monobank allows max 1 request per 60 seconds

const TEMP_CACHE_FILE = path.join("/tmp", "mono_jar_cache.json");

function getInitialConfig() {
  // 1. Try reading temp cache if exists
  try {
    if (fs.existsSync(TEMP_CACHE_FILE)) {
      const tempContent = fs.readFileSync(TEMP_CACHE_FILE, "utf8");
      const parsedTemp = JSON.parse(tempContent);
      if (parsedTemp && parsedTemp.balance) {
        return parsedTemp;
      }
    }
  } catch (e) {
    // Ignore temp read error
  }

  // 2. Try reading project jar-config.json
  try {
    const configPath = path.join(process.cwd(), "jar-config.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Could not read jar-config.json:", e);
  }

  return {
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
    balance: 3184048,
    goal: 4500000,
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
  };
}

function saveTempCache(data: any) {
  try {
    fs.writeFileSync(TEMP_CACHE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    // Ignore /tmp write errors in read-only environments
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  // Disable edge caching to ensure instant updates across devices
  res.setHeader("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const config = getInitialConfig();
  const token = (req.query.token as string) || process.env.MONOBANK_TOKEN || config.monobankToken || "";
  const publicJarSendId = config.sendId ? config.sendId.replace(/^jar\//, "") : "8cNidLyYfj";
  const jarSendId = (req.query.jarId as string) || process.env.JAR_SEND_ID || publicJarSendId;
  const jarAccountId = config.id || "ITGIelZbj1qFS92cC_BcCCCh9L_Pg1s";
  const forceRefresh = req.query.force === "true" || req.query.force === "1";

  let balanceKopecks = config.balance ?? 1952499;
  let goalKopecks = config.goal ?? 4500000;
  let jarTitle = config.title || "На РЕБ";
  let ownerName = config.ownerName || "Артем Г.";
  let fullDescription = config.description || "";
  let apiStatusMsg = token ? "Синхронізовано з Monobank API" : "Використовуються актуальні збережені дані";
  let donations: any[] = cachedJarState?.donations || config.donations || [];

  const now = Date.now();
  const isCacheFresh = cachedJarState && (now - lastFetchTime < CACHE_TTL_MS);

  // If cached data is fresh and force refresh is not requested, return cached state immediately
  if (isCacheFresh && !forceRefresh) {
    balanceKopecks = cachedJarState.balanceKopecks;
    goalKopecks = cachedJarState.goalKopecks;
    jarTitle = cachedJarState.jarTitle;
    apiStatusMsg = cachedJarState.apiStatusMsg || "Синхронізовано з Monobank API (з кешу)";
    donations = cachedJarState.donations || [];
  } else if (token && token.trim() !== "") {
    try {
      const monoRes = await fetch("https://api.monobank.ua/personal/client-info", {
        headers: { "X-Token": token.trim() },
      });

      if (monoRes.ok) {
        const clientData: any = await monoRes.json();
        const jars = clientData.jars || [];
        const cleanJarId = jarSendId.replace("jar/", "").trim();
        const matchedJar = jars.find((j: any) =>
          j.sendId === `jar/${cleanJarId}` ||
          j.id === cleanJarId ||
          (j.sendId && j.sendId.includes(cleanJarId)) ||
          (j.id && j.id.includes(cleanJarId))
        ) || jars[0];

        if (matchedJar) {
          balanceKopecks = matchedJar.balance ?? balanceKopecks;
          goalKopecks = matchedJar.goal ?? goalKopecks;
          jarTitle = matchedJar.title || jarTitle;
          apiStatusMsg = "Синхронізовано з Monobank API";

          // Try statement fetch for recent donations
          try {
            const nowSec = Math.floor(now / 1000);
            const thirtyDaysAgoSec = nowSec - 30 * 24 * 3600;
            const jarAccId = matchedJar.id || cleanJarId;

            const stmtRes = await fetch(
              `https://api.monobank.ua/personal/statement/${jarAccId}/${thirtyDaysAgoSec}`,
              { headers: { "X-Token": token.trim() } }
            );

            if (stmtRes.ok) {
              const statementData: any = await stmtRes.json();
              if (Array.isArray(statementData) && statementData.length > 0) {
                donations = statementData
                  .filter((item: any) => item && item.amount > 0)
                  .slice(0, 15)
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

                    const dateObj = new Date(item.time * 1000);
                    const diffMins = Math.floor((now - dateObj.getTime()) / (1000 * 60));
                    let timeStr = "";
                    if (diffMins < 2) timeStr = "щойно";
                    else if (diffMins < 60) timeStr = `${diffMins} хв тому`;
                    else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} год тому`;
                    else timeStr = dateObj.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });

                    return {
                      id: item.id || `stmt-${idx}`,
                      name: donorName,
                      amount: Math.round(item.amount / 100),
                      time: timeStr,
                      comment: item.comment || "",
                    };
                  });
              }
            }
          } catch (e) {
            console.warn("Statement fetch notice:", e);
          }

          cachedJarState = { balanceKopecks, goalKopecks, jarTitle, apiStatusMsg, donations };
          lastFetchTime = now;

          // Save to temp cache file so future lambda cold starts have the exact latest balance
          saveTempCache({
            ...config,
            balance: balanceKopecks,
            goal: goalKopecks,
            title: jarTitle,
            donations,
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (monoRes.status === 429) {
        apiStatusMsg = "Монобанк API: ліміт 1 запит/хв. Відображаються актуальні збережені дані";
        if (cachedJarState) {
          balanceKopecks = cachedJarState.balanceKopecks;
          goalKopecks = cachedJarState.goalKopecks;
          jarTitle = cachedJarState.jarTitle;
          donations = cachedJarState.donations || donations;
        }
      } else if (monoRes.status === 401 || monoRes.status === 403) {
        apiStatusMsg = "Помилка авторизації Monobank API. Відображаються поточні дані збору.";
      }
    } catch (e) {
      console.warn("Monobank API fetch warning on Vercel handler:", e);
      if (cachedJarState) {
        balanceKopecks = cachedJarState.balanceKopecks;
        goalKopecks = cachedJarState.goalKopecks;
        jarTitle = cachedJarState.jarTitle;
        donations = cachedJarState.donations || donations;
      }
    }
  }

  const balanceUah = Math.round(balanceKopecks / 100);
  const goalUah = Math.round(goalKopecks / 100);
  const remainingUah = Math.max(0, goalUah - balanceUah);
  const percentage = goalUah > 0 ? Math.min(100, Math.round((balanceUah / goalUah) * 100)) : 0;

  return res.status(200).json({
    success: true,
    apiEndpoint: "https://api.monobank.ua/personal/client-info",
    apiStatusMsg,
    rawMonobankResponse: {
      id: jarSendId,
      sendId: `jar/${jarSendId}`,
      title: jarTitle,
      description: fullDescription,
      currencyCode: 980,
      balance: balanceKopecks,
      goal: goalKopecks,
      ownerName,
      updatedAt: new Date().toISOString(),
      isClosed: Boolean(config.isClosed),
      closedAt: config.closedAt || "",
      closedReportTitle: config.closedReportTitle || "",
      closedReportText: config.closedReportText || "",
      closedBalanceUah: config.closedBalanceUah || balanceUah,
      closedGoalUah: config.closedGoalUah || goalUah,
      closedPercentage: config.closedPercentage || percentage,
      cardNumber: config.cardNumber || "4874 1000 3205 4507",
      donateSiteUrl: config.donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
    },
    parsed: {
      jarUrl: `https://send.monobank.ua/jar/${jarSendId}`,
      title: jarTitle,
      description: fullDescription,
      balanceUah,
      goalUah,
      currency: "UAH",
      percentage,
      remainingUah,
      logoUrl: config.logoUrl || "/logo.png",
      isClosed: Boolean(config.isClosed),
      closedAt: config.closedAt || "",
      closedReportTitle: config.closedReportTitle || "",
      closedReportText: config.closedReportText || "",
      closedBalanceUah: config.closedBalanceUah || balanceUah,
      closedGoalUah: config.closedGoalUah || goalUah,
      closedPercentage: config.closedPercentage || percentage,
      cardNumber: config.cardNumber || "4874 1000 3205 4507",
      donateSiteUrl: config.donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
    },
    donations,
  });
}

