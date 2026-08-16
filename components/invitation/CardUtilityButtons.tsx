"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Volume2, VolumeX, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardUtilityButtonsProps {
  hasMusic: boolean;
  hasVideo: boolean;
}

export default function CardUtilityButtons({ hasMusic, hasVideo }: CardUtilityButtonsProps) {
  const t = useTranslations('Event');
  const [isMuted, setIsMuted] = useState(false);
  const [videoPreview, setVideoPreview] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col gap-3">
      {hasVideo && (
        <Button
          variant="outline"
          size="icon"
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/70 text-primary transition-all"
          onClick={() => setVideoPreview(!videoPreview)}
          aria-label={t('playInvitationVideo')}
          title={t('playInvitationVideo')}
        >
          <Video className="w-5 h-5 sm:w-4 sm:h-4" />
        </Button>
      )}
      
      {hasMusic && (
        <Button
          variant="outline"
          size="icon"
          className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/70 text-primary transition-all"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={t('toggleMusic')}
          title={t('toggleMusic')}
        >
          {isMuted ? <VolumeX className="w-5 h-5 sm:w-4 sm:h-4" /> : <Volume2 className="w-5 h-5 sm:w-4 sm:h-4" />}
        </Button>
      )}
    </div>
  );
}
