"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  url?: string | null;
  title?: string | null;
  showControl?: boolean;
}

declare global {
  interface Window {
    __playWeddingMusic?: () => void;
  }
}

export default function MusicPlayer({ url, title, showControl = true }: MusicPlayerProps) {
  const t = useTranslations('Event');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getMs = () => Math.round(performance.now());

  const playMusic = useCallback((source = 'autoplay') => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (audio.paused) {
      if (source === 'autoplay') {
        console.log(`music: play attempt [${getMs()}ms]`);
      } else {
        console.log(`music: first interaction fallback [${getMs()}ms]`);
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log(`music: play success [${getMs()}ms]`);
            try {
              localStorage.setItem('weddingMusicEnabled', 'true');
            } catch (e) {}
          })
          .catch((err) => {
            console.log(`music: play blocked [${getMs()}ms]`, err?.name || err);
            setIsPlaying(false);
          });
      }
    }
  }, []);

  // Expose playMusic on window so user taps (e.g. "បើកធៀប") can invoke audio.play() synchronously as Android fallback
  useEffect(() => {
    window.__playWeddingMusic = () => playMusic('fallback');
    return () => {
      delete window.__playWeddingMusic;
    };
  }, [playMusic]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    console.log(`music: component mounted [${getMs()}ms]`);
    console.log(`music: src set [${getMs()}ms]`, url);
    console.log(`music: preload started [${getMs()}ms]`);

    audio.volume = 0.4; // Soft volume between 0.35 - 0.5

    const handleError = () => {
      setError(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      try {
        localStorage.setItem('weddingMusicEnabled', 'true');
      } catch (e) {}
    };

    const handlePause = () => {
      if (!audio.muted) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // 1. Immediate play attempt on mount
    playMusic('autoplay');

    // 2. Global user interaction fallback listeners (for Android when autoplay is blocked)
    const handleUserInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        playMusic('fallback');
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { capture: true, passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { capture: true, passive: true });
    window.addEventListener('click', handleUserInteraction, { capture: true, passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction, { capture: true });
      window.removeEventListener('touchstart', handleUserInteraction, { capture: true });
      window.removeEventListener('click', handleUserInteraction, { capture: true });

      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [url, playMusic]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!url || error) return null;

  const handleMuteToggle = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      playMusic('fallback');
      return;
    }

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  return (
    <>
      {/* 1. Real HTML5 <audio> element rendered in DOM from first frame for browser preloading */}
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        autoPlay
        loop
        playsInline
        className="hidden"
      />

      {/* 2. Top-left Mute/Unmute UI Control (absolute positioning scrolls naturally with page content like ThemeToggle) */}
      {showControl && (
        <div className="absolute top-4 left-4 z-50 pointer-events-auto">
          <button
            type="button"
            onClick={handleMuteToggle}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-md shadow-md border border-primary/30 flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95"
            aria-label={isMuted ? t('unmute') : t('mute')}
            title={isMuted ? t('unmute') : t('mute')}
          >
            {(!isPlaying || isMuted) ? (
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary animate-pulse" />
            )}
          </button>
        </div>
      )}
    </>
  );
}