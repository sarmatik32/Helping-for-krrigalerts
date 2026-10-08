import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Save, X, Key, Check, Lock, ShieldAlert, CheckCircle2, Award, Calendar, AlertCircle, Type, Sparkles, CreditCard } from "lucide-react";
import { RawMonobankResponse, ParsedMonobankData } from "../types";
import { StyledText } from "./StyledText";

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
  const [ownerName, setOwnerName] = useState(raw.ownerName || "Артем Г.");
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
  const [cardNumber, setCardNumber] = useState<string>(
    parsed.cardNumber || raw.cardNumber || "4874 1000 3205 4507"
  );
  const initialCardsList = (parsed.cardNumbers && parsed.cardNumbers.length > 0)
    ? parsed.cardNumbers.join("\n")
    : (raw.cardNumbers && raw.cardNumbers.length > 0)
      ? raw.cardNumbers.join("\n")
      : (parsed.cardNumber || raw.cardNumber || "4874 1000 3205 4507");
  const [cardNumbersInput, setCardNumbersInput] = useState<string>(initialCardsList);

  const [donateSiteUrl, setDonateSiteUrl] = useState<string>(
    parsed.donateSiteUrl || raw.donateSiteUrl || "https://donate.krrigalerts.pp.ua/"
  );
  const [reportUrl, setReportUrl] = useState<string>(
    parsed.reportUrl || raw.reportUrl || "https://t.me/krrigalerts"
  );
  const [showReportUrl, setShowReportUrl] = useState<boolean>(
    parsed.showReportUrl !== undefined
      ? Boolean(parsed.showReportUrl)
      : (raw.showReportUrl !== undefined ? Boolean(raw.showReportUrl) : false)
  );
  const [closedGratitudeTitle, setClosedGratitudeTitle] = useState<string>(
    parsed.closedGratitudeTitle || raw.closedGratitudeTitle || "Дякуємо за допомогу!"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setJarUrl(parsed.jarUrl || "");
      setTitle(raw.title || "");
      setDescription(raw.description || "");
      setOwnerName(raw.ownerName || parsed.ownerName || "Артем Г.");
      setBalanceUah((parsed.balanceUah || "").toString());
      setGoalUah((parsed.goalUah || "").toString());
      setIsClosed(Boolean(parsed.isClosed ?? raw.isClosed));
      setClosedReportTitle(
        parsed.closedReportTitle || raw.closedReportTitle || "Збір успішно завершено! Мета досягнута!"
      );
      setClosedReportText(
        parsed.closedReportText || raw.closedReportText || ""
      );
      setClosedGratitudeTitle(
        parsed.closedGratitudeTitle || raw.closedGratitudeTitle || "Дякуємо за допомогу!"
      );
      setClosedBalanceUah(
        (parsed.closedBalanceUah || parsed.balanceUah || "").toString()
      );
      setClosedGoalUah(
        (parsed.closedGoalUah || parsed.goalUah || "").toString()
      );
      const syncedCards = (parsed.cardNumbers && parsed.cardNumbers.length > 0)
        ? parsed.cardNumbers.join("\n")
        : (raw.cardNumbers && raw.cardNumbers.length > 0)
          ? raw.cardNumbers.join("\n")
          : (parsed.cardNumber || raw.cardNumber || "4874 1000 3205 4507");
      setCardNumbersInput(syncedCards);
      setCardNumber(
        parsed.cardNumber || raw.cardNumber || "4874 1000 3205 4507"
      );
      setDonateSiteUrl(
        parsed.donateSiteUrl || raw.donateSiteUrl || "https://donate.krrigalerts.pp.ua/"
      );
      setReportUrl(
        parsed.reportUrl || raw.reportUrl || "https://t.me/krrigalerts"
      );
      setShowReportUrl(
        parsed.showReportUrl !== undefined
          ? Boolean(parsed.showReportUrl)
          : (raw.showReportUrl !== undefined ? Boolean(raw.showReportUrl) : false)
      );
    }
  }, [isOpen, parsed, raw]);

  const insertFormatting = (prefix: string, suffix: string = prefix, placeholder: string = "слово") => {
    const textarea = document.getElementById("closedReportTextarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      setClosedReportText((prev) => (prev ? `${prev} ${prefix}${placeholder}${suffix}` : `${prefix}${placeholder}${suffix}`));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setClosedReportText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 40);
  };

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

    const parsedCards = cardNumbersInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const primaryCard = parsedCards[0] || cardNumber.trim() || "4874 1000 3205 4507";

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
      closedGratitudeTitle: closedGratitudeTitle.trim(),
      closedBalanceUah: snapBal,
      closedGoalUah: snapGoal,
      closedPercentage: snapPct,
      closedAt: isClosed ? (parsed.closedAt || new Date().toISOString()) : "",
      cardNumber: primaryCard,
      cardNumbers: parsedCards.length > 0 ? parsedCards : [primaryCard],
      donateSiteUrl: donateSiteUrl.trim(),
      reportUrl: reportUrl.trim(),
      showReportUrl,
      ownerName: ownerName.trim(),
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
                              setClosedReportTitle("Збір успішно завершено! Мета досягнута!");
                              setClosedReportText(
                                "Збір закриваємо, час вже не на нашому боці, вже **вкрай необхідно**. Закрили потребу, вже здійснили закуп та відправлення на позицію.\nПоки збирали, **Чуйка** випустила **версію 4.0** (яку і купили).\nЗбір, на жаль, будемо закривати на [green]70%[/green], остаточну суму закрили коштами військових та банку.\nСума не ==45к==, а ==60к== — але то вже нюанси. Хоч і чутливі.\n\nДякуємо всім, хто долучився! **Завтра повний звіт.**\nХто ще має бажання долучитися — ще не пізно, будемо вдячні за **кожну гривню** 🫶"
                              );
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            Вставити стандартний звіт
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-slate-300 font-semibold block text-xs">
                              Повідомлення / подяка (відобразиться по центру сайту):
                            </label>
                            <span className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              Стилізація слів
                            </span>
                          </div>

                          {/* Quick formatting toolbar */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2 p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400 px-1">Виділити:</span>
                            <button
                              type="button"
                              onClick={() => insertFormatting("**", "**", "жирне")}
                              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition-colors"
                              title="Жирне золоте сяйво"
                            >
                              **Жирне**
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("==", "==", "акцент")}
                              className="px-2 py-0.5 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-[11px] font-bold border border-yellow-500/40 transition-colors"
                              title="Жовтий бейдж-маркер"
                            >
                              ==Бейдж==
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("[cyan]", "[/cyan]", "блакитне")}
                              className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/40 transition-colors"
                              title="Блакитний акцент"
                            >
                              [cyan]
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("[green]", "[/green]", "зелене")}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 transition-colors"
                              title="Зелений акцент"
                            >
                              [green]
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting("*", "*", "курсив")}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] italic border border-slate-700 transition-colors"
                              title="Курсив"
                            >
                              *Курсив*
                            </button>
                          </div>

                          <textarea
                            id="closedReportTextarea"
                            rows={4}
                            value={closedReportText}
                            onChange={(e) => setClosedReportText(e.target.value)}
                            placeholder="Напишіть слова щирої подяки учасникам збору (використовуйте **слово** або ==слово== для виділення)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans text-sm"
                          />

                          {/* Live preview of styled words */}
                          {closedReportText && (
                            <div className="mt-2 p-2.5 bg-slate-950/80 border border-slate-800/90 rounded-lg">
                              <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Попередній перегляд виділення:
                              </span>
                              <div className="text-xs sm:text-sm font-medium text-slate-200">
                                <StyledText text={closedReportText} />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <label className="text-slate-300 font-semibold block mb-1 text-xs">
                            Заголовок блоку подяки (великий текст):
                          </label>
                          <input
                            type="text"
                            value={closedGratitudeTitle}
                            onChange={(e) => setClosedGratitudeTitle(e.target.value)}
                            placeholder="Дякуємо за допомогу!"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-500"
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

                        {/* Перемикач відображення посилання на звіт */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <label className="text-slate-200 font-bold block text-xs">
                                Відображати посилання на звіт у Telegram
                              </label>
                              <span className="text-[11px] text-slate-400 block">
                                Можливість вимикати або вмикати показ посилання на звіт
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowReportUrl(!showReportUrl)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                                showReportUrl ? "bg-sky-500" : "bg-slate-700"
                              }`}
                              title={showReportUrl ? "Вимкнути показ посилання на звіт" : "Увімкнути показ посилання на звіт"}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  showReportUrl ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          {showReportUrl ? (
                            <div className="pt-2 border-t border-slate-800/80">
                              <label className="text-sky-300 font-semibold block mb-1 text-xs flex items-center justify-between">
                                <span>Посилання на пост звіту (Telegram):</span>
                                <span className="text-[10px] text-emerald-400 font-mono font-bold">● Увімкнено</span>
                              </label>
                              <input
                                type="text"
                                value={reportUrl}
                                onChange={(e) => setReportUrl(e.target.value)}
                                placeholder="https://t.me/krrigalerts/..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                              />
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Відображається під написом «Збір закрито» та окремою кнопкою в блоці дій
                              </span>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-amber-300/80 flex items-center gap-1.5 font-medium">
                              <span>Показ посилання на звіт на сайті повністю вимкнено (приховано).</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* РЕКВІЗИТИ: КАРТКИ ТА САЙТ ДОНАТІВ (доступні завжди) */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Реквізити та посилання для швидкого редагування</span>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1 text-xs">
                        Номери карток для донатів (з можливістю швидкого копіювання):
                      </label>
                      <textarea
                        rows={2}
                        value={cardNumbersInput}
                        onChange={(e) => {
                          setCardNumbersInput(e.target.value);
                          const first = e.target.value.split(/[\n,]+/)[0]?.trim();
                          if (first) setCardNumber(first);
                        }}
                        placeholder="4874 1000 3205 4507"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Введіть одну або кілька карток (з нового рядка або через кому). Всі вони відображатимуться зі зручною кнопкою копіювання.
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1 text-xs">
                        Посилання для кнопки переходу на сайт донатів:
                      </label>
                      <input
                        type="text"
                        value={donateSiteUrl}
                        onChange={(e) => setDonateSiteUrl(e.target.value)}
                        placeholder="https://donate.krrigalerts.pp.ua/"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
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
                      Отримувач / Автор збору
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Артем Г."
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
