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

export default function App() {
  const [monoApiResponse, setMonoApiResponse] = useState<MonobankApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Load Monobank Jar API data
  const fetchMonoJarData = async () => {
    try {
      const res = await fetch("/api/mono/jar-info");
      if (res.ok) {
        const result: MonobankApiResponse = await res.json();
        if (result.success) {
          setMonoApiResponse(result);
        }
      }
    } catch (err) {
      console.error("Error fetching Monobank Jar API data:", err);
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
      }
    } catch (err) {
      console.error("Error updating Monobank config:", err);
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Animated flying drones background */}
      <DroneBackgroundAnimation />

      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-sky-950/20 via-blue-950/10 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Centered Logo Header */}
        <LogoHeader logoUrl={parsed.logoUrl} />

        {/* Live Progress Section */}
        <ProgressSection
          parsed={parsed}
          raw={rawMonobankResponse}
          apiStatusMsg={monoApiResponse.apiStatusMsg}
          onRefreshMono={handleRefreshMono}
          onOpenEdit={() => setIsAdminOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Ticker marquee right below the Jar progress block */}
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

        {/* Direct Payment & QR Code Card for Monobank Jar */}
        <DonationQuickPay parsed={parsed} raw={rawMonobankResponse} />

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
