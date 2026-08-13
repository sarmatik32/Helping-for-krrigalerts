import React, { useMemo } from "react";
import { motion } from "motion/react";

interface DroneConfig {
  id: number;
  size: number; // width/height in px
  startX: number; // percentage
  startY: number; // percentage
  endX: number; // percentage
  endY: number; // percentage
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  scale: number;
  type: "mavic" | "fpv" | "scout";
  color: string;
  hasLed: boolean;
}

// Vector SVG Quadcopter Drone Component
const DroneSVG: React.FC<{ type: "mavic" | "fpv" | "scout"; color: string; hasLed?: boolean }> = ({
  type,
  color,
  hasLed = true,
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`propellerGlow-${type}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Frame Arms (X-Shape Quadcopter) */}
        <g stroke={color} strokeWidth="3.5" strokeLinecap="round">
          {/* Main X Frame */}
          <line x1="25" y1="25" x2="95" y2="95" />
          <line x1="95" y1="25" x2="25" y2="95" />
          {/* Cross reinforcement */}
          <line x1="38" y1="60" x2="82" y2="60" strokeWidth="2" opacity="0.7" />
          <line x1="60" y1="38" x2="60" y2="82" strokeWidth="2" opacity="0.7" />
        </g>

        {/* 4 Motor Pods & Rotors */}
        {[
          { cx: 25, cy: 25 },
          { cx: 95, cy: 25 },
          { cx: 25, cy: 95 },
          { cx: 95, cy: 95 },
        ].map((motor, idx) => (
          <g key={idx}>
            {/* Motor mount circle */}
            <circle cx={motor.cx} cy={motor.cy} r="6" fill="#0f172a" stroke={color} strokeWidth="2" />
            <circle cx={motor.cx} cy={motor.cy} r="2.5" fill="#38bdf8" />

            {/* Spinning Rotor Propeller Disc */}
            <circle
              cx={motor.cx}
              cy={motor.cy}
              r="18"
              fill={`url(#propellerGlow-${type})`}
              className="animate-spin opacity-70"
              style={{
                transformOrigin: `${motor.cx}px ${motor.cy}px`,
                animationDuration: `${0.15 + (idx % 2) * 0.05}s`,
              }}
            />

            {/* Propeller Blade lines */}
            <g
              className="animate-spin"
              style={{
                transformOrigin: `${motor.cx}px ${motor.cy}px`,
                animationDuration: "0.12s",
              }}
            >
              <line x1={motor.cx - 16} y1={motor.cy} x2={motor.cx + 16} y2={motor.cy} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.8" />
              <line x1={motor.cx} y1={motor.cy - 16} x2={motor.cx} y2={motor.cy + 16} stroke="#7dd3fc" strokeWidth="2.5" opacity="0.8" />
            </g>

            {/* Navigation LEDs on motor arms */}
            {hasLed && (
              <circle
                cx={motor.cx}
                cy={motor.cy}
                r="3"
                fill={idx < 2 ? "#ef4444" : "#22c55e"}
                className="animate-pulse"
                style={{ animationDuration: "0.8s" }}
              />
            )}
          </g>
        ))}

        {/* Central Drone Body Hull */}
        <rect
          x="44"
          y="42"
          width="32"
          height="36"
          rx="8"
          fill="#090d16"
          stroke={color}
          strokeWidth="3"
        />

        {/* Battery / Top Plate detail */}
        <rect x="48" y="46" width="24" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="52" y1="52" x2="68" y2="52" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />

        {/* Camera / Sensor Gimbal on Front */}
        <path d="M 50 78 L 70 78 L 65 88 L 55 88 Z" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.5" />
        <circle cx="60" cy="83" r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="60" cy="83" r="1.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: "2s" }} />

        {/* Antennas */}
        <line x1="48" y1="42" x2="40" y2="30" stroke={color} strokeWidth="2" />
        <circle cx="40" cy="30" r="2" fill="#38bdf8" />
        <line x1="72" y1="42" x2="80" y2="30" stroke={color} strokeWidth="2" />
        <circle cx="80" cy="30" r="2" fill="#38bdf8" />

        {/* Signal Waves from Antenna */}
        <path d="M 35 25 A 8 8 0 0 1 45 25" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-pulse" />
        <path d="M 75 25 A 8 8 0 0 1 85 25" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-pulse" />
      </svg>
    </div>
  );
};

export const DroneBackgroundAnimation: React.FC = () => {
  // Generate 7 tactical quadcopters with different flight paths, sizes, and speeds
  const drones: DroneConfig[] = useMemo(
    () => [
      {
        id: 1,
        size: 72,
        startX: -10,
        startY: 15,
        endX: 110,
        endY: 25,
        duration: 22,
        delay: 0,
        opacity: 0.55,
        scale: 1,
        type: "mavic",
        color: "#38bdf8",
        hasLed: true,
      },
      {
        id: 2,
        size: 54,
        startX: 110,
        startY: 40,
        endX: -10,
        endY: 30,
        duration: 28,
        delay: 5,
        opacity: 0.45,
        scale: 0.85,
        type: "fpv",
        color: "#0284c7",
        hasLed: true,
      },
      {
        id: 3,
        size: 85,
        startX: -15,
        startY: 65,
        endX: 115,
        endY: 75,
        duration: 25,
        delay: 10,
        opacity: 0.5,
        scale: 1.1,
        type: "scout",
        color: "#7dd3fc",
        hasLed: true,
      },
      {
        id: 4,
        size: 42,
        startX: 20,
        startY: -10,
        endX: 80,
        endY: 110,
        duration: 32,
        delay: 2,
        opacity: 0.35,
        scale: 0.7,
        type: "fpv",
        color: "#38bdf8",
        hasLed: false,
      },
      {
        id: 5,
        size: 64,
        startX: 105,
        startY: 85,
        endX: -15,
        endY: 15,
        duration: 30,
        delay: 14,
        opacity: 0.4,
        scale: 0.9,
        type: "mavic",
        color: "#0284c7",
        hasLed: true,
      },
      {
        id: 6,
        size: 48,
        startX: -10,
        startY: 80,
        endX: 110,
        endY: 50,
        duration: 26,
        delay: 18,
        opacity: 0.4,
        scale: 0.75,
        type: "fpv",
        color: "#38bdf8",
        hasLed: true,
      },
      {
        id: 7,
        size: 90,
        startX: 50,
        startY: -15,
        endX: 30,
        endY: 115,
        duration: 35,
        delay: 8,
        opacity: 0.3,
        scale: 1.2,
        type: "scout",
        color: "#7dd3fc",
        hasLed: true,
      },
    ],
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Tactical Radar Grid Subdued Background Lines */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
          backgroundSize: "40px 40px, 80px 80px, 80px 80px",
        }}
      />

      {/* Animated Flying Drones */}
      {drones.map((drone) => (
        <motion.div
          key={drone.id}
          className="absolute top-0 left-0"
          style={{
            width: drone.size,
            height: drone.size,
            opacity: drone.opacity,
          }}
          initial={{
            x: `${drone.startX}vw`,
            y: `${drone.startY}vh`,
            rotate: drone.startX < drone.endX ? 12 : -12,
          }}
          animate={{
            x: [`${drone.startX}vw`, `${(drone.startX + drone.endX) / 2}vw`, `${drone.endX}vw`],
            y: [`${drone.startY}vh`, `${drone.startY + (drone.endY - drone.startY) * 0.5 + Math.sin(drone.id) * 8}vh`, `${drone.endY}vh`],
            rotate: [
              drone.startX < drone.endX ? 10 : -10,
              drone.startX < drone.endX ? 18 : -18,
              drone.startX < drone.endX ? 8 : -8,
            ],
          }}
          transition={{
            duration: drone.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: drone.delay,
          }}
        >
          {/* Subtle drone elevation bobbing */}
          <motion.div
            animate={{ y: [0, -12, 0, 8, 0] }}
            transition={{
              duration: 3 + (drone.id % 3),
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full relative"
          >
            {/* Tactical Target Reticle / Signal ring under high visibility drone */}
            {drone.size > 70 && (
              <div className="absolute -inset-2 border border-sky-400/20 rounded-full animate-ping pointer-events-none opacity-40" />
            )}

            <DroneSVG type={drone.type} color={drone.color} hasLed={drone.hasLed} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
