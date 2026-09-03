"use client"

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import VideoLoadingOverlay from './VideoLoadingOverlay';

interface InvitationVideoIntroProps {
  type: string;
  url: string;
  poster?: string | null;
  locale?: string;
  onContinue: () => void;
}

export default function InvitationVideoIntro({ type, url, poster, locale, onContinue }: InvitationVideoIntroProps) {
  const t = useTranslations('Event');
  const [error, setError] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleContinue = () => {
    onContinue();
  };

  useEffect(() => {
    if (error) {
      setShowContinue(true);
      return;
    }
    
    // Timer fallback: after 20 seconds of video intro, show continue button
    const timeout = setTimeout(() => {
      setShowContinue(true);
    }, 10000);

    return () => {
      clearTimeout(timeout);
    };
  }, [error]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.currentTime >= 20) {
      setShowContinue(true);
    }
  };

  const handleEnded = () => {
    setIsVideoLoading(false);
    setShowContinue(true);
  };

  if (!url || type === 'none') {
    return null;
  }

  const getYouTubeId = (urlStr: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlStr.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const continueText = locale === 'km' 
    ? 'ចុចមើលធៀបបន្ទាប់' 
    : (locale ? 'Continue to Invitation' : t('continueToInvitation'));

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-[100vh] overflow-hidden bg-black flex flex-col items-center justify-center">
      {type === 'youtube' ? (
        <>
          {error ? (
            <div className="text-white/50 text-sm z-10">{t('videoUnavailable')}</div>
          ) : (
            <>
              <iframe
                className={`absolute top-0 left-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                src={getYouTubeId(url) ? `https://www.youtube.com/embed/${getYouTubeId(url)}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&disablekb=1&modestbranding=1` : url}
                title="Hero Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => {
                  setIsLoaded(true);
                  setIsVideoLoading(false);
                }}
                onError={() => {
                  setIsVideoLoading(false);
                  setError(true);
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          {error ? (
            <div className="text-white/50 text-sm z-10">{t('videoUnavailable')}</div>
          ) : (
            <>
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                src={url}
                poster={poster || undefined}
                autoPlay
                muted
                playsInline
                controls={false}
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                onLoadStart={() => setIsVideoLoading(true)}
                onWaiting={() => setIsVideoLoading(true)}
                onStalled={() => setIsVideoLoading(true)}
                onSeeking={() => setIsVideoLoading(true)}
                onLoadedData={() => setIsVideoLoading(false)}
                onCanPlay={() => {
                  setIsLoaded(true);
                  setIsVideoLoading(false);
                }}
                onCanPlayThrough={() => setIsVideoLoading(false)}
                onPlaying={() => {
                  setIsLoaded(true);
                  setIsVideoLoading(false);
                }}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={() => {
                  setIsVideoLoading(false);
                  setError(true);
                }}
              />
            </>
          )}
        </>
      )}

      {/* Loading Spinner Overlay */}
      <VideoLoadingOverlay isLoading={isVideoLoading && !error} />

      {/* Dark gradient overlay at bottom for button readability */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

      {/* Continue Button */}
      <div 
        className={`absolute bottom-12 z-20 transition-all duration-1000 ${
          showContinue ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <Button 
          onClick={handleContinue}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-full px-8 py-6 flex items-center gap-2 group shadow-xl cursor-pointer"
        >
          <span className="text-base font-medium font-serif tracking-wide">
            {continueText}
          </span>
          <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
