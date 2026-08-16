"use client";

import { useEffect, useState } from 'react';
import KhmerWeddingCard from './KhmerWeddingCard';

interface WeddingCardStackProps {
  brideName: string;
  groomName: string;
  guestName: string;
  onOpen: () => void;
  hasMusic: boolean;
  hasVideo: boolean;
}

export default function WeddingCardStack(props: WeddingCardStackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to trigger entrance animations after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto h-[85vh] flex items-center justify-center">
      
      {/* Left Back Card */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out origin-bottom-right
          ${mounted ? '-translate-x-12 sm:-translate-x-16 translate-y-4 -rotate-6 opacity-60 scale-95' : 'translate-x-0 translate-y-0 rotate-0 opacity-0 scale-90'}
          blur-[1px] brightness-90 z-0`}
      >
        <div className="pointer-events-none opacity-50">
          <KhmerWeddingCard {...props} isMain={false} />
        </div>
      </div>

      {/* Right Back Card */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out delay-75 origin-bottom-left
          ${mounted ? 'translate-x-12 sm:translate-x-16 translate-y-6 rotate-6 opacity-40 scale-90' : 'translate-x-0 translate-y-0 rotate-0 opacity-0 scale-90'}
          blur-[2px] brightness-75 z-0`}
      >
        <div className="pointer-events-none opacity-30">
          <KhmerWeddingCard {...props} isMain={false} />
        </div>
      </div>

      {/* Main Center Card */}
      <div 
        className={`relative z-10 w-full transition-all duration-1000 delay-150 ease-out
          ${mounted ? 'translate-y-0 opacity-100 scale-100 shadow-2xl' : 'translate-y-8 opacity-0 scale-95'}`}
      >
        <KhmerWeddingCard {...props} isMain={true} />
      </div>

    </div>
  );
}
