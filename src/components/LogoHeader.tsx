import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Radar, Radio, Flame } from "lucide-react";

interface LogoHeaderProps {
  logoUrl?: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({ logoUrl }) => {
  const [imgError, setImgError] = useState(false);
  const activeLogo = !imgError && logoUrl && logoUrl.trim() !== "" ? logoUrl : null;

  return (
    <div className="flex flex-col items-center justify-center pt-6 sm:pt-8 pb-4 sm:pb-6 px-4 text-center relative overflow-hidden select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />

      {/* Mobile & Desktop Header Wrapper */}
      <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
        {/* On Mobile: Row with small logo & community badge. On Desktop: Centered vertical stack */}
        <div className="flex flex-row sm:flex-col items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Main Animated Emblem */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group cursor-pointer shrink-0"
          >
            {/* Pulsating outer neon halo */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-2 sm:-inset-4 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/40 to-cyan-400/30 blur-md sm:blur-xl pointer-events-none"
            />

            {activeLogo ? (
              /* Custom Image Logo View */
              <div className="relative w-14 h-14 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,210,255,0.5)] sm:shadow-[0_0_35px_rgba(0,210,255,0.6)] bg-slate-950 p-0.5 sm:p-1 flex items-center justify-center">
                <img 
                  src={activeLogo} 
                  alt="Логотип спільноти ОПЕРАТИВНЕ КРИВИЙ РІГ ОПОВІЩЕННЯ" 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain rounded-full drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]" 
                />
              </div>
            ) : (
              /* Tactical SVG Heart Emblem Fallback */
              <div className="relative w-14 h-14 sm:w-52 sm:h-52 drop-shadow-[0_0_25px_rgba(0,210,255,0.6)]">
              <svg viewBox="0 0 400 400" className="w-full h-full filter drop-shadow">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d2ff" />
                    <stop offset="50%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>

                  <linearGradient id="neonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  <radialGradient id="centerRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>

                  <path
                    id="textArcTop"
                    d="M 60,200 A 140,140 0 1,1 340,200"
                  />
                  <path
                    id="textArcBottom"
                    d="M 340,200 A 140,140 0 0,1 60,200"
                  />
                </defs>

                {/* Outer Ring Circle */}
                <circle cx="200" cy="200" r="180" fill="url(#centerRadial)" stroke="url(#blueGradient)" strokeWidth="6" />
                <circle cx="200" cy="200" r="172" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

                {/* Outer Circular Arc Text */}
                <text fill="#7dd3fc" fontSize="15" fontWeight="800" letterSpacing="2.5" className="uppercase font-sans">
                  <textPath href="#textArcTop" startOffset="50%" textAnchor="middle">
                    ✶ ОПЕРАТИВНЕ ✶ КРИВИЙ РІГ ✶
                  </textPath>
                </text>

                <text fill="#38bdf8" fontSize="14" fontWeight="800" letterSpacing="2.5" className="uppercase font-sans">
                  <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
                    ✶ ОПОВІЩЕННЯ ✶ KRYVYI RIH ✶
                  </textPath>
                </text>

                {/* Heart-shaped Central Crest Frame */}
                <g transform="translate(200, 205) scale(0.82)">
                  {/* Outer Glowing Heart Path */}
                  <path
                    d="M 0 -70 C -45 -140 -150 -120 -150 -20 C -150 60 -40 120 0 160 C 40 120 150 60 150 -20 C 150 -120 45 -140 0 -70 Z"
                    fill="#030712"
                    stroke="url(#blueGradient)"
                    strokeWidth="10"
                  />
                  <path
                    d="M 0 -65 C -40 -130 -140 -110 -140 -20 C -140 50 -35 110 0 148 C 35 110 140 50 140 -20 C 140 -110 40 -130 0 -65 Z"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    opacity="0.8"
                  />

                  {/* Globe Grid inside Heart */}
                  <g opacity="0.35" stroke="#38bdf8" strokeWidth="1.5" fill="none">
                    <circle cx="50" cy="-20" r="45" />
                    <ellipse cx="50" cy="-20" rx="45" ry="18" />
                    <ellipse cx="50" cy="-20" rx="18" ry="45" />
                    <line x1="5" y1="-20" x2="95" y2="-20" />
                  </g>

                  {/* Radar Dish inside Heart (Top Left) */}
                  <g transform="translate(-50, -40) scale(0.9)" opacity="0.9">
                    <path d="M -20 10 A 30 30 0 0 1 20 10" fill="none" stroke="#7dd3fc" strokeWidth="3" />
                    <line x1="0" y1="10" x2="0" y2="30" stroke="#7dd3fc" strokeWidth="3" />
                    <line x1="-15" y1="30" x2="15" y2="30" stroke="#7dd3fc" strokeWidth="3" />
                    <circle cx="0" cy="-5" r="4" fill="#00d2ff" />
                    {/* Radar sweep waves */}
                    <path d="M -30 -5 A 40 40 0 0 1 30 -5" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                  </g>

                  {/* Rocket / Drone Detector Antenna (Center Vertical) */}
                  <g transform="translate(0, -10)">
                    <path d="M -12 30 L -12 -30 L 0 -50 L 12 -30 L 12 30 Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2" />
                    <line x1="0" y1="-50" x2="0" y2="-75" stroke="#00d2ff" strokeWidth="3" />
                    <circle cx="0" cy="-75" r="3.5" fill="#f43f5e" />
                    {/* Solar / Wing panels */}
                    <rect x="-35" y="-10" width="20" height="8" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                    <rect x="15" y="-10" width="20" height="8" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
                  </g>

                  {/* Central Badge: АЛЕРТС */}
                  <g transform="translate(0, 45)">
                    <rect x="-70" y="-18" width="140" height="36" rx="8" fill="#0284c7" stroke="#e0f2fe" strokeWidth="2.5" />
                    <text x="0" y="7" fill="#ffffff" fontSize="20" fontWeight="900" letterSpacing="3" textAnchor="middle" className="font-sans">
                      АЛЕРТС
                    </text>
                  </g>
                </g>
              </svg>
            </div>
            )}
          </motion.div>

          {/* Community Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-1 rounded-full bg-sky-950/80 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md text-left sm:text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Спільнота «Кривий Ріг Оповіщення / АЛЕРТС»</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          🚨 Терміновий збір: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">Детектор дронів</span> для нашого побратима! 🚨
        </h1>
        <p className="text-sky-200/80 text-xs sm:text-base mt-2 font-medium">
          Розвідрота на Слов’янському напрямку • Захист життів та виявлення ворожих «пташок»
        </p>
      </div>
    </div>
  );
};
