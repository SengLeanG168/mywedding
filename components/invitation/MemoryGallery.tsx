"use client";

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import VideoLoadingOverlay from './VideoLoadingOverlay';

interface MemoryGalleryProps {
  images: string[];
  videoUrl?: string;
  isKm: boolean;
  onImageClick: (index: number) => void;
}

export default function MemoryGallery({ images = [], videoUrl, isKm, onImageClick }: MemoryGalleryProps) {
  const [orientations, setOrientations] = useState<Record<string, 'landscape' | 'portrait'>>({});
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!images || images.length === 0) return;
    images.forEach((url) => {
      const img = new Image();
      img.onload = () => {
        const isLandscape = img.naturalWidth > img.naturalHeight;
        setOrientations((prev) => ({
          ...prev,
          [url]: isLandscape ? 'landscape' : 'portrait',
        }));
      };
      img.src = url;
    });
  }, [images]);

  if ((!images || images.length === 0) && !videoUrl) return null;

  return (
    <section className="mt-12 sm:mt-16 scroll-mt-8 sm:scroll-mt-10" id="gallery-section">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary">
          {isKm ? 'វិចិត្រសាល' : 'Gallery'}
        </h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

      {/* Landscape Gallery Video (16:9) */}
      {videoUrl && (
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="relative w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden border border-primary/25 shadow-lg bg-black/95">
            {videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/85 text-white/60 text-xs sm:text-sm font-serif">
                <p>មិនអាចចាក់វីដេអូបានទេ</p>
                <p className="text-[11px] text-white/40 mt-1">Video unavailable</p>
              </div>
            ) : (
              <>
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                  onLoadStart={() => setIsVideoLoading(true)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onStalled={() => setIsVideoLoading(true)}
                  onSeeking={() => setIsVideoLoading(true)}
                  onLoadedData={() => setIsVideoLoading(false)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onCanPlayThrough={() => setIsVideoLoading(false)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onSeeked={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setVideoError(true);
                  }}
                />
                <VideoLoadingOverlay isLoading={isVideoLoading && !videoError} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 px-2 sm:px-0">
          {images.map((url, index) => {
            const orientation = orientations[url] || 'portrait';
            const isLandscape = orientation === 'landscape';

            return (
              <ScrollReveal
                key={url + index}
                direction="zoom"
                delay={index * 60}
                className={isLandscape ? 'col-span-2' : 'col-span-1'}
              >
                <div
                  className={`relative w-full rounded-xl sm:rounded-2xl overflow-hidden border border-primary/20 shadow-sm bg-card cursor-pointer hover:opacity-90 transition-opacity ${
                    isLandscape ? 'aspect-[16/9]' : 'aspect-[3/4]'
                  }`}
                  onClick={() => onImageClick(index)}
                >
                  <img
                    src={url}
                    alt={`Memory Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
