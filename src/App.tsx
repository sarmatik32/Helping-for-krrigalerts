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
import rootConfig from "../jar-config.json";

function buildJarDataFromConfig(cfg: any): MonobankApiResponse {
  const balanceKopecks = Number(cfg.balance) || 3184048;
  const goalKopecks = Number(cfg.goal) || 4500000;
  const balanceUah = Math.round(balanceKopecks / 100);
  const goalUah = Math.round(goalKopecks / 100);
  const remainingUah = Math.max(0, goalUah - balanceUah);
  const percentage = goalUah > 0 ? Math.min(100, Math.round((balanceUah / goalUah) * 100)) : 0;
  const rawCards = (cfg.cardNumbers && Array.isArray(cfg.cardNumbers) && cfg.cardNumbers.length > 0)
    ? cfg.cardNumbers
    : [cfg.cardNumber || "4874 1000 3205 4507"];

  const primaryCard = cfg.cardNumber || rawCards[0] || "4874 1000 3205 4507";
  const syncedCards = rawCards[0] !== primaryCard ? [primaryCard, ...rawCards.filter((c: string) => c !== primaryCard)] : rawCards;

  return {
    success: true,
    apiEndpoint: cfg.jarUrl || "https://send.monobank.ua/jar/8cNidLyYfj",
    apiStatusMsg: "Синхронізовано з Monobank API",
    rawMonobankResponse: {
      id: cfg.id || "8cNidLyYfj",
      sendId: cfg.sendId || "jar/8cNidLyYfj",
      title: cfg.title || "На РЕБ",
      description: cfg.description || "",
      currencyCode: cfg.currencyCode || 980,
      balance: balanceKopecks,
      goal: goalKopecks,
      ownerName: cfg.ownerName || "Артем Г.",
      isClosed: Boolean(cfg.isClosed),
      closedAt: cfg.closedAt || "",
      closedReportTitle: cfg.closedReportTitle || "Збір успішно завершено! Мета досягнута!",
      closedReportText: cfg.closedReportText || "",
      closedBalanceUah: cfg.closedBalanceUah || balanceUah,
      closedGoalUah: cfg.closedGoalUah || goalUah,
      closedPercentage: cfg.closedPercentage || percentage,
      cardNumber: primaryCard,
      cardNumbers: syncedCards,
      donateSiteUrl: cfg.donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
      reportUrl: cfg.reportUrl || "https://t.me/krrigalerts",
      showReportUrl: cfg.showReportUrl !== undefined ? Boolean(cfg.showReportUrl) : false,
      closedGratitudeTitle: cfg.closedGratitudeTitle || "Дякуємо за допомогу!",
      updatedAt: cfg.updatedAt || new Date().toISOString(),
    },
    parsed: {
      jarUrl: cfg.jarUrl || "https://send.monobank.ua/jar/8cNidLyYfj",
      title: cfg.title || "На РЕБ",
      description: cfg.description || "",
      balanceUah,
      goalUah,
      currency: "UAH",
      percentage,
      remainingUah,
      logoUrl: cfg.logoUrl || "/logo.png",
      isClosed: Boolean(cfg.isClosed),
      closedAt: cfg.closedAt || "",
      closedReportTitle: cfg.closedReportTitle || "Збір успішно завершено! Мета досягнута!",
      closedReportText: cfg.closedReportText || "",
      closedBalanceUah: cfg.closedBalanceUah || balanceUah,
      closedGoalUah: cfg.closedGoalUah || goalUah,
      closedPercentage: cfg.closedPercentage || percentage,
      cardNumber: primaryCard,
      cardNumbers: syncedCards,
      donateSiteUrl: cfg.donateSiteUrl || "https://donate.krrigalerts.pp.ua/",
      reportUrl: cfg.reportUrl || "https://t.me/krrigalerts",
      showReportUrl: cfg.showReportUrl !== undefined ? Boolean(cfg.showReportUrl) : false,
      closedGratitudeTitle: cfg.closedGratitudeTitle || "Дякуємо за допомогу!",
      ownerName: cfg.ownerName || "Артем Г.",
    },
    donations: [],
  };
}

const DEFAULT_JAR_DATA: MonobankApiResponse = buildJarDataFromConfig(rootConfig);

const CACHE_STORAGE_KEY = "mono_jar_local_data_v8";

const getInitialData = (): MonobankApiResponse => {
  try {
    const localSaved = localStorage.getItem(CACHE_STORAGE_KEY);
    if (localSaved) {
      const parsedData = JSON.parse(localSaved);
      if (parsedData && parsedData.parsed && typeof parsedData.parsed.balanceUah === "number") {
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
    // Allow forced updates anytime; rate-limit background checks to 10s
    if (!force && lastClientFetch > 0 && now - lastClientFetch < 10000) {
      return;
    }

    try {
      const url = force ? `/api/mono/jar-info?force=true&t=${now}` : `/api/mono/jar-info?t=${now}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const result: MonobankApiResponse = await res.json();
        if (result && result.parsed) {
          const rawSingle = (result.parsed.cardNumber || result.rawMonobankResponse?.cardNumber || "").trim();
          const rawCards = (result.parsed.cardNumbers && result.parsed.cardNumbers.length > 0)
            ? result.parsed.cardNumbers
            : (result.rawMonobankResponse?.cardNumbers && result.rawMonobankResponse.cardNumbers.length > 0)
              ? result.rawMonobankResponse.cardNumbers
              : [rawSingle || "4874 1000 3205 4507"];

          const syncedCards = rawSingle && rawCards[0] !== rawSingle
            ? [rawSingle, ...rawCards.filter((c: string) => c !== rawSingle)]
            : rawCards;

          result.parsed.cardNumbers = syncedCards;
          result.parsed.cardNumber = syncedCards[0];
          if (result.rawMonobankResponse) {
            result.rawMonobankResponse.cardNumbers = syncedCards;
            result.rawMonobankResponse.cardNumber = syncedCards[0];
          }

          setMonoApiResponse(result);
          setLastClientFetch(now);
          try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(result));
          } catch (e) {}
        }
      }
    } catch (err) {
      // Quiet fallback for static hosts without backend API
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonoJarData(true);
  }, []);

  const handleRefreshMono = async () => {
    setIsRefreshing(true);
    await fetchMonoJarData(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSaveAdminConfig = async (updatedFields: any) => {
    // 1. Send update to backend server API
    const res = await fetch("/api/mono/jar-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Помилка збереження (${res.status})`);
    }

    // 2. Immediately re-fetch fresh state from server so UI and disk are 100% in sync
    await fetchMonoJarData(true);
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
