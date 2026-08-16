"use client";

import React from 'react';

// Simple decorative heart
export const KhmerHeart = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

// Top Arch Ornament
export const KhmerArch = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 60" preserveAspectRatio="none" className={className} fill="none" stroke="currentColor">
    <path d="M 0 60 Q 50 10 100 10 T 200 60" strokeWidth="2" strokeLinecap="round" />
    <path d="M 20 60 Q 60 20 100 20 T 180 60" strokeWidth="1" strokeOpacity="0.6" />
    <circle cx="100" cy="15" r="3" fill="currentColor" />
  </svg>
);

// Corner Motif (can be rotated)
export const CornerMotif = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 50 50" fill="none" stroke="currentColor" className={className}>
    <path d="M 0 0 L 50 0 C 25 0 0 25 0 50 Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M 5 5 L 40 5 Q 10 10 5 40 Z" strokeWidth="1" />
    <circle cx="15" cy="15" r="2" fill="currentColor" />
  </svg>
);

// Horizontal Divider Ornament
export const DividerMotif = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 10" preserveAspectRatio="none" className={className} fill="none" stroke="currentColor">
    <path d="M 0 5 L 40 5" strokeWidth="1" />
    <polygon points="50,1 54,5 50,9 46,5" fill="currentColor" />
    <path d="M 60 5 L 100 5" strokeWidth="1" />
  </svg>
);
