import React, { useState, useEffect } from "react";
import { FileText, Share2 } from "lucide-react";

import { LogoHeader } from "./components/LogoHeader";
import { ProgressSection } from "./components/ProgressSection";
import { ClosedFundraiserView } from "./components/ClosedFundraiserView";
import { StyledText } from "./components/StyledText";
import { DonationTicker } from "./components/DonationTicker";
import { EquipmentMatrix } from "./components/EquipmentMatrix";
import { SocialShareSection } from "./components/SocialShareSection";
import { DonationQuickPay } from "./components/DonationQuickPay";
import { ShareModal } from "./components/ShareModal";
import { AdminSettingsModal } from "./components/AdminSettingsModal";
import { Footer } from "./components/Footer";
import { DroneBackgroundAnimation } from "./components/DroneBackgroundAnimation";
import { MonobankApiResponse } from "./types";

const DEFAULT_JAR_DATA: MonobankApiResponse = {
  success: true,
  apiEndpoint: "https://send.monobank.ua/jar/8cNidLyYfj",
  apiStatusMsg: "Синхронізовано з Monobank API",
  rawMonobankResponse: {
    id: "8cNidLyYfj",
    sendId: "8cNidLyYfj",
    title: "На РЕБ",
    description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен ваш пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
    currencyCode: 980,
    balance: 3184048,
    goal: 4500000,
    ownerName: "Артем Г.",
    isClosed: true,
    closedAt: "2026-10-08T05:23:57.297Z",
    closedReportTitle: "Збір успішно завершено! Мета досягнута!",
    closedReportText: `Збір закриваємо, час вже не на нашому боці, вже **вкрай необхідно**. Закрили потребу, вже здійснили закуп та відправлення на позицію.
Поки збирали, **Чуйка** випустила **версію 4.0** (яку і купили).
Збір, на жаль, будемо закривати на [green]70%[/green], остаточну суму закрили коштами військових та банку.
Сума не ==45к==, а ==60к== — але то вже нюанси. Хоч і чутливі.

Дякуємо всім, хто долучився! **Завтра повний звіт.**
Хто ще має бажання долучитися — ще не пізно, будемо вдячні за **кожну гривню** 🫶`,
    closedBalanceUah: 31840,
    closedGoalUah: 45000,
    closedPercentage: 71,
    cardNumber: "4874 1000 3205 4507",
    donateSiteUrl: "https://donate.krrigalerts.pp.ua/",
    updatedAt: new Date().toISOString(),
  },
  parsed: {
    jarUrl: "https://send.monobank.ua/jar/8cNidLyYfj",
    title: "На РЕБ",
    description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен ваш пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
    balanceUah: 31840,
    goalUah: 45000,
    currency: "UAH",
    percentage: 71,
    remainingUah: 13160,
    logoUrl: "/logo.png",
    isClosed: true,
    closedAt: "2026-10-08T05:23:57.297Z",
    closedReportTitle: "Збір успішно завершено! Мета досягнута!",
    closedReportText: `Збір закриваємо, час вже не на нашому боці, вже **вкрай необхідно**. Закрили потребу, вже здійснили закуп та відправлення на позицію.
Поки збирали, **Чуйка** випустила **версію 4.0** (яку і купили).
Збір, на жаль, будемо закривати на [green]70%[/green], остаточну суму закрили коштами військових та банку.
Сума не ==45к==, а ==60к== — але то вже нюанси. Хоч і чутливі.

Дякуємо всім, хто долучився! **Завтра повний звіт.**
Хто ще має бажання долучитися — ще не пізно, будемо вдячні за **кожну гривню** 🫶`,
    closedBalanceUah: 31840,
    closedGoalUah: 45000,
    closedPercentage: 71,
    cardNumber: "4874 1000 3205 4507",
    donateSiteUrl: "https://donate.krrigalerts.pp.ua/",
    ownerName: "Артем Г.",
  },
  donations: [],
};

const CACHE_STORAGE_KEY = "mono_jar_local_data_v6";

const getInitialData = (): MonobankApiResponse => {
  try {
    // Clear old legacy keys
    [
      "mono_jar_local_data",
      "mono_jar_local_data_v2",
      "mono_jar_local_data_v3",
      "mono_jar_local_data_v4",
      "mono_jar_local_data_v5",
    ].forEach((key) => {
      localStorage.removeItem(key);
    });

    const localSaved = localStorage.getItem(CACHE_STORAGE_KEY);
    if (localSaved) {
      const parsedData = JSON.parse(localSaved);
      if (parsedData && parsedData.parsed && typeof parsedData.parsed.balanceUah === "number" && parsedData.parsed.balanceUah > 20) {
        return parsedData;
      }
    }
  } catch (e) {
    console.warn("Could not load local storage data:", e);
  }
  return DEFAULT_JAR_DATA;
};

export default function App() {
  const [monoApiResponse, setMonoApiResponse] = useState<MonobankApiResponse>(getInitialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [lastClientFetch, setLastClientFetch] = useState<number>(0);

  // Load Monobank Jar API data with client-side caching & rate-limiting guard
  const fetchMonoJarData = async (force: boolean = false) => {
    const now = Date.now();
    // Prevent spamming requests within 10 seconds on client unless forced
    if (!force && lastClientFetch > 0 && now - lastClientFetch < 60000) {
      return;
    }

    try {
      const url = force ? `/api/mono/jar-info?force=true&t=${now}` : `/api/mono/jar-info?t=${now}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const result: MonobankApiResponse = await res.json();
        if (result && result.parsed) {
          setMonoApiResponse((prev) => {
            const prevUpdated = prev.rawMonobankResponse?.updatedAt
              ? new Date(prev.rawMonobankResponse.updatedAt).getTime()
              : 0;
            const newUpdated = result.rawMonobankResponse?.updatedAt
              ? new Date(result.rawMonobankResponse.updatedAt).getTime()
              : 0;

            const useServerText = newUpdated >= prevUpdated;

            const merged: MonobankApiResponse = {
              ...prev,
              ...result,
              rawMonobankResponse: {
                ...result.rawMonobankResponse,
                closedReportText: useServerText
                  ? (result.rawMonobankResponse?.closedReportText || prev.rawMonobankResponse?.closedReportText)
                  : prev.rawMonobankResponse?.closedReportText,
                closedReportTitle: useServerText
                  ? (result.rawMonobankResponse?.closedReportTitle || prev.rawMonobankResponse?.closedReportTitle)
                  : prev.rawMonobankResponse?.closedReportTitle,
                ownerName: result.rawMonobankResponse?.ownerName || prev.rawMonobankResponse?.ownerName || "Артем Г.",
              },
              parsed: {
                ...prev.parsed,
                ...result.parsed,
                balanceUah: result.parsed.balanceUah || prev.parsed.balanceUah,
                goalUah: result.parsed.goalUah || prev.parsed.goalUah,
                closedReportText: useServerText
                  ? (result.parsed?.closedReportText || prev.parsed?.closedReportText)
                  : prev.parsed?.closedReportText,
                closedReportTitle: useServerText
                  ? (result.parsed?.closedReportTitle || prev.parsed?.closedReportTitle)
                  : prev.parsed?.closedReportTitle,
                ownerName: result.parsed?.ownerName || prev.parsed?.ownerName || "Артем Г.",
              },
              donations: result.donations && result.donations.length > 0 ? result.donations : prev.donations,
            };

            try {
              localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}

            return merged;
          });
          setLastClientFetch(now);
        }
      }
    } catch (err) {
      // Quiet fallback for static hosts without backend API
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonoJarData();
  }, []);

  const handleRefreshMono = async () => {
    setIsRefreshing(true);
    await fetchMonoJarData(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSaveAdminConfig = async (updatedFields: any) => {
    // 1. Immediately calculate and apply updated state so text changes instantly in UI!
    const newBalanceUah = Number(updatedFields.balanceUah) || monoApiResponse.parsed.balanceUah;
    const newGoalUah = Number(updatedFields.goalUah) || monoApiResponse.parsed.goalUah;
    const newRemaining = Math.max(0, newGoalUah - newBalanceUah);
    const newPct = newGoalUah > 0 ? Math.min(100, Math.round((newBalanceUah / newGoalUah) * 100)) : 0;
    const newIsClosed = updatedFields.isClosed !== undefined ? Boolean(updatedFields.isClosed) : monoApiResponse.parsed.isClosed;

    const snapBal = Number(updatedFields.closedBalanceUah) || newBalanceUah;
    const snapGoal = Number(updatedFields.closedGoalUah) || newGoalUah;
    const snapPct = updatedFields.closedPercentage !== undefined
      ? Number(updatedFields.closedPercentage)
      : (snapGoal > 0 ? Math.round((snapBal / snapGoal) * 100) : 100);

    const nowIso = new Date().toISOString();

    const updatedResponse: MonobankApiResponse = {
      ...monoApiResponse,
      rawMonobankResponse: {
        ...monoApiResponse.rawMonobankResponse,
        title: updatedFields.title || monoApiResponse.rawMonobankResponse.title,
        description: updatedFields.description || monoApiResponse.rawMonobankResponse.description,
        balance: newBalanceUah * 100,
        goal: newGoalUah * 100,
        isClosed: newIsClosed,
        closedAt: updatedFields.closedAt !== undefined ? updatedFields.closedAt : monoApiResponse.rawMonobankResponse.closedAt,
        closedReportTitle: updatedFields.closedReportTitle !== undefined ? updatedFields.closedReportTitle : monoApiResponse.rawMonobankResponse.closedReportTitle,
        closedReportText: updatedFields.closedReportText !== undefined ? updatedFields.closedReportText : monoApiResponse.rawMonobankResponse.closedReportText,
        closedBalanceUah: snapBal,
        closedGoalUah: snapGoal,
        closedPercentage: snapPct,
        cardNumber: updatedFields.cardNumber !== undefined ? updatedFields.cardNumber : monoApiResponse.rawMonobankResponse.cardNumber,
        donateSiteUrl: updatedFields.donateSiteUrl !== undefined ? updatedFields.donateSiteUrl : monoApiResponse.rawMonobankResponse.donateSiteUrl,
        ownerName: updatedFields.ownerName !== undefined ? updatedFields.ownerName : monoApiResponse.rawMonobankResponse.ownerName,
        updatedAt: nowIso,
      },
      parsed: {
        ...monoApiResponse.parsed,
        jarUrl: updatedFields.jarUrl || monoApiResponse.parsed.jarUrl,
        title: updatedFields.title || monoApiResponse.parsed.title,
        description: updatedFields.description || monoApiResponse.parsed.description,
        balanceUah: newBalanceUah,
        goalUah: newGoalUah,
        remainingUah: newRemaining,
        percentage: newPct,
        logoUrl: updatedFields.logoUrl !== undefined ? updatedFields.logoUrl : monoApiResponse.parsed.logoUrl,
        isClosed: newIsClosed,
        closedAt: updatedFields.closedAt !== undefined ? updatedFields.closedAt : monoApiResponse.parsed.closedAt,
        closedReportTitle: updatedFields.closedReportTitle !== undefined ? updatedFields.closedReportTitle : monoApiResponse.parsed.closedReportTitle,
        closedReportText: updatedFields.closedReportText !== undefined ? updatedFields.closedReportText : monoApiResponse.parsed.closedReportText,
        closedBalanceUah: snapBal,
        closedGoalUah: snapGoal,
        closedPercentage: snapPct,
        cardNumber: updatedFields.cardNumber !== undefined ? updatedFields.cardNumber : monoApiResponse.parsed.cardNumber,
        donateSiteUrl: updatedFields.donateSiteUrl !== undefined ? updatedFields.donateSiteUrl : monoApiResponse.parsed.donateSiteUrl,
        ownerName: updatedFields.ownerName !== undefined ? updatedFields.ownerName : monoApiResponse.parsed.ownerName,
      },
    };

    setMonoApiResponse(updatedResponse);
    setLastClientFetch(Date.now());
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updatedResponse));
    } catch (e) {}

    // 2. Persist to backend server API
    try {
      await fetch("/api/mono/jar-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.warn("Server API not available for update, saved locally:", err);
    }
  };

  if (isLoading || !monoApiResponse) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-sky-300 font-mono">
            Завантаження даних збору...
          </span>
        </div>
      </div>
    );
  }

  const { parsed, rawMonobankResponse, donations } = monoApiResponse;

  // When fundraiser is CLOSED: strictly display centered logo, big gratitude inscription, visualization of jar % & sum at closure, and NOTHING ELSE!
  if (parsed.isClosed) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
        {/* Animated flying drones background */}
        <DroneBackgroundAnimation />

        <ClosedFundraiserView
          parsed={parsed}
          raw={rawMonobankResponse}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Admin settings modal to allow management or reopening */}
        <AdminSettingsModal
          parsed={parsed}
          raw={rawMonobankResponse}
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onSave={handleSaveAdminConfig}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Animated flying drones background */}
      <DroneBackgroundAnimation />

      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-sky-950/20 via-blue-950/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Centered Logo Header */}
        <LogoHeader logoUrl={parsed.logoUrl} />

        {/* Row of 2 balanced cards: ProgressSection & DonationQuickPay */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-stretch">
          <ProgressSection
            parsed={parsed}
            raw={rawMonobankResponse}
            apiStatusMsg={monoApiResponse.apiStatusMsg}
            onRefreshMono={handleRefreshMono}
            onOpenEdit={() => setIsAdminOpen(true)}
            isRefreshing={isRefreshing}
          />

          <DonationQuickPay parsed={parsed} raw={rawMonobankResponse} />
        </div>

        {/* Ticker marquee right below the main funding cards */}
        <DonationTicker donations={donations} />

        {/* Jar Description Box */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md my-6 space-y-4 leading-relaxed">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <FileText className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg sm:text-xl text-white font-bold">
                Опис збору
              </h2>
            </div>
          </div>

          <div className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
            <StyledText text={parsed.description} />
          </div>
        </section>

        {/* Equipment Matrix (Блок з видами РЕБ / РЕР) */}
        <EquipmentMatrix />

        {/* Social Share Section (Поділитись в соцмережах) */}
        <SocialShareSection parsed={parsed} raw={rawMonobankResponse} />

        {/* Footer */}
        <Footer
          onOpenShare={() => setIsShareOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />
      </div>

      {/* Floating Bottom Quick Bar on Mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800 p-3 flex items-center justify-between gap-3 sm:hidden z-40 backdrop-blur-md">
        <a
          href={parsed.jarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black text-xs text-center shadow-lg"
        >
          💳 Поповнити Банку Mono ({parsed.balanceUah.toLocaleString()} / {parsed.goalUah.toLocaleString()} ₴)
        </a>

        <button
          onClick={() => setIsShareOpen(true)}
          className="p-3 rounded-xl bg-slate-800 text-sky-300 border border-slate-700 font-bold text-xs shrink-0 flex items-center gap-1.5"
        >
          <Share2 className="w-4 h-4" />
          <span>Поширити</span>
        </button>
      </div>

      {/* Modals */}
      <ShareModal
        parsed={parsed}
        raw={rawMonobankResponse}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <AdminSettingsModal
        parsed={parsed}
        raw={rawMonobankResponse}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSave={handleSaveAdminConfig}
      />
    </div>
  );
}
