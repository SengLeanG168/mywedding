"use client";

import { useTranslations } from 'next-intl';
import { KhmerHeart } from './KhmerOrnament';

interface GuestNameFrameProps {
  guestName: string;
}

export default function GuestNameFrame({ guestName }: GuestNameFrameProps) {
  const t = useTranslations('Event');

  return (
    <div className="relative w-full max-w-[280px] mx-auto mt-5 mb-6 group">
      {/* Corner accent lines */}
      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-md" />
      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-md" />
      <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-md" />
      <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-md" />

      {/* Glass frame */}
      <div
        className="relative border border-primary/50 rounded-xl px-6 py-4 text-center"
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Guest label pill */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 flex items-center gap-2 border border-primary/40 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <KhmerHeart className="w-3 h-3 text-primary" />
          <span className="text-[10px] sm:text-xs text-primary font-medium tracking-widest uppercase whitespace-nowrap">
            {t('guestName')}
          </span>
          <KhmerHeart className="w-3 h-3 text-primary" />
        </div>

        {/* Guest name */}
        <h3
          className="text-[clamp(1.125rem,4vw,1.375rem)] font-serif font-medium pt-3 pb-1 leading-tight line-clamp-2 text-white"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
        >
          {guestName}
        </h3>
      </div>
    </div>
  );
}
