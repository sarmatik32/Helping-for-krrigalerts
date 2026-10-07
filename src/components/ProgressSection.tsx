import React from "react";
import { motion } from "motion/react";
import { RefreshCw, ExternalLink, Target, Sparkles, Hourglass, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import { ParsedMonobankData, RawMonobankResponse } from "../types";

interface ProgressSectionProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
  apiStatusMsg?: string;
  onRefreshMono: () => void;
  onOpenEdit?: () => void;
  isRefreshing: boolean;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  parsed,
  onRefreshMono,
  isRefreshing,
}) => {
  const isClosed = Boolean(parsed.isClosed);

  return (
    <div className={`bg-slate-900/90 border ${
      isClosed ? "border-amber-500/40" : "border-slate-800"
    } rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full`}>
      {/* Background neon glow */}
      <div className={`absolute -top-10 -left-10 w-60 h-60 ${
        isClosed ? "bg-amber-500/15" : "bg-sky-500/10"
      } rounded-full blur-3xl pointer-events-none`} />

      <div>
        {/* Header & Live Indicator */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {isClosed ? (
              <>
                <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
                  Збір успішно закрито
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  Збір коштів активний
                </span>
              </>
            )}
          </div>

          <button
            onClick={onRefreshMono}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            title="Оновити дані з Monobank API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isRefreshing ? "Синхронізація..." : "Оновити"}</span>
          </button>
        </div>

        {/* Hero Balance & Percentage */}
        <div className="mt-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between gap-3 shadow-inner">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-0.5">
              {isClosed ? "Фінально накопичено у Банці:" : "Накопичено у Банці:"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-1.5 truncate">
              <span className="bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
                {parsed.balanceUah.toLocaleString()}
              </span>
              <span className="text-base font-bold text-sky-400 font-mono">UAH</span>
            </div>
          </div>

          {/* Animated Jar Badge */}
          <div className="flex items-center gap-2.5 shrink-0 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
            <div className="relative w-8 h-12 border-2 border-slate-600 rounded-lg overflow-hidden bg-slate-950 flex flex-col justify-end">
              <motion.div
                initial={{ height: "0%" }}
                animate={{ height: `${Math.min(100, Math.max(parsed.percentage, isClosed ? 100 : 0))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`w-full ${
                  isClosed
                    ? "bg-gradient-to-t from-amber-500 to-yellow-300"
                    : "bg-gradient-to-t from-sky-500 to-cyan-400"
                } rounded-b-sm`}
              />
            </div>
            <div className="text-right font-mono">
              <div className={`text-lg font-black ${isClosed ? "text-amber-400" : "text-cyan-400"} leading-none`}>
                {isClosed ? `${Math.max(100, parsed.percentage)}%` : `${parsed.percentage}%`}
              </div>
              <div className="text-[9px] text-slate-500 uppercase font-semibold">
                {isClosed ? "закрито" : "прогрес"}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono font-semibold">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className={`w-3.5 h-3.5 ${isClosed ? "text-amber-400" : "text-cyan-400"}`} />
              {isClosed ? "Підсумок збору" : "Прогрес збору"}
            </span>
            <span className={`${isClosed ? "text-amber-300" : "text-cyan-300"} font-bold`}>
              {isClosed ? "100% виконано · Збір закрито" : `${parsed.percentage}% виконується`}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(parsed.percentage, isClosed ? 100 : 0))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isClosed
                  ? "bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  : "bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              } relative`}
            />
          </div>
        </div>

        {/* 3 Metrics Grid Cards */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold">
              Зібрано
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono block mt-0.5 truncate">
              {parsed.balanceUah.toLocaleString()} ₴
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold flex items-center justify-center gap-1">
              <Target className="w-2.5 h-2.5 text-sky-400 inline" />
              Ціль
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-200 font-mono block mt-0.5 truncate">
              {parsed.goalUah.toLocaleString()} ₴
            </span>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-center">
            <span className="text-[9px] font-mono uppercase text-slate-400 block font-semibold flex items-center justify-center gap-1">
              {isClosed ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 inline" />
              ) : (
                <Hourglass className="w-2.5 h-2.5 text-amber-400 inline" />
              )}
              {isClosed ? "Статус" : "Залишилось"}
            </span>
            <span className={`text-xs sm:text-sm font-black ${
              isClosed ? "text-emerald-400" : "text-sky-300"
            } font-mono block mt-0.5 truncate`}>
              {isClosed ? "Досягнуто 🎉" : `${parsed.remainingUah.toLocaleString()} ₴`}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{isClosed ? "Збір завершено · Дякуємо за допомогу!" : "Офіційний збір на РЕБ / РЕР"}</span>
        </div>

        <a
          href={parsed.jarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <span>{isClosed ? "Переглянути Банку в Mono" : "Відкрити Банку в Mono"}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

