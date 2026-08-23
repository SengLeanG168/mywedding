"use client";

import React from 'react';

interface KhmerOrnamentLetterFrameProps {
  title: string;
  text: string;
}

export default function KhmerOrnamentLetterFrame({ title, text }: KhmerOrnamentLetterFrameProps) {
  return (
    <div className="relative w-full bg-card/85 dark:bg-card/75 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-primary/30 my-6 sm:my-8 text-center overflow-hidden transition-all">
      {/* Top Gold Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-2xl sm:rounded-t-3xl opacity-80" />

      {/* Khmer Corner Motifs */}
      <div className="absolute top-3 left-3 w-8 h-8 text-primary/40 pointer-events-none">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
          <path d="M0 0H20C20 11.0457 11.0457 20 0 20V0Z" />
        </svg>
      </div>
      <div className="absolute top-3 right-3 w-8 h-8 text-primary/40 pointer-events-none rotate-90">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
          <path d="M0 0H20C20 11.0457 11.0457 20 0 20V0Z" />
        </svg>
      </div>

      {/* Header Title */}
      <div className="relative z-10 space-y-2 mb-4">
        <h3 className="text-lg sm:text-xl font-serif font-bold text-primary tracking-wide break-words px-2">
          {title}
        </h3>
        
        {/* Khmer Ornamental Divider */}
        <div className="flex items-center justify-center gap-2 opacity-60">
          <span className="w-10 h-[1px] bg-primary" />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="w-10 h-[1px] bg-primary" />
        </div>
      </div>

      {/* Content Text */}
      <div className="relative z-10 px-2 sm:px-4">
        <p className="text-sm sm:text-base text-foreground/90 font-serif leading-relaxed sm:leading-loose whitespace-pre-line">
          {text}
        </p>
      </div>

      {/* Bottom Corner Motifs */}
      <div className="absolute bottom-3 left-3 w-8 h-8 text-primary/40 pointer-events-none -rotate-90">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
          <path d="M0 0H20C20 11.0457 11.0457 20 0 20V0Z" />
        </svg>
      </div>
      <div className="absolute bottom-3 right-3 w-8 h-8 text-primary/40 pointer-events-none rotate-180">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current">
          <path d="M0 0H20C20 11.0457 11.0457 20 0 20V0Z" />
        </svg>
      </div>

      {/* Bottom Gold Gradient Line */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-b-2xl sm:rounded-b-3xl opacity-80" />
    </div>
  );
}
