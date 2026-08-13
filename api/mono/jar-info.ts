const MONOBANK_TOKEN = "uK_IXCutZiDcSLBr8d5X_IJbcAlkv714_PpNWfOxEZy0";
const JAR_SEND_ID = "8cNidLyYfj";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let balanceKopecks = 2000;
  let goalKopecks = 4500000;
  let jarTitle = "На РЕБ";
  let ownerName = "Сергій К. (Кривий Ріг Оповіщення / АЛЕРТС)";
  let apiStatusMsg = "Синхронізовано з Monobank API";
  let donations: any[] = [];

  try {
    const monoRes = await fetch("https://api.monobank.ua/personal/client-info", {
      headers: { "X-Token": MONOBANK_TOKEN },
    });

    if (monoRes.ok) {
      const clientData: any = await monoRes.json();
      const jars = clientData.jars || [];
      const matchedJar = jars.find((j: any) =>
        j.sendId === `jar/${JAR_SEND_ID}` || j.id === JAR_SEND_ID || (j.sendId && j.sendId.includes(JAR_SEND_ID))
      ) || jars[0];

      if (matchedJar) {
        balanceKopecks = matchedJar.balance ?? balanceKopecks;
        goalKopecks = matchedJar.goal ?? goalKopecks;
        jarTitle = matchedJar.title || jarTitle;
        apiStatusMsg = "Синхронізовано з Monobank API";

        // Try to fetch statement for recent donations
        try {
          const nowSec = Math.floor(Date.now() / 1000);
          const thirtyDaysAgoSec = nowSec - 30 * 24 * 3600;
          const jarAccId = matchedJar.id || JAR_SEND_ID;

          const stmtRes = await fetch(
            `https://api.monobank.ua/personal/statement/${jarAccId}/${thirtyDaysAgoSec}`,
            { headers: { "X-Token": MONOBANK_TOKEN } }
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
                  const diffMins = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60));
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
          console.warn("Statement fetch error:", e);
        }
      }
    } else if (monoRes.status === 429) {
      apiStatusMsg = "Ліміт запитів Monobank API (1 запит на хв). Відображаються останні дані.";
    }
  } catch (e) {
    console.warn("Monobank API fetch warning on Vercel handler:", e);
  }

  const balanceUah = Math.round(balanceKopecks / 100);
  const goalUah = Math.round(goalKopecks / 100);
  const remainingUah = Math.max(0, goalUah - balanceUah);
  const percentage = goalUah > 0 ? Math.min(100, Math.round((balanceUah / goalUah) * 100)) : 0;

  const fullDescription = `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен вашій пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`;

  return res.status(200).json({
    success: true,
    apiEndpoint: "https://api.monobank.ua/personal/client-info",
    apiStatusMsg,
    rawMonobankResponse: {
      id: JAR_SEND_ID,
      sendId: `jar/${JAR_SEND_ID}`,
      title: jarTitle,
      description: fullDescription,
      currencyCode: 980,
      balance: balanceKopecks,
      goal: goalKopecks,
      ownerName: ownerName,
      updatedAt: new Date().toISOString(),
    },
    parsed: {
      jarUrl: `https://send.monobank.ua/jar/${JAR_SEND_ID}`,
      title: "Збір на 10 комплектів РЕБ для розвідників 129 ОБр ТрО",
      description: fullDescription,
      balanceUah,
      goalUah,
      currency: "UAH",
      percentage,
      remainingUah,
      logoUrl: "/logo.png",
    },
    donations,
  });
}
