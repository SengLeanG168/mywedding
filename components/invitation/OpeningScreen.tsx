"use client"

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  KhmerHeart,
  KhmerArch,
  CornerMotif,
  DividerMotif,
} from './KhmerOrnament';
import { CornerFloral, PetalScatters } from './FloralDecoration';
import GuestNameFrame from './GuestNameFrame';
import CardUtilityButtons from './CardUtilityButtons';

interface OpeningScreenProps {
  brideName: string;
  groomName: string;
  guest?: any;
  onOpen: () => void;
  event: any;
}

export default function OpeningScreen({
  brideName,
  groomName,
  guest,
  onOpen,
  event,
}: OpeningScreenProps) {
  const t = useTranslations('Event');
  const [isExiting, setIsExiting] = useState(false);

  const guestName  = guest ? guest.name : t('honoredGuest');
  const hasMusic   = !!event?.musicUrl;
  const hasVideo   = !!event?.showHeroVideo && !!event?.heroVideoUrl;

  // Priority: openingImageUrl → coverImage → null (default gradient)
  const bgImage: string | null =
    event?.openingImageUrl || event?.coverImage || null;

  const handleOpen = () => {
    // Synchronously trigger audio playback during direct user gesture on Android
    if (typeof window !== 'undefined' && window.__playWeddingMusic) {
      window.__playWeddingMusic();
    }
    setIsExiting(true);
    setTimeout(onOpen, 1000);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden transition-all duration-1000 ease-in-out ${
        isExiting
          ? 'opacity-0 -translate-y-full pointer-events-none'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {/* ── BACKGROUND ─────────────────────────────────────────── */}
      {bgImage ? (
        <>
          {/* Full-screen photo */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Gradient overlay — dark at top & bottom, lighter in middle so faces show */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        </>
      ) : (
        /* Default warm gradient */
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a0e] via-[#3d2410] to-[#1a0d06]" />
      )}

      {/* ── DECORATIVE CORNER ORNAMENTS ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gold corner motifs */}
        <CornerMotif className="absolute top-4 left-4 w-14 h-14 text-primary opacity-70" />
        <CornerMotif className="absolute top-4 right-4 w-14 h-14 text-primary opacity-70 rotate-90" />
        <CornerMotif className="absolute bottom-4 left-4 w-14 h-14 text-primary opacity-70 -rotate-90" />
        <CornerMotif className="absolute bottom-4 right-4 w-14 h-14 text-primary opacity-70 rotate-180" />

        {/* Inner decorative border lines */}
        <div className="absolute inset-3 border border-primary/30 rounded-none pointer-events-none" />
        <div className="absolute inset-[18px] border border-primary/15 pointer-events-none" />

        {/* Floral clusters at bottom corners */}
        <CornerFloral className="absolute bottom-0 left-0 w-36 h-36 -translate-x-4 translate-y-4 opacity-60" />
        <CornerFloral className="absolute bottom-0 right-0 w-36 h-36 translate-x-4 translate-y-4 rotate-90 opacity-60" />

        {/* Scattered petals near bottom */}
        <PetalScatters className="bottom-20 left-1/2 -translate-x-1/2" />
      </div>

      {/* ── MAIN CONTENT (directly on image) ────────────────────── */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-8 sm:py-12 px-4 sm:px-6 overflow-y-auto hide-scrollbar">

        {/* 1. TOP — Arch + Wedding Title + Heart */}
        <div className="flex flex-col items-center w-full mt-2">
          <KhmerArch className="w-full max-w-[180px] h-8 text-primary opacity-90 mb-4 drop-shadow-lg" />
          <h1
            className="text-[clamp(1.625rem,6vw,2rem)] text-primary font-serif font-bold text-center leading-tight px-2"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
          >
            {t('weddingCeremony')}
          </h1>
          <KhmerHeart className="w-5 h-5 text-primary mt-3 opacity-90 animate-pulse drop-shadow-lg" />
        </div>

        {/* 2. MIDDLE — Couple Names */}
        <div className="flex flex-col items-center w-full my-auto space-y-4">
          {/* Groom */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-primary/90 uppercase tracking-widest font-medium mb-1"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
              {t('groom')}
            </span>
            <h2
              className="text-[clamp(1.375rem,5vw,1.75rem)] font-serif font-semibold text-white px-2"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              {groomName}
            </h2>
          </div>

          {/* Gold divider */}
          <div className="w-full max-w-[100px] py-1 opacity-80">
            <DividerMotif className="w-full text-primary" />
          </div>

          {/* Bride */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-primary/90 uppercase tracking-widest font-medium mb-1"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
              {t('bride')}
            </span>
            <h2
              className="text-[clamp(1.375rem,5vw,1.75rem)] font-serif font-semibold text-white px-2"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.8)' }}
            >
              {brideName}
            </h2>
          </div>
        </div>

        {/* 3. BOTTOM — Invitation text + Guest Frame + Play Button */}
        <div className="flex flex-col items-center w-full space-y-1">
          <p
            className="text-sm sm:text-base text-primary font-serif italic text-center px-4 font-medium"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}
          >
            {t('youAreWarmlyInvited')}
          </p>

          {/* Guest Name Frame — glass style */}
          <GuestNameFrame guestName={guestName} />

          {/* Play Button */}
          <div className="flex flex-col items-center pt-2">
            <Button
              onClick={handleOpen}
              size="icon"
              className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(194,155,98,0.5)] hover:shadow-[0_0_45px_rgba(194,155,98,0.7)] hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground group relative"
              aria-label={t('openInvitation')}
            >
              <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
              <Play className="w-7 h-7 ml-1 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
            </Button>
            <span
              className="mt-3 text-sm font-medium text-primary tracking-wider uppercase font-serif"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}
            >
              {t('openInvitation')}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
