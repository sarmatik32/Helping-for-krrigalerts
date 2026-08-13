import React from "react";
import { Heart, Share2, Shield, Settings } from "lucide-react";

interface FooterProps {
  onOpenShare: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenShare, onOpenAdmin }) => {
  return (
    <footer className="mt-12 pb-16 pt-8 border-t border-slate-800 text-center relative">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 font-bold text-sm">
          <span>🇺🇦 Разом до Перемоги!</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Дякуємо кожному за підтримку, розуміння та репости!
        </h3>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Спільнота оперативних сповіщень «Кривий Ріг Оповіщення / АЛЕРТС».
          <br />
          Збір на засіб РЕР для бійців розвідроти на Слов’янському напрямку.
        </p>

        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={onOpenShare}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Поширити у соцмережах</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
            title="Адмін панель"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Адмін</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
