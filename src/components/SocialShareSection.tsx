import React, { useState } from "react";
import { Share2, Send, Copy, Check, Twitter, Facebook, MessageCircle, Share } from "lucide-react";
import { ParsedMonobankData, RawMonobankResponse } from "../types";

interface SocialShareSectionProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
}

export const SocialShareSection: React.FC<SocialShareSectionProps> = ({ parsed, raw }) => {
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const shareText = `${raw.title}

${raw.description}

🎯 Ціль: ${parsed.goalUah.toLocaleString()} UAH
💰 Зібрано: ${parsed.balanceUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку Mono: ${parsed.jarUrl}

Кожен репост та гривня — це реальний шанс захистити розвідників! 🇺🇦`;

  // Concise text for Telegram to prevent HTTP 400 Bad Request error on t.me/share/url
  const telegramText = `🇺🇦 ${raw.title}

🎯 Зібрано: ${parsed.balanceUah.toLocaleString()} з ${parsed.goalUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку: ${parsed.jarUrl}`;

  // Concise text for Twitter (X) to stay under 280 characters
  const twitterText = `🇺🇦 ${raw.title.slice(0, 80)}...

🎯 Ціль: ${parsed.goalUah.toLocaleString()} UAH (${parsed.percentage}%)
💳 Поповнити Банку: ${parsed.jarUrl}

#ПідтримкаЗСУ #Донат #Monobank`;

  const copyText = () => {
    try {
      navigator.clipboard.writeText(shareText);
    } catch (e) {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Telegram expects clean url + concise text
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    parsed.jarUrl
  )}&text=${encodeURIComponent(telegramText)}`;

  // Twitter / X expects concise text under 280 chars
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;

  // Facebook sharer
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    parsed.jarUrl
  )}`;

  // Viber deep link
  const viberShareUrl = `viber://forward?text=${encodeURIComponent(shareText)}`;

  const handlePlatformClick = (platform: "telegram" | "viber" | "facebook" | "twitter", e: React.MouseEvent<HTMLAnchorElement>) => {
    // Copy text to clipboard so user can paste anywhere if needed
    try {
      navigator.clipboard.writeText(shareText);
    } catch (err) {
      console.log("Clipboard write notice:", err);
    }

    if (platform === "telegram") {
      showNotice("Готовий текст скопійовано в буфер! Відкриваємо Telegram...");
    } else if (platform === "facebook") {
      showNotice("Текст збору скопійовано у буфер! Вставте його у ваш допис на Facebook.");
    } else if (platform === "twitter") {
      showNotice("Текст скопійовано! Відкриваємо X (Twitter)...");
    } else if (platform === "viber") {
      showNotice("Текст скопійовано! Якщо Viber не відкрився, вставте текст вручну.");
      // On desktop browsers, custom protocol viber:// might fail, so we also provide fallback window open or clipboard copy
      if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        e.preventDefault();
        window.open(`https://www.viber.com/`, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleNativeWebShare = async () => {
    copyText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: raw.title,
          text: shareText,
          url: parsed.jarUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md my-6 space-y-5 relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Поділитись у соцмережах
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Натисніть на соцмережу для поширення. Готовий текст також автоматично копіюється у буфер!
            </p>
          </div>
        </div>

        {/* Native Web Share Button */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleNativeWebShare}
            className="py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-800/60 transition-colors cursor-pointer"
          >
            <Share className="w-3.5 h-3.5" />
            <span>Меню телефону</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 text-xs font-mono py-2.5 px-4 rounded-xl animate-fadeIn text-center font-bold shadow-lg">
          ✓ {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href={telegramShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handlePlatformClick("telegram", e)}
          className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
        </a>

        <a
          href={viberShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handlePlatformClick("viber", e)}
          className="py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Viber</span>
        </a>

        <a
          href={facebookShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handlePlatformClick("facebook", e)}
          className="py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Facebook className="w-4 h-4" />
          <span>Facebook</span>
        </a>

        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handlePlatformClick("twitter", e)}
          className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-md transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Twitter className="w-4 h-4 text-cyan-400" />
          <span>X / Twitter</span>
        </a>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          onClick={copyText}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors font-mono cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Текст з посиланням скопійовано!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Скопіювати готовий текст збору для допису</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

