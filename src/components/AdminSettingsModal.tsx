import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Save, X, Key, Check, Lock, ShieldAlert, CheckCircle2, Award, Calendar, AlertCircle } from "lucide-react";
import { RawMonobankResponse, ParsedMonobankData } from "../types";

interface AdminSettingsModalProps {
  parsed: ParsedMonobankData;
  raw: RawMonobankResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  parsed,
  raw,
  isOpen,
  onClose,
  onSave,
}) => {
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [jarUrl, setJarUrl] = useState(parsed.jarUrl);
  const [title, setTitle] = useState(raw.title);
  const [description, setDescription] = useState(raw.description);
  const [balanceUah, setBalanceUah] = useState(parsed.balanceUah.toString());
  const [goalUah, setGoalUah] = useState(parsed.goalUah.toString());
  const [monobankToken, setMonobankToken] = useState("");
  const [logoUrl, setLogoUrl] = useState(parsed.logoUrl || "");
  const [isClosed, setIsClosed] = useState<boolean>(Boolean(parsed.isClosed ?? raw.isClosed));
  const [closedReportTitle, setClosedReportTitle] = useState(
    parsed.closedReportTitle || raw.closedReportTitle || "Збір успішно завершено! Дякуємо! 🇺🇦"
  );
  const [closedReportText, setClosedReportText] = useState(
    parsed.closedReportText || raw.closedReportText ||
    "Щиро дякуємо кожному, хто долучився до збору коштами, репостами та теплими словами! Завдяки вашій згуртованості та допомозі необхідну суму для закупівлі обладнання для розвідроти зібрано. Ви — неймовірна підтримка та надійний тил! Разом до перемоги! 🇺🇦"
  );
  const [closedBalanceUah, setClosedBalanceUah] = useState<string>(
    (parsed.closedBalanceUah || parsed.balanceUah || "").toString()
  );
  const [closedGoalUah, setClosedGoalUah] = useState<string>(
    (parsed.closedGoalUah || parsed.goalUah || "").toString()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === "25510032") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Невірний пароль адміністратора!");
    }
  };

  const handleClose = () => {
    setInputPassword("");
    setPasswordError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const snapBal = Number(closedBalanceUah) || Number(balanceUah) || 0;
    const snapGoal = Number(closedGoalUah) || Number(goalUah) || 0;
    const snapPct = snapGoal > 0 ? Math.round((snapBal / snapGoal) * 100) : 100;

    onSave({
      adminPassword: inputPassword,
      jarUrl,
      title,
      description,
      balanceUah: Number(balanceUah) || 0,
      goalUah: Number(goalUah) || 0,
      monobankToken,
      logoUrl,
      isClosed,
      closedReportTitle,
      closedReportText,
      closedBalanceUah: snapBal,
      closedGoalUah: snapGoal,
      closedPercentage: snapPct,
      closedAt: isClosed ? (parsed.closedAt || new Date().toISOString()) : "",
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      handleClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!isAuthenticated ? (
              /* Password Gate View */
              <div className="py-4 space-y-5">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-950 border border-amber-800/80 text-amber-400">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Панель адміністратора
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Для редагування цілей, опису та посилання на Банку введіть пароль доступу
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1.5 font-mono">
                      Пароль адміністратора:
                    </label>
                    <input
                      type="password"
                      autoFocus
                      value={inputPassword}
                      onChange={(e) => {
                        setInputPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Введіть пароль..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500 text-center text-base tracking-widest"
                    />
                  </div>

                  {passwordError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 font-mono">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                  >
                    Увійти в панель
                  </button>
                </form>
              </div>
            ) : (
              /* Edit Form View (Unlocked) */
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">
                    Налаштування параметрів збору
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Вкажіть актуальне посилання на банку та фінансові дані
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  {/* Status Toggle Switch: Open / Closed */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isClosed
                      ? "bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "bg-emerald-950/30 border-emerald-500/40"
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                          {isClosed ? (
                            <Award className="w-4 h-4 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>Статус збору коштів</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {isClosed
                            ? "Збір закрито! Відображається подяка, похвала учасникам та фінальний звіт."
                            : "Збір відкритий та приймає донати від користувачів."}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isClosed}
                        onClick={() => setIsClosed(!isClosed)}
                        className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isClosed ? "bg-amber-500" : "bg-slate-700 hover:bg-slate-600"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isClosed ? "translate-x-7" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Detailed Report inputs shown when isClosed is active */}
                    {isClosed && (
                      <div className="mt-4 pt-3.5 border-t border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            Налаштування звіту про закриття збору
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setClosedReportTitle("Збір успішно завершено! Мета досягнута! 🎯");
                              setClosedReportText(
                                "Щиро дякуємо кожному, хто підтримав наш збір коштами, репостами та теплими словами! Завдяки вашій неймовірній небайдужості збір закрито. Вся сума спрямовується на закупівлю необхідного обладнання для розвідроти на Слов'янському напрямку. Ви — неймовірна сила і надійний тил наших воїнів! Разом до перемоги! 🇺🇦"
                              );
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            Вставити стандартний звіт
                          </button>
                        </div>

                        <div>
                          <label className="text-slate-300 font-semibold block mb-1">
                            Великий напис про дякування (відобразиться по центру сайту):
                          </label>
                          <textarea
                            rows={4}
                            value={closedReportText}
                            onChange={(e) => setClosedReportText(e.target.value)}
                            placeholder="Напишіть слова щирої подяки учасникам збору..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">
                              Точна сума на момент закриття (UAH):
                            </label>
                            <input
                              type="number"
                              value={closedBalanceUah}
                              onChange={(e) => setClosedBalanceUah(e.target.value)}
                              placeholder={balanceUah}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-semibold block mb-1">
                              Ціль збору (UAH):
                            </label>
                            <input
                              type="number"
                              value={closedGoalUah}
                              onChange={(e) => setClosedGoalUah(e.target.value)}
                              placeholder={goalUah}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Посилання на Банку Monobank
                    </label>
                    <input
                      type="text"
                      value={jarUrl}
                      onChange={(e) => setJarUrl(e.target.value)}
                      placeholder="https://send.monobank.ua/jar/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Назва збору
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      Опис збору / Текст звернення
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        Зібрано (UAH)
                      </label>
                      <input
                        type="number"
                        value={balanceUah}
                        onChange={(e) => setBalanceUah(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        Ціль збору (UAH)
                      </label>
                      <input
                        type="number"
                        value={goalUah}
                        onChange={(e) => setGoalUah(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">
                      URL або шлях до файлу логотипу (опціонально)
                    </label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/logo.png або посилання https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-1 text-sky-400 font-bold">
                      <Key className="w-3.5 h-3.5" />
                      <span>Персональний токен Монобанку (опціонально)</span>
                    </div>
                    <input
                      type="password"
                      value={monobankToken}
                      onChange={(e) => setMonobankToken(e.target.value)}
                      placeholder="Токен з api.monobank.ua..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500 mb-1.5"
                    />
                    <p className="text-[11px] text-slate-400 leading-snug">
                      ⚡ З токеном додаток автоматично отримує реальний баланс, ціль та **список останніх донатів з ім'ям та коментарями** через Monobank Statement API (`/personal/statement`).
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-colors font-sans cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Збережено!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Зберегти налаштування збору</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
