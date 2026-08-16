"use client"

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MusicPlayerProps {
  url?: string | null;
  title?: string | null;
}

export default function MusicPlayer({ url, title }: MusicPlayerProps) {
  const t = useTranslations('Event');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const [showEnableButton, setShowEnableButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;

    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.5;
    
    const handleError = () => {
      setError(true);
    };

    audio.addEventListener('error', handleError);
    audioRef.current = audio;
    
    // Autoplay attempt
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setShowEnableButton(false);
        })
        .catch((err) => {
          console.log("Autoplay prevented by browser, waiting for user click.", err);
          setIsPlaying(false);
          setShowEnableButton(true);
        });
    }

    return () => {
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [url]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!url || error) return null;

  const handleEnableMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setIsMuted(false);
        setShowEnableButton(false);
      })
      .catch(err => console.error("Playback failed", err));
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;

    // If browser blocked the initial autoplay, the audio is paused. Clicking the button should play it first.
    if (!isPlaying) {
      handleEnableMusic();
      return;
    }

    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
      {showEnableButton && (
        <Button
          onClick={handleEnableMusic}
          className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 animate-bounce"
        >
          <Music className="w-4 h-4 mr-2" />
          {t('tapToEnableMusic')}
        </Button>
      )}

      <div className={`flex items-center space-x-2 bg-background/80 backdrop-blur-md p-2 rounded-full shadow-xl border border-border ${showEnableButton ? 'hidden' : ''}`}>
        {title && (
          <span className="text-xs font-medium px-2 hidden sm:block max-w-[150px] truncate">
            {title}
          </span>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full w-10 h-10 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          onClick={handleMuteToggle}
          aria-label={isMuted ? t('unmute') : t('mute')}
        >
          {(!isPlaying || isMuted) ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5 animate-pulse" />
          )}
        </Button>
      </div>
    </div>
  );
}
