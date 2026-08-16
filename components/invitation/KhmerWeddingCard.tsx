"use client";

import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KhmerHeart, KhmerArch, CornerMotif, DividerMotif } from './KhmerOrnament';
import { PetalScatters, CornerFloral } from './FloralDecoration';
import GuestNameFrame from './GuestNameFrame';
import CardUtilityButtons from './CardUtilityButtons';

interface KhmerWeddingCardProps {
  brideName: string;
  groomName: string;
  guestName: string;
  onOpen: () => void;
  hasMusic: boolean;
  hasVideo: boolean;
  isMain?: boolean;
}

export default function KhmerWeddingCard({
  brideName,
  groomName,
  guestName,
  onOpen,
  hasMusic,
  hasVideo,
  isMain = true,
}: KhmerWeddingCardProps) {
  const t = useTranslations('Event');

  return (
    <div className={`relative w-full max-w-[420px] aspect-[9/16] sm:aspect-[3/5] max-h-[85vh] mx-auto bg-[#fffbf2] dark:bg-[#1a1510] rounded-[32px] shadow-xl overflow-hidden border-2 border-primary/20 ${isMain ? 'ring-4 ring-white/20 dark:ring-black/20' : ''}`}>
      
      {/* Decorative Outer Border Lines */}
      <div className="absolute inset-3 border-[1.5px] border-primary/40 rounded-[20px] pointer-events-none z-10" />
      <div className="absolute inset-[15px] border-[0.5px] border-primary/20 rounded-[18px] pointer-events-none z-10" />

      {/* Background Ornaments & Florals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <CornerMotif className="absolute top-4 left-4 w-12 h-12 text-primary opacity-60" />
        <CornerMotif className="absolute top-4 right-4 w-12 h-12 text-primary opacity-60 rotate-90" />
        <CornerMotif className="absolute bottom-4 left-4 w-12 h-12 text-primary opacity-60 -rotate-90" />
        <CornerMotif className="absolute bottom-4 right-4 w-12 h-12 text-primary opacity-60 rotate-180" />
        
        <CornerFloral className="absolute bottom-0 left-0 w-32 h-32 -translate-x-4 translate-y-4 opacity-80" />
        <CornerFloral className="absolute bottom-0 right-0 w-32 h-32 translate-x-4 translate-y-4 rotate-90 opacity-80" />
        <PetalScatters className="bottom-16 left-1/2 -translate-x-1/2" />
      </div>

      {/* Utility Buttons */}
      {isMain && (
        <CardUtilityButtons hasMusic={hasMusic} hasVideo={hasVideo} />
      )}

      {/* Content Container */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-between py-6 sm:py-10 px-4 sm:px-6 overflow-y-auto hide-scrollbar">
        
        {/* 1. Top Section: Arch & Title */}
        <div className="flex flex-col items-center w-full mt-2">
          <KhmerArch className="w-full max-w-[160px] sm:max-w-[200px] h-8 sm:h-10 text-primary opacity-70 mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-primary font-serif font-bold text-center leading-tight drop-shadow-sm px-2">
            {t('weddingCeremony')}
          </h1>
          <KhmerHeart className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-2 sm:mt-3 opacity-80 animate-pulse" />
        </div>

        {/* 2. Middle Section: Names */}
        <div className="flex flex-col items-center w-full my-4 sm:my-6 space-y-2 sm:space-y-3">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-xs md:text-sm text-primary/80 uppercase tracking-widest font-medium mb-1">
              {t('groom')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground font-medium drop-shadow-sm px-2">
              {groomName}
            </h2>
          </div>
          
          <div className="w-full max-w-[100px] sm:max-w-[120px] py-1 opacity-70">
             <DividerMotif className="w-full text-primary" />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] sm:text-xs md:text-sm text-primary/80 uppercase tracking-widest font-medium mb-1">
              {t('bride')}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-foreground font-medium drop-shadow-sm px-2">
              {brideName}
            </h2>
          </div>
        </div>

        {/* 3. Bottom Section: Invitation & Action */}
        <div className="flex flex-col items-center w-full mt-auto mb-2">
          <p className="text-sm sm:text-base md:text-lg text-primary font-serif italic text-center px-4 font-medium mb-2 sm:mb-0">
            {t('youAreWarmlyInvited')}
          </p>
          
          <GuestNameFrame guestName={guestName} />

          {isMain && (
            <div className="flex flex-col items-center mt-2 sm:mt-4">
              <Button
                onClick={onOpen}
                size="icon"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_0_20px_rgba(194,155,98,0.3)] hover:shadow-[0_0_30px_rgba(194,155,98,0.5)] hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground group relative"
                aria-label={t('openInvitation')}
              >
                {/* Pulse ring effect */}
                <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
              </Button>
              <span className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-primary tracking-wider uppercase font-serif">
                {t('openInvitation')}
              </span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
