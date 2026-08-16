"use client";

import React from 'react';

// Soft petals scattered at the bottom
export const PetalScatters = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute pointer-events-none opacity-60 ${className}`}>
      {/* Several SVG petals */}
      <svg className="absolute w-4 h-4 text-rose-300 -rotate-12 top-0 left-0" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0C10 0 2 2 2 10C2 18 10 20 10 20C10 20 18 18 18 10C18 2 10 0 10 0Z" opacity="0.8"/>
      </svg>
      <svg className="absolute w-5 h-5 text-rose-200 rotate-45 top-6 left-10" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0C10 0 2 2 2 10C2 18 10 20 10 20C10 20 18 18 18 10C18 2 10 0 10 0Z" opacity="0.6"/>
      </svg>
      <svg className="absolute w-3 h-3 text-pink-300 -rotate-45 top-4 left-20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0C10 0 2 2 2 10C2 18 10 20 10 20C10 20 18 18 18 10C18 2 10 0 10 0Z" opacity="0.7"/>
      </svg>
      <svg className="absolute w-4 h-4 text-red-200 rotate-90 top-12 left-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0C10 0 2 2 2 10C2 18 10 20 10 20C10 20 18 18 18 10C18 2 10 0 10 0Z" opacity="0.5"/>
      </svg>
    </div>
  );
};

// Corner Floral cluster
export const CornerFloral = ({ className = "" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {/* Leaves */}
      <path d="M20 80 Q 50 50 80 20 Q 90 40 80 80 Z" fill="currentColor" opacity="0.3" className="text-green-600 dark:text-green-800" />
      <path d="M10 90 Q 40 70 70 10 Q 80 30 70 90 Z" fill="currentColor" opacity="0.4" className="text-emerald-500 dark:text-emerald-700" />
      {/* Flower */}
      <circle cx="30" cy="70" r="15" fill="currentColor" className="text-rose-200 dark:text-rose-900" opacity="0.8" />
      <circle cx="45" cy="55" r="12" fill="currentColor" className="text-pink-100 dark:text-pink-900" opacity="0.9" />
      <circle cx="35" cy="65" r="5" fill="currentColor" className="text-yellow-400 dark:text-yellow-600" />
    </svg>
  );
};
