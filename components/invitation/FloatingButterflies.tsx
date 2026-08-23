"use client";

import { useEffect, useState } from 'react';

interface ButterflyItem {
  id: number;
  type: 'gold' | 'silver';
  size: number;
  top: string;
  left: string;
  animClass: string;
  delay: string;
  opacity: number;
}

const BUTTERFLIES: ButterflyItem[] = [
  { id: 1, type: 'gold', size: 28, top: '15%', left: '8%', animClass: 'float-path-1', delay: '0s', opacity: 0.75 },
  { id: 2, type: 'silver', size: 24, top: '25%', left: '82%', animClass: 'float-path-2', delay: '2.5s', opacity: 0.7 },
  { id: 3, type: 'gold', size: 30, top: '45%', left: '12%', animClass: 'float-path-3', delay: '5s', opacity: 0.65 },
  { id: 4, type: 'silver', size: 26, top: '62%', left: '85%', animClass: 'float-path-4', delay: '1.2s', opacity: 0.75 },
  { id: 5, type: 'gold', size: 25, top: '78%', left: '15%', animClass: 'float-path-5', delay: '3.8s', opacity: 0.7 },
  { id: 6, type: 'silver', size: 27, top: '88%', left: '78%', animClass: 'float-path-6', delay: '6.5s', opacity: 0.65 },
];

function SVGButterfly({ type, size }: { type: 'gold' | 'silver'; size: number }) {
  const isGold = type === 'gold';
  const mainColor = isGold ? '#d4af37' : '#cbd5e1';
  const glowColor = isGold ? 'rgba(212, 175, 55, 0.6)' : 'rgba(203, 213, 225, 0.6)';
  const innerColor = isGold ? '#fef08a' : '#ffffff';

  return (
    <div
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 6px ${glowColor})`,
      }}
      className="relative flex items-center justify-center pointer-events-none"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Left Wing */}
        <g className="animate-bg-flap-left origin-[50px_50px]">
          <path
            d="M 50 48 C 25 10, 0 30, 10 55 C 20 70, 42 62, 50 48 Z"
            fill={mainColor}
            opacity="0.9"
          />
          <path
            d="M 50 52 C 30 55, 10 65, 20 85 C 32 95, 46 72, 50 52 Z"
            fill={mainColor}
            opacity="0.75"
          />
        </g>
        {/* Right Wing */}
        <g className="animate-bg-flap-right origin-[50px_50px]">
          <path
            d="M 50 48 C 75 10, 100 30, 90 55 C 80 70, 58 62, 50 48 Z"
            fill={mainColor}
            opacity="0.9"
          />
          <path
            d="M 50 52 C 70 55, 90 65, 80 85 C 68 95, 54 72, 50 52 Z"
            fill={mainColor}
            opacity="0.75"
          />
        </g>
        {/* Body & Antennae */}
        <ellipse cx="50" cy="52" rx="2.5" ry="13" fill={innerColor} />
        <path d="M 49 40 Q 44 30, 40 26" stroke={innerColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 51 40 Q 56 30, 60 26" stroke={innerColor} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function FloatingButterflies() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  if (reducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5] max-w-[430px] mx-auto select-none">
      {/* Background Soft Floating Gold & Silver Sparkles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const isGold = i % 2 === 0;
        const left = (10 + i * 11) + '%';
        const delay = (i * 1.8).toFixed(1) + 's';
        const bgClass = isGold ? 'bg-amber-300/40 shadow-[0_0_8px_#fde047]' : 'bg-slate-200/40 shadow-[0_0_8px_#ffffff]';

        return (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full pointer-events-none ${bgClass}`}
            style={{
              left,
              top: '90%',
              animation: 'sparkleDrift 14s linear infinite',
              animationDelay: delay,
            }}
          />
        );
      })}

      {/* Floating Gold & Silver Butterflies */}
      {BUTTERFLIES.map((bf) => (
        <div
          key={bf.id}
          className={`absolute pointer-events-none ${bf.animClass}`}
          style={{
            top: bf.top,
            left: bf.left,
            animationDelay: bf.delay,
            opacity: bf.opacity,
          }}
        >
          <SVGButterfly type={bf.type} size={bf.size} />
        </div>
      ))}

      {/* Embedded CSS Animations */}
      <style jsx>{`
        /* Slow Flapping Wings */
        @keyframes bgFlapLeft {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(55deg); }
        }
        @keyframes bgFlapRight {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-55deg); }
        }
        :global(.animate-bg-flap-left) {
          animation: bgFlapLeft 0.7s ease-in-out infinite;
        }
        :global(.animate-bg-flap-right) {
          animation: bgFlapRight 0.7s ease-in-out infinite;
        }

        /* Sparkle Drift Upwards */
        @keyframes sparkleDrift {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 0.8; }
          80% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-80vh) scale(1.2); }
        }

        /* Continuous Slow Floating Paths */
        :global(.float-path-1) { animation: float1 18s ease-in-out infinite; }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(-5deg); }
          25% { transform: translate(25px, -35px) rotate(10deg); }
          50% { transform: translate(45px, 15px) rotate(-12deg); }
          75% { transform: translate(15px, 35px) rotate(8deg); }
        }

        :global(.float-path-2) { animation: float2 20s ease-in-out infinite; }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(8deg); }
          30% { transform: translate(-35px, 30px) rotate(-10deg); }
          60% { transform: translate(-20px, -40px) rotate(15deg); }
          80% { transform: translate(15px, -20px) rotate(-5deg); }
        }

        :global(.float-path-3) { animation: float3 16s ease-in-out infinite; }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(-12deg); }
          35% { transform: translate(30px, -25px) rotate(8deg); }
          70% { transform: translate(-15px, 30px) rotate(-8deg); }
        }

        :global(.float-path-4) { animation: float4 22s ease-in-out infinite; }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(10deg); }
          25% { transform: translate(-30px, -30px) rotate(-12deg); }
          55% { transform: translate(20px, -50px) rotate(8deg); }
          80% { transform: translate(-10px, 25px) rotate(-6deg); }
        }

        :global(.float-path-5) { animation: float5 19s ease-in-out infinite; }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) rotate(-8deg); }
          40% { transform: translate(35px, -35px) rotate(12deg); }
          75% { transform: translate(15px, 20px) rotate(-10deg); }
        }

        :global(.float-path-6) { animation: float6 17s ease-in-out infinite; }
        @keyframes float6 {
          0%, 100% { transform: translate(0, 0) rotate(6deg); }
          30% { transform: translate(-25px, -35px) rotate(-8deg); }
          65% { transform: translate(-40px, 15px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
