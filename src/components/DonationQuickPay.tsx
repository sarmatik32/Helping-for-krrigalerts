import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, QrCode, Copy, Check, ShieldCheck, HeartHandshake } from "lucide-react";
import QRCode from "qrcode";
import { ParsedMonobankData, RawMonobankResponse } from "../types";

interface DonationQuickPayProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
}

export const DonationQuickPay: React.FC<DonationQuickPayProps> = ({ parsed, raw }) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>("200");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const activeAmount = Number(customAmount) > 0 ? Number(customAmount) : selectedAmount;

  // Build target jar URL with amount query parameter 'a'
  const getJarDirectUrl = (amount: number) => {
    try {
      const url = new URL(parsed.jarUrl);
      if (amount > 0) {
        url.searchParams.set("a", amount.toString());
      }
      return url.toString();
    } catch {
      return parsed.jarUrl;
    }
  };

  const activeJarUrl = getJarDirectUrl(activeAmount);

  useEffect(() => {
    QRCode.toDataURL(activeJarUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#00d2ff",
        light: "#020617",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [activeJarUrl]);

  const copyJarLink = () => {
    navigator.clipboard.writeText(parsed.jarUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-md relative my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Оплата в Банку Monobank
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Пряме посилання на банк збора: <code className="text-cyan-300 font-mono">{parsed.jarUrl}</code>
          </p>
        </div>

        <button
          onClick={() => setShowQrModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>QR-код для банку</span>
        </button>
      </div>

      {/* Preset Amount Selector */}
      <div className="mt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5 font-mono">
          Оберіть суму для поповнення Банки (UAH):
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {[100, 200, 500, 1000, 2000, 5000].map((preset) => {
            const isSelected = selectedAmount === preset && Number(customAmount) === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedAmount(preset);
                  setCustomAmount(preset.toString());
                }}
                className={`py-2.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-200 border text-center ${
                  isSelected
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_15px_rgba(0,210,255,0.4)] scale-105"
                    : "bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700"
                }`}
              >
                +{preset.toLocaleString()} ₴
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={customAmount}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setCustomAmount(val);
              setSelectedAmount(Number(val));
            }}
            placeholder="Введіть довільну суму..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none transition-colors pr-16 font-mono"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm font-mono">
            UAH (грн)
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={activeJarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:shadow-[0_0_30px_rgba(0,210,255,0.6)] transition-all transform hover:-translate-y-0.5"
        >
          <span>Поповнити Банку Mono ({activeAmount > 0 ? `${activeAmount.toLocaleString()} грн` : ''})</span>
          <ExternalLink className="w-5 h-5 stroke-[2.5]" />
        </a>

        <button
          onClick={copyJarLink}
          className="py-4 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Скопійовано!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Скопіювати посилання на Банку</span>
            </>
          )}
        </button>
      </div>

      {/* QR Code Modal Drawer */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-1">
                QR-код Банки Monobank
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">
                {parsed.jarUrl}
              </p>

              {qrDataUrl && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 inline-block my-2 shadow-inner">
                  <img src={qrDataUrl} alt="Monobank Jar QR Code" className="w-56 h-56 mx-auto rounded-lg" />
                </div>
              )}

              <div className="mt-3 text-xs font-bold text-cyan-400 font-mono">
                Сума: {activeAmount.toLocaleString()} UAH
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href={activeJarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-colors"
                >
                  Перейти в додаток Mono
                </a>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Закрити
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
