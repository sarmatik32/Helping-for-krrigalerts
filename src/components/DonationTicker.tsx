import React, { useState } from "react";
import { Heart, Zap, ListFilter, X, ShieldCheck } from "lucide-react";
import { DonationItem } from "../types";

interface DonationTickerProps {
  donations?: DonationItem[];
}

export const DonationTicker: React.FC<DonationTickerProps> = ({ donations = [] }) => {
  const [isListOpen, setIsListOpen] = useState(false);

  const hasDonations = donations && donations.length > 0;
  const totalSum = hasDonations ? donations.reduce((acc, curr) => acc + curr.amount, 0) : 0;
  const marqueeItems = hasDonations ? [...donations, ...donations] : [];

  return (
    <>
      <div className="bg-slate-950/90 border-y border-slate-800/80 my-4 py-3 overflow-hidden relative shadow-inner">
        {/* Side gradient overlays for seamless fade edge */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#070b14] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#070b14] to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-3">
          {/* Label Badge */}
          <div className="shrink-0 flex items-center gap-2 pl-3 pr-2 py-1 bg-emerald-950/90 border border-emerald-700/60 rounded-r-xl text-emerald-400 font-mono text-xs font-bold z-20 shadow-md ml-1 sm:ml-4">
            <Zap className="w-3.5 h-3.5 fill-emerald-400 animate-pulse shrink-0" />
            <span className="uppercase tracking-wider text-[11px] hidden sm:inline">
              {hasDonations ? "Останні донати:" : "Офіційний збір:"}
            </span>
            {hasDonations && (
              <button
                onClick={() => setIsListOpen(true)}
                className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Переглянути повний список без повторів"
              >
                <ListFilter className="w-3 h-3 text-emerald-300" />
                <span>Список ({donations.length})</span>
              </button>
            )}
          </div>

          {/* Marquee Ticker Track */}
          <div className="flex overflow-hidden whitespace-nowrap w-full relative">
            {hasDonations ? (
              <div className="flex animate-marquee items-center gap-6 text-xs font-mono">
                {marqueeItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 px-3 py-1.5 rounded-xl hover:border-slate-700 transition-colors shrink-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                      <span className="font-bold text-slate-200">{item.name}</span>
                    </div>

                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-extrabold font-mono">
                      +{item.amount.toLocaleString()} ₴
                    </span>

                    <span className="text-[10px] text-slate-500 font-sans">
                      ({item.time})
                    </span>

                    {item.comment && (
                      <span className="text-[11px] text-slate-400 italic max-w-[150px] truncate border-l border-slate-800 pl-2">
                        "{item.comment}"
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-6 text-xs font-mono text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                  Прямі зарахування на Монобанку
                </span>
                <span className="text-slate-600">•</span>
                <span>Синхронізація донатів через Monobank API</span>
                <span className="text-slate-600">•</span>
                <span className="text-sky-300 font-semibold">Дякуємо кожному за підтримку та репости! 🇺🇦</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for viewing unique list of donations without marquee duplication */}
      {isListOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-400">
                  <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Останні донати
                    <span className="text-xs bg-emerald-900/80 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-700/60">
                      {donations.length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Унікальний список останніх внесків
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsListOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Summary Bar */}
            <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Сума завантажених донатів:
              </span>
              <span className="text-emerald-400 font-extrabold text-sm">
                +{totalSum.toLocaleString()} ₴
              </span>
            </div>

            {/* Donations List Container */}
            <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar flex-1">
              {donations.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 font-bold text-xs text-cyan-400">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {item.time}
                        </span>
                      </div>
                      {item.comment ? (
                        <p className="text-xs text-slate-400 italic truncate mt-0.5">
                          "{item.comment}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          без коментаря
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono">
                    <span className="text-emerald-400 font-bold text-sm">
                      +{item.amount.toLocaleString()} ₴
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setIsListOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

