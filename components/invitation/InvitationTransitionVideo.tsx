"use client";

import { useRef, useEffect, useState } from 'react';
import VideoLoadingOverlay from './VideoLoadingOverlay';

interface InvitationTransitionVideoProps {
  url: string;
  onComplete: () => void;
}

export default function InvitationTransitionVideo({
  url,
  onComplete,
}: InvitationTransitionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    // Safety fallback: if video takes unexpectedly long or gets stuck, proceed after 30s
    const timeout = setTimeout(() => {
      onComplete();
    }, 30000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  const handleEnded = () => {
    setIsVideoLoading(false);
    onComplete();
  };

  const handleError = () => {
    console.warn('Transition video failed to load or play, proceeding to content');
    setIsVideoLoading(false);
    setHasError(true);
    onComplete();
  };

  if (!url || hasError) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-[100vh] bg-black overflow-hidden pointer-events-none select-none flex items-center justify-center">
      <video
        ref={videoRef}
        src={url}
        autoPlay
        playsInline
        muted
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        className="w-full h-full object-cover pointer-events-none"
        onLoadStart={() => setIsVideoLoading(true)}
        onWaiting={() => setIsVideoLoading(true)}
        onStalled={() => setIsVideoLoading(true)}
        onSeeking={() => setIsVideoLoading(true)}
        onLoadedData={() => setIsVideoLoading(false)}
        onCanPlay={() => setIsVideoLoading(false)}
        onCanPlayThrough={() => setIsVideoLoading(false)}
        onPlaying={() => setIsVideoLoading(false)}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Loading Spinner Overlay */}
      <VideoLoadingOverlay isLoading={isVideoLoading && !hasError} />
    </div>
  );
}
