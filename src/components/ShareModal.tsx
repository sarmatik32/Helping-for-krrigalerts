import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Copy, Check, Send, Twitter, Facebook, X, MessageCircle } from "lucide-react";
import { ParsedMonobankData, RawMonobankResponse } from "../types";

interface ShareModalProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ parsed, raw, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const shareText = `${raw.title}

${raw.description}

🎯 Ціль: ${parsed.goalUah.toLocaleString()} UAH
💰 Зібрано: ${parsed.balanceUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку Mono: ${parsed.jarUrl}

Кожен репост та гривня — це реальний шанс захистити розвідників! 🇺🇦`;

  const telegramText = `🇺🇦 ${raw.title}

🎯 Зібрано: ${parsed.balanceUah.toLocaleString()} з ${parsed.goalUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку: ${parsed.jarUrl}`;

  const twitterText = `🇺🇦 ${raw.title.slice(0, 80)}...

🎯 Ціль: ${parsed.goalUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку: ${parsed.jarUrl}

#ПідтримкаЗСУ #Донат #Monobank`;

  const copyShareText = () => {
    try {
      navigator.clipboard.writeText(shareText);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    parsed.jarUrl
  )}&text=${encodeURIComponent(telegramText)}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    parsed.jarUrl
  )}`;

  const viberShareUrl = `viber://forward?text=${encodeURIComponent(shareText)}`;

  const handlePlatformClick = (platform: "telegram" | "viber" | "facebook" | "twitter", e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      navigator.clipboard.writeText(shareText);
    } catch (err) {}

    if (platform === "telegram") {
      showToast("Текст збору скопійовано у буфер! Відкриваємо Telegram...");
    } else if (platform === "facebook") {
      showToast("Текст збору скопійовано у буфер! Вставте його у ваш допис на Facebook.");
    } else if (platform === "twitter") {
      showToast("Текст скопійовано! Відкриваємо X (Twitter)...");
    } else if (platform === "viber") {
      showToast("Текст скопійовано! Якщо Viber не відкрився, вставте текст вручну.");
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        e.preventDefault();
        window.open(`https://www.viber.com/`, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full relative shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">
                Поширити збір (Monobank Jar)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Оберіть мережу або скопіюйте готовий текст з посиланням:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 relative whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto mb-4 custom-scrollbar">
              {shareText}
            </div>

            {notice && (
              <div className="bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 text-xs font-mono py-2 px-3 rounded-xl mb-3 text-center font-bold animate-fadeIn">
                ✓ {notice}
              </div>
            )}

            <button
              onClick={copyShareText}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors mb-4 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Текст скопійовано у буфер обміну</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Скопіювати готовий текст з посиланням Mono</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handlePlatformClick("telegram", e)}
                className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <a
                href={viberShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handlePlatformClick("viber", e)}
                className="py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Viber</span>
              </a>

              <a
                href={facebookShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handlePlatformClick("facebook", e)}
                className="py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>

              <a
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handlePlatformClick("twitter", e)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <Twitter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Twitter</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

