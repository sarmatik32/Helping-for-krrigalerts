import React, { useState, useEffect } from "react";
import { FileText, Share2 } from "lucide-react";

import { LogoHeader } from "./components/LogoHeader";
import { ProgressSection } from "./components/ProgressSection";
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
    title: "Збір на 10 комплектів РЕБ для розвідників 129 ОБр ТрО",
    description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен вашій пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
    currencyCode: 980,
    balance: 1000,
    goal: 4500000,
    ownerName: "Сергій К. (Кривий Ріг Оповіщення / АЛЕРТС)",
    updatedAt: new Date().toISOString(),
  },
  parsed: {
    jarUrl: "https://send.monobank.ua/jar/8cNidLyYfj",
    title: "Збір на 10 комплектів РЕБ для розвідників 129 ОБр ТрО",
    description: `Друзі, звертаємося до кожного з вас.
Наш побратим спільноти зараз виконує бойові завдання у складі розвідроти на Слов’янському напрямку. Для безпеки, вчасного виявлення ворожих «пташок» та збереження життя терміново потрібен портативний детектор дронів (засіб РЕР).

🎯 Мета збору: придбати якісний аналізатор частот («Щезник 4М», «Чуйка», «Хантер 3» або аналог) — залежно від зібраної суми.
⚡️ Від себе: команда адмінів уже вклала перші кошти, щоб запустити збір.

Якщо ви не маєте змоги підтримати гривнею — дуже просимо про максимальний розголос та репост. Кожна гривня та кожен вашій пошир — це реальний шанс захистити розвідників на передку. Разом до перемоги! 🇺🇦`,
    balanceUah: 10,
    goalUah: 45000,
    currency: "UAH",
    percentage: 0,
    remainingUah: 44990,
    logoUrl: "/logo.png",
  },
  donations: [],
};

const getInitialData = (): MonobankApiResponse => {
  try {
    const localSaved = localStorage.getItem("mono_jar_local_data");
    if (localSaved) {
      const parsedData = JSON.parse(localSaved);
      if (parsedData && parsedData.parsed) {
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

  // Load Monobank Jar API data
  const fetchMonoJarData = async () => {
    try {
      const res = await fetch("/api/mono/jar-info");
      if (res.ok) {
        const result: MonobankApiResponse = await res.json();
        if (result && result.parsed) {
          setMonoApiResponse(result);
          try {
            localStorage.setItem("mono_jar_local_data", JSON.stringify(result));
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
    fetchMonoJarData();
  }, []);

  const handleRefreshMono = async () => {
    setIsRefreshing(true);
    await fetchMonoJarData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSaveAdminConfig = async (updatedFields: any) => {
    try {
      const res = await fetch("/api/mono/jar-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        await fetchMonoJarData();
        return;
      }
    } catch (err) {
      console.warn("Server API not available for update, saving locally:", err);
    }

    // Local state fallback for admin editing on static deployments
    const newBalanceUah = Number(updatedFields.balanceUah) || monoApiResponse.parsed.balanceUah;
    const newGoalUah = Number(updatedFields.goalUah) || monoApiResponse.parsed.goalUah;
    const newRemaining = Math.max(0, newGoalUah - newBalanceUah);
    const newPct = newGoalUah > 0 ? Math.min(100, Math.round((newBalanceUah / newGoalUah) * 100)) : 0;

    const updatedResponse: MonobankApiResponse = {
      ...monoApiResponse,
      rawMonobankResponse: {
        ...monoApiResponse.rawMonobankResponse,
        title: updatedFields.title || monoApiResponse.rawMonobankResponse.title,
        description: updatedFields.description || monoApiResponse.rawMonobankResponse.description,
        balance: newBalanceUah * 100,
        goal: newGoalUah * 100,
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
      },
    };

    setMonoApiResponse(updatedResponse);
    try {
      localStorage.setItem("mono_jar_local_data", JSON.stringify(updatedResponse));
    } catch (e) {}
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Animated flying drones background */}
      <DroneBackgroundAnimation />

      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-sky-950/20 via-blue-950/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Centered Logo Header */}
        <LogoHeader logoUrl={parsed.logoUrl} />

        {/* Row of 2 balanced cards: ProgressSection ("Збір коштів активний") & DonationQuickPay ("Оплата в Банку Monobank") */}
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

          <div className="text-slate-200 text-sm sm:text-base whitespace-pre-line leading-relaxed font-sans">
            {parsed.description}
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
