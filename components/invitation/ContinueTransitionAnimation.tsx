"use client";

import { useEffect, useState } from 'react';

interface ContinueTransitionAnimationProps {
  onComplete: () => void;
  durationMs?: number;
}

const BUTTERFLIES = [
  { id: 1, color: '#f472b6', glow: '#f472b6', size: 38, className: 'butterfly-path-1', delay: '0.0s' }, // Pink
  { id: 2, color: '#fbbf24', glow: '#fef08a', size: 34, className: 'butterfly-path-2', delay: '0.3s' }, // Gold
  { id: 3, color: '#38bdf8', glow: '#7dd3fc', size: 36, className: 'butterfly-path-3', delay: '0.6s' }, // Blue
  { id: 4, color: '#c084fc', glow: '#e9d5ff', size: 32, className: 'butterfly-path-4', delay: '0.9s' }, // Purple
  { id: 5, color: '#ffffff', glow: '#ffffff', size: 35, className: 'butterfly-path-5', delay: '1.2s' }, // White
  { id: 6, color: '#fb923c', glow: '#ffedd5', size: 36, className: 'butterfly-path-6', delay: '1.5s' }, // Orange
  { id: 7, color: '#2dd4bf', glow: '#99f6e4', size: 30, className: 'butterfly-path-7', delay: '1.8s' }, // Emerald Teal
];

function AnimatedButterfly({ color, glow, size }: { color: string; glow: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 10px ${glow})`,
      }}
      className="relative flex items-center justify-center"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Left Wing */}
        <g className="animate-wing-left origin-[50px_50px]">
          <path
            d="M 50 48 C 25 10, 0 30, 10 55 C 20 70, 42 62, 50 48 Z"
            fill={color}
            opacity="0.95"
          />
          <path
            d="M 50 52 C 30 55, 10 65, 20 85 C 32 95, 46 72, 50 52 Z"
            fill={color}
            opacity="0.8"
          />
        </g>
        {/* Right Wing */}
        <g className="animate-wing-right origin-[50px_50px]">
          <path
            d="M 50 48 C 75 10, 100 30, 90 55 C 80 70, 58 62, 50 48 Z"
            fill={color}
            opacity="0.95"
          />
          <path
            d="M 50 52 C 70 55, 90 65, 80 85 C 68 95, 54 72, 50 52 Z"
            fill={color}
            opacity="0.8"
          />
        </g>
        {/* Body */}
        <ellipse cx="50" cy="52" rx="2.5" ry="14" fill="#ffffff" />
        <path d="M 49 39 Q 44 28, 40 24" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 51 39 Q 56 28, 60 24" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ContinueTransitionAnimation({
  onComplete,
  durationMs = 3800,
}: ContinueTransitionAnimationProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, durationMs - 500));

    const completeTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, durationMs]);

  return (
    <div
      className={`fixed inset-0 z-50 w-full h-full bg-black/90 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none transition-opacity duration-500 max-w-[430px] mx-auto ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-amber-500/20 via-pink-500/25 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-amber-300/15 rounded-full blur-2xl animate-ping opacity-30" />

      {/* Main Container */}
      <div className="relative flex items-center justify-center w-72 h-72">
        {/* Center Glowing Heart */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative animate-heartbeat">
            <svg
              className="w-24 h-24 text-amber-300 drop-shadow-[0_0_35px_rgba(244,114,182,0.9)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-xl animate-pulse -z-10" />
          </div>
        </div>

        {/* Small Sparkle / Firefly Particles */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 360) / 14;
          const delay = (i * 0.12).toFixed(2);
          const colors = [
            'bg-amber-300 shadow-[0_0_10px_#fde047]',
            'bg-pink-400 shadow-[0_0_10px_#f472b6]',
            'bg-sky-300 shadow-[0_0_10px_#7dd3fc]',
            'bg-purple-300 shadow-[0_0_10px_#d8b4fe]',
          ];
          const colorClass = colors[i % colors.length];

          return (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full opacity-0 pointer-events-none"
              style={{
                animation: `sparkleFly 3.2s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                transform: `rotate(${angle}deg) translate(80px)`,
              }}
            >
              <div className={`w-full h-full rounded-full ${colorClass}`} />
            </div>
          );
        })}

        {/* 7 Animated Flying Butterflies */}
        {BUTTERFLIES.map((bf) => (
          <div
            key={bf.id}
            className={`absolute top-1/2 left-1/2 pointer-events-none ${bf.className}`}
            style={{
              animationDelay: bf.delay,
            }}
          >
            <AnimatedButterfly color={bf.color} glow={bf.glow} size={bf.size} />
          </div>
        ))}
      </div>

      {/* Romantic Golden Sparkles */}
      <div className="mt-6 text-amber-200/90 font-serif text-sm tracking-widest uppercase animate-pulse flex items-center gap-2">
        <span>✨</span>
        <span>💕</span>
        <span>✨</span>
      </div>

      {/* Embedded CSS Animations */}
      <style jsx>{`
        /* Wing Flapping */
        @keyframes flapLeft {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(65deg); }
        }
        @keyframes flapRight {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-65deg); }
        }
        :global(.animate-wing-left) {
          animation: flapLeft 0.35s ease-in-out infinite;
        }
        :global(.animate-wing-right) {
          animation: flapRight 0.35s ease-in-out infinite;
        }

        /* Heart Pulsing */
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 25px rgba(244,114,182,0.8)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 45px rgba(251,191,36,0.95)); }
        }
        :global(.animate-heartbeat) {
          animation: heartbeat 1.8s ease-in-out infinite;
        }

        /* Sparkle Particles */
        @keyframes sparkleFly {
          0% { opacity: 0; transform: rotate(0deg) translate(30px) scale(0.3); }
          30% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { opacity: 0; transform: rotate(360deg) translate(110px) scale(1.1); }
        }

        /* 7 Unique Flight Paths around Heart */
        :global(.butterfly-path-1) {
          animation: path1 3.5s ease-in-out infinite;
        }
        @keyframes path1 {
          0% { opacity: 0; transform: translate(-100px, 40px) rotate(-20deg) scale(0.6); }
          20% { opacity: 1; transform: translate(-60px, -60px) rotate(15deg) scale(1); }
          50% { transform: translate(70px, -40px) rotate(40deg) scale(1.1); }
          80% { opacity: 1; transform: translate(40px, 70px) rotate(-10deg) scale(0.9); }
          100% { opacity: 0; transform: translate(-100px, 40px) rotate(-20deg) scale(0.6); }
        }

        :global(.butterfly-path-2) {
          animation: path2 3.6s ease-in-out infinite;
        }
        @keyframes path2 {
          0% { opacity: 0; transform: translate(90px, 60px) rotate(30deg) scale(0.7); }
          25% { opacity: 1; transform: translate(50px, -70px) rotate(-15deg) scale(1); }
          60% { transform: translate(-70px, -50px) rotate(-45deg) scale(1.1); }
          85% { opacity: 1; transform: translate(-40px, 60px) rotate(10deg) scale(0.8); }
          100% { opacity: 0; transform: translate(90px, 60px) rotate(30deg) scale(0.7); }
        }

        :global(.butterfly-path-3) {
          animation: path3 3.4s ease-in-out infinite;
        }
        @keyframes path3 {
          0% { opacity: 0; transform: translate(-80px, -70px) rotate(45deg) scale(0.5); }
          30% { opacity: 1; transform: translate(70px, -30px) rotate(80deg) scale(1.05); }
          65% { transform: translate(-60px, 60px) rotate(-30deg) scale(0.95); }
          100% { opacity: 0; transform: translate(-80px, -70px) rotate(45deg) scale(0.5); }
        }

        :global(.butterfly-path-4) {
          animation: path4 3.7s ease-in-out infinite;
        }
        @keyframes path4 {
          0% { opacity: 0; transform: translate(70px, -80px) rotate(-60deg) scale(0.6); }
          35% { opacity: 1; transform: translate(-70px, 30px) rotate(-10deg) scale(1.1); }
          70% { transform: translate(60px, 60px) rotate(30deg) scale(0.85); }
          100% { opacity: 0; transform: translate(70px, -80px) rotate(-60deg) scale(0.6); }
        }

        :global(.butterfly-path-5) {
          animation: path5 3.5s ease-in-out infinite;
        }
        @keyframes path5 {
          0% { opacity: 0; transform: translate(0px, 100px) rotate(-10deg) scale(0.5); }
          30% { opacity: 1; transform: translate(-80px, -20px) rotate(35deg) scale(1.1); }
          65% { transform: translate(80px, -40px) rotate(-25deg) scale(1); }
          100% { opacity: 0; transform: translate(0px, 100px) rotate(-10deg) scale(0.5); }
        }

        :global(.butterfly-path-6) {
          animation: path6 3.8s ease-in-out infinite;
        }
        @keyframes path6 {
          0% { opacity: 0; transform: translate(-90px, 0px) rotate(20deg) scale(0.6); }
          30% { opacity: 1; transform: translate(30px, -85px) rotate(55deg) scale(1.05); }
          70% { transform: translate(-30px, 80px) rotate(-40deg) scale(0.9); }
          100% { opacity: 0; transform: translate(-90px, 0px) rotate(20deg) scale(0.6); }
        }

        :global(.butterfly-path-7) {
          animation: path7 3.3s ease-in-out infinite;
        }
        @keyframes path7 {
          0% { opacity: 0; transform: translate(0px, -90px) rotate(0deg) scale(0.5); }
          25% { opacity: 1; transform: translate(85px, 20px) rotate(-35deg) scale(1); }
          60% { transform: translate(-80px, 40px) rotate(45deg) scale(1.1); }
          100% { opacity: 0; transform: translate(0px, -90px) rotate(0deg) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
