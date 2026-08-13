import React from "react";
import { motion } from "motion/react";
import { RefreshCw, ExternalLink } from "lucide-react";
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
  raw,
  apiStatusMsg,
  onRefreshMono,
  isRefreshing,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden my-6">
      {/* Background neon glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Live Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
              Збір коштів активний
            </span>
          </div>

          {apiStatusMsg && (
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              ℹ️ {apiStatusMsg}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshMono}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Синхронізація..." : "Оновити"}</span>
          </button>
        </div>
      </div>

      {/* Jar Progress Graphic & Big Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mt-6">
        {/* Animated Jar Visual */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative">
          <div className="relative w-28 h-40 border-4 border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-end bg-slate-900 shadow-inner">
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: `${parsed.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full bg-gradient-to-t from-sky-600 via-cyan-500 to-sky-400 relative rounded-b-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.5)]"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-cyan-200/50 animate-pulse" />
            </motion.div>

            <div className="absolute top-2 left-2 w-2.5 h-16 bg-white/10 rounded-full blur-[1px] pointer-events-none" />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {parsed.percentage}%
              </span>
            </div>
          </div>
          <a
            href={parsed.jarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Долучитись</span>
          </a>
        </div>

        {/* Financial Numbers */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Зібрано наразі
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>{parsed.balanceUah.toLocaleString()}</span>
                <span className="text-xl sm:text-2xl font-bold text-sky-400">UAH</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
                Ціль збору
              </span>
              <div className="text-xl sm:text-3xl font-extrabold text-slate-300">
                {parsed.goalUah.toLocaleString()} <span className="text-sm text-slate-400 font-bold">UAH</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden p-1 border border-slate-800 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${parsed.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 relative shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              />
            </div>

            <div className="flex justify-between text-xs font-semibold text-slate-400 px-1 font-mono">
              <span>0 ₴</span>
              <span>Залишилось: <strong className="text-sky-300 font-bold">{parsed.remainingUah.toLocaleString()} UAH</strong></span>
              <span>{parsed.goalUah.toLocaleString()} ₴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
