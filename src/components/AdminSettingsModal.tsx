import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Settings, Save, X, Key, Check, Lock, ShieldAlert } from "lucide-react";
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
    onSave({
      adminPassword: inputPassword,
      jarUrl,
      title,
      description,
      balanceUah: Number(balanceUah) || 0,
      goalUah: Number(goalUah) || 0,
      monobankToken,
      logoUrl,
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
