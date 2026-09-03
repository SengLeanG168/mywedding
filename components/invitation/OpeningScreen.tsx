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

  const guestName = guest && guest.name && guest.name.trim() ? guest.name.trim() : 'ភ្ញៀវកិត្តិយស';
  const hasMusic   = !!event?.musicUrl;
  const hasVideo   = !!event?.showHeroVideo && !!event?.heroVideoUrl;

  // Priority: openingImageUrl → coverImage → null (default gradient)
  const bgImage: string | null =
    event?.openingImageUrl || event?.coverImage || null;

  const coupleNamesImg = typeof event?.openingCoupleNamesImageUrl === 'string' && event.openingCoupleNamesImageUrl.trim()
    ? event.openingCoupleNamesImageUrl.trim()
    : null;

  const guestImg = typeof event?.openingGuestImageUrl === 'string' && event.openingGuestImageUrl.trim()
    ? event.openingGuestImageUrl.trim()
    : null;

  if (process.env.NODE_ENV === 'development') {
    console.log('[OpeningScreen] openingCoupleNamesImageUrl:', coupleNamesImg);
    console.log('[OpeningScreen] openingGuestImageUrl:', guestImg);
  }

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

        {/* 2. MIDDLE — Couple Names Image (Designed Ornament Image) */}
        {coupleNamesImg ? (
          <div className="flex flex-col items-center justify-center w-full my-auto py-2 px-2 select-none z-20">
            <div className="w-full max-w-[90%] sm:max-w-[440px] flex items-center justify-center">
              <img
                src={coupleNamesImg}
                alt="Couple Names"
                className="max-h-[220px] sm:max-h-[260px] max-w-full w-auto h-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] filter pointer-events-none"
              />
            </div>
          </div>
        ) : (
          <div className="my-auto" />
        )}

        {/* 3. BOTTOM — Invitation text + Uploaded Guest Decorative Frame with Name + Play Button */}
        <div className="flex flex-col items-center w-full">
          <p
            className="text-sm sm:text-base text-primary font-serif font-bold text-center px-4 leading-normal"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
          >
            {t('youAreWarmlyInvited')}
          </p>

          {/* Guest Name inside Uploaded Decorative Frame */}
          {guestImg ? (
            <div className="relative w-[clamp(260px,76vw,340px)] max-w-[88%] min-h-[115px] sm:min-h-[135px] h-auto flex items-center justify-center mx-auto mt-1 mb-2 sm:mt-1.5 sm:mb-2.5 select-none z-20 overflow-visible">
              {/* Frame Background Image */}
              <img
                src={guestImg}
                alt="Decorative Frame"
                className="w-full h-auto max-h-[135px] object-contain object-center block pointer-events-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] filter"
              />
              {/* Centered Dynamic Guest Name with original decorative font-serif */}
              <div className="absolute inset-0 flex items-center justify-center text-center px-[44px] py-3 sm:py-3.5 pointer-events-none overflow-visible">
                <span
                  className="font-serif font-semibold text-[clamp(14px,4vw,19px)] text-[#fbf0dc] block w-full overflow-visible"
                  style={{
                    lineHeight: '2.0',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 14px rgba(0,0,0,0.9)',
                  }}
                >
                  {guestName}
                </span>
              </div>
            </div>
          ) : (
            /* Fallback if no frame image uploaded */
            <div className="my-1.5 px-6 py-2.5 rounded-full border border-primary/40 bg-black/40 backdrop-blur-sm z-20 select-none overflow-visible">
              <span
                className="font-serif font-semibold text-[clamp(14px,3.8vw,17px)] text-primary drop-shadow-md block overflow-visible"
                style={{
                  lineHeight: '1.9',
                  paddingTop: '6px',
                  paddingBottom: '6px',
                  textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                }}
              >
                {guestName}
              </span>
            </div>
          )}

          {/* Play Button */}
          <div className="flex flex-col items-center pt-1">
            <Button
              onClick={handleOpen}
              size="icon"
              className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(194,155,98,0.5)] hover:shadow-[0_0_45px_rgba(194,155,98,0.7)] hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground group relative cursor-pointer"
              aria-label={t('openInvitation')}
            >
              <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
              <Play className="w-7 h-7 ml-1 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
            </Button>
            <span
              className="mt-2.5 text-sm font-medium text-primary tracking-wider uppercase font-serif"
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
