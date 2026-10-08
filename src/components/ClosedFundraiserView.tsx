import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  Settings,
  ShieldCheck,
  Calendar,
  Target,
  Award,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  HeartHandshake,
} from "lucide-react";
import { ParsedMonobankData, RawMonobankResponse } from "../types";
import { StyledText } from "./StyledText";

interface ClosedFundraiserViewProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
  onOpenAdmin: () => void;
}

export const ClosedFundraiserView: React.FC<ClosedFundraiserViewProps> = ({
  parsed,
  raw,
  onOpenAdmin,
}) => {
  const [copiedCard, setCopiedCard] = useState<boolean>(false);
  const logoSrc = parsed.logoUrl || "/logo.png";

  const cardNumber = parsed.cardNumber || raw.cardNumber || "4874 1000 3205 4507";
  const donateSiteUrl = parsed.donateSiteUrl || raw.donateSiteUrl || "https://donate.krrigalerts.pp.ua/";

  const rawCardDigits = cardNumber.replace(/\s+/g, "");
  // Formatted with spaces every 4 digits
  const cardNumberFormatted = rawCardDigits.replace(/(\d{4})/g, "$1 ").trim();

  const handleCopyCard = () => {
    navigator.clipboard.writeText(rawCardDigits);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2200);
  };

  // Gratitude text written by admin (or heartfelt default)
  const gratitudeText =
    parsed.closedReportText ||
    raw.closedReportText ||
    "Щиро дякуємо кожному за участь у зборі, за кожен донат, репост та слова підтримки! Завдяки вашій неймовірній небайдужості цей **збір закрито**. Ви — справжній щит і **надійний тил** наших захисників! Разом до перемоги! 🇺🇦";

  // Exact figures captured at the moment of closing
  const finalBalance = parsed.closedBalanceUah || raw.closedBalanceUah || parsed.balanceUah;
  const finalGoal = parsed.closedGoalUah || raw.closedGoalUah || parsed.goalUah || 1;
  const finalPercentage =
    parsed.closedPercentage ||
    raw.closedPercentage ||
    Math.round((finalBalance / finalGoal) * 100);

  const closedDateFormatted = (parsed.closedAt || raw.closedAt)
    ? new Date(parsed.closedAt || raw.closedAt || "").toLocaleString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <div className="min-h-screen flex flex-col justify-between items-center text-center px-4 py-8 sm:py-14 relative z-10">
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[450px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Centered Content */}
      <main className="w-full max-w-3xl flex flex-col items-center my-auto space-y-6 sm:space-y-7">
        {/* 1. В ЦЕНТРІ ЛОГО */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex flex-col items-center"
        >
          <div className="relative p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-md">
            <img
              src={logoSrc}
              alt="Logo"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain rounded-2xl drop-shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith("/logo.png")) {
                  target.src = "/logo.png";
                }
              }}
            />
          </div>

          <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-lg">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Збір закрито</span>
          </div>
        </motion.div>

        {/* 2. ВЕЛИКИЙ НАПИС ПРО ДЯКУВАННЯ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="space-y-4 max-w-2xl px-2"
        >
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Дякуємо за допомогу!
          </h1>

          <div className="text-base sm:text-xl md:text-2xl font-bold text-slate-200 leading-relaxed font-sans tracking-normal">
            <StyledText text={gratitudeText} />
          </div>
        </motion.div>

        {/* РЕКВІЗИТИ (КАРТА МОНОБАНКА) ТА ТЕМАТИЧНА КНОПКА ПЕРЕХОДУ НА САЙТ ДОНАТІВ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
          className="w-full max-w-xl space-y-3 px-1"
        >
          {/* Картка Монобанку з копіюванням */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all text-left">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-semibold">
                    Реквізити для донатів
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Картка Monobank
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">
                  Отримувач:
                </span>
                <span className="text-xs font-semibold text-slate-300 block truncate max-w-[170px] sm:max-w-none">
                  {raw.ownerName || "Артем Г."}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 mt-1.5 shadow-inner">
              <span className="font-mono text-base sm:text-xl font-black text-amber-300 tracking-wider select-all">
                {cardNumberFormatted}
              </span>
              <button
                type="button"
                onClick={handleCopyCard}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  copiedCard
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 active:scale-95"
                }`}
                title="Скопіювати номер картки"
              >
                {copiedCard ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Скопійовано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопіювати</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Тематична кнопка на сайт донатів https://donate.krrigalerts.pp.ua/ */}
          <a
            href={donateSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between w-full p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:via-sky-500 hover:to-blue-500 text-white font-sans shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] border border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm sm:text-base font-black tracking-tight leading-snug">
                  Підтримати збори спільноти
                </div>
                <div className="text-[11px] sm:text-xs text-cyan-100 font-mono flex items-center gap-1.5 truncate">
                  <span>donate.krrigalerts.pp.ua</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 border border-white/30 text-xs font-bold font-mono group-hover:bg-white/30 transition-colors shrink-0">
              <span className="hidden sm:inline">Перейти</span>
              <ExternalLink className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>
        </motion.div>

        {/* 3. ВІЗУАЛІЗАЦІЯ % БАНКИ ТА СУМИ НА МОМЕНТ ЗАКРИТТЯ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Стан банки на момент закриття:
            </span>
            <span className="text-amber-400 font-bold font-mono">
              {finalPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-0.5 border border-slate-800 relative shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(finalPercentage, 10))}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 relative shadow-[0_0_16px_rgba(245,158,11,0.7)]"
              />
            </div>
          </div>

          {/* Metrics: Exact Sum and Goal */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Зібрано на момент закриття
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                {finalBalance.toLocaleString()}{" "}
                <span className="text-xs font-bold text-slate-400">₴</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-center">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-sky-400" />
                Ціль збору
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono mt-1">
                {finalGoal.toLocaleString()}{" "}
                <span className="text-xs font-bold text-slate-400">₴</span>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Збір закрито: {closedDateFormatted}</span>
          </div>
        </motion.div>
      </main>

      {/* Discreet Footer (Admin Trigger & Verification) */}
      <footer className="w-full max-w-3xl pt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 font-mono mt-8">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
          <span>Кривий Ріг Оповіщення / АЛЕРТС</span>
        </div>

        <button
          onClick={onOpenAdmin}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer text-[11px]"
          title="Панель адміністратора"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Керування</span>
        </button>
      </footer>
    </div>
  );
};
