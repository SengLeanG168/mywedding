"use client"

import { useState } from 'react';
import VideoLoadingOverlay from './VideoLoadingOverlay';

interface HeroVideoProps {
  type: string;
  url: string;
  poster?: string | null;
}

export default function HeroVideo({ type, url, poster }: HeroVideoProps) {
  const [error, setError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  if (!url || type === 'none') {
    return null;
  }

  // A helper to extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (type === 'youtube') {
    const videoId = getYouTubeId(url);
    const embedUrl = videoId 
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0` 
      : url;

    return (
      <div className="relative w-full overflow-hidden bg-black flex flex-col items-center justify-center">
        {error ? (
          <div className="text-white/50 text-sm z-10 py-10">Video unavailable</div>
        ) : (
          <>
            <iframe
              className="w-full h-auto aspect-video portrait:aspect-[9/16] object-contain pointer-events-none"
              src={embedUrl}
              title="Hero Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsVideoLoading(false)}
              onError={() => {
                setIsVideoLoading(false);
                setError(true);
              }}
            />
            <VideoLoadingOverlay isLoading={isVideoLoading && !error} />
          </>
        )}
        {/* Overlay gradient to ensure text readability if placed over it */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>
    );
  }

  if (type === 'mp4') {
    return (
      <div className="relative w-full overflow-hidden bg-black flex flex-col items-center justify-center">
        {error ? (
          <div className="text-white/50 text-sm z-10 py-10">
            Video unavailable
          </div>
        ) : (
          <>
            <video
              className="w-full h-auto aspect-video portrait:aspect-[9/16] object-contain"
              src={url}
              poster={poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onLoadStart={() => setIsVideoLoading(true)}
              onWaiting={() => setIsVideoLoading(true)}
              onStalled={() => setIsVideoLoading(true)}
              onSeeking={() => setIsVideoLoading(true)}
              onLoadedData={() => setIsVideoLoading(false)}
              onCanPlay={() => setIsVideoLoading(false)}
              onCanPlayThrough={() => setIsVideoLoading(false)}
              onPlaying={() => setIsVideoLoading(false)}
              onError={() => {
                setIsVideoLoading(false);
                setError(true);
              }}
            />
            <VideoLoadingOverlay isLoading={isVideoLoading && !error} />
          </>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>
    );
  }

  return null;
}
