"use client";

import React from 'react';

interface VideoLoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export default function VideoLoadingOverlay({
  isLoading,
  message = "កំពុងផ្ទុកវីដេអូ...",
  className = "",
}: VideoLoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-none select-none ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Elegant Wedding Gold Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer glowing gold ring */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-[#d4af37]/25 border-t-[#d4af37] animate-spin shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
        {/* Inner subtle pulse */}
        <div className="absolute w-4 h-4 rounded-full bg-[#d4af37]/20 animate-ping opacity-40" />
      </div>

      {/* Khmer Loading Text */}
      {message && (
        <p className="mt-2.5 text-[11px] sm:text-xs text-amber-100/90 font-serif tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
          {message}
        </p>
      )}
    </div>
  );
}
