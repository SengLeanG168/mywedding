"use client";

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

interface MemoryGalleryProps {
  images: string[];
  isKm: boolean;
  onImageClick: (index: number) => void;
}

export default function MemoryGallery({ images, isKm, onImageClick }: MemoryGalleryProps) {
  const [orientations, setOrientations] = useState<Record<string, 'landscape' | 'portrait'>>({});

  useEffect(() => {
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

  if (!images || images.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16" id="gallery-section">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary">
          {isKm ? 'វិចិត្រសាល' : 'Gallery'}
        </h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

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
    </section>
  );
}
