"use client";

import React from 'react';

interface GuestNameFrameProps {
  guestName?: string;
}

export default function GuestNameFrame({ guestName }: GuestNameFrameProps) {
  const displayName = guestName && guestName.trim().length > 0 ? guestName.trim() : 'ភ្ញៀវកិត្តិយស';

  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[340px] mx-auto mt-4 mb-4 text-center select-none">
      {/* Outer Traditional Khmer Wedding Frame */}
      <div
        className="relative px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl border border-primary/60 shadow-[0_4px_24px_rgba(212,175,55,0.22)]"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 18, 10, 0.78) 0%, rgba(45, 30, 16, 0.65) 50%, rgba(20, 14, 8, 0.78) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Inner delicate gold line */}
        <div className="absolute inset-1.5 border border-primary/30 rounded-xl pointer-events-none" />

        {/* 4 Traditional Khmer Corner Kbach Ornaments */}
        {/* Top-Left */}
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <path d="M2 14 V4 C2 2.9 2.9 2 4 2 H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="7" cy="7" r="1.8" fill="currentColor" />
            <path d="M3 3 L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <path d="M22 14 V4 C22 2.9 21.1 2 20 2 H10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="17" cy="7" r="1.8" fill="currentColor" />
            <path d="M21 3 L15 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <path d="M2 10 V20 C2 21.1 2.9 22 4 22 H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="7" cy="17" r="1.8" fill="currentColor" />
            <path d="M3 21 L9 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            <path d="M22 10 V20 C22 21.1 21.1 22 20 22 H10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="17" cy="17" r="1.8" fill="currentColor" />
            <path d="M21 21 L15 15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Center Top Gold Diamond Accent */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#1a120a] rounded-full border border-primary/50 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rotate-45 bg-primary drop-shadow-[0_0_4px_#d4af37]" />
        </div>

        {/* Center Bottom Gold Diamond Accent */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#1a120a] rounded-full border border-primary/50 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rotate-45 bg-primary drop-shadow-[0_0_4px_#d4af37]" />
        </div>

        {/* Guest Name Typography */}
        <div className="relative z-10 py-1 overflow-visible">
          <h3
            className="text-[clamp(1.125rem,4.5vw,1.45rem)] font-serif font-bold text-primary tracking-normal leading-[1.8] sm:leading-[1.9] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] overflow-visible px-1"
          >
            {displayName}
          </h3>
        </div>
      </div>
    </div>
  );
}
