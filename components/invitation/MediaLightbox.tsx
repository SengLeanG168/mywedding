"use client";

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export interface MediaItem {
  src: string;
  type?: 'image' | 'qr' | 'map-qr';
  title?: string;
  alt?: string;
}

interface MediaLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function MediaLightbox({ items, initialIndex, isOpen, onClose, locale }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const isKm = locale === 'km';
  const tClose = isKm ? "បិទ" : "Close";
  const tPrev = isKm ? "រូបមុន" : "Previous";
  const tNext = isKm ? "រូបបន្ទាប់" : "Next";
  const tSwipe = isKm ? "អូសឆ្វេងស្ដាំដើម្បីមើលបន្ត" : "Swipe left or right to view more";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentIndex(initialIndex);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length]);

  if (!isOpen || items.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setTouchStart(null);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-10">
        <div className="text-white/80 text-sm font-medium">
          {items.length > 1 && `${currentIndex + 1} / ${items.length}`}
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          aria-label={tClose}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative w-full flex-1 flex items-center justify-center p-4">
        {items.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden sm:flex"
            aria-label={tPrev}
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        <div className="w-full h-full max-h-[85vh] flex flex-col items-center justify-center">
          {currentItem.type === 'map-qr' ? (
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <QRCodeSVG 
                value={currentItem.src} 
                size={280}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
              />
            </div>
          ) : (
            <img 
              src={currentItem.src} 
              alt={currentItem.alt || "Preview"} 
              className="w-full h-full object-contain drop-shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {currentItem.title && (
            <div className="mt-6 text-white text-center text-lg sm:text-xl font-serif">
              {currentItem.title}
            </div>
          )}
        </div>

        {items.length > 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden sm:flex"
            aria-label={tNext}
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Footer Instructions (Mobile) */}
      {items.length > 1 && (
        <div className="absolute bottom-6 w-full text-center text-white/50 text-xs sm:hidden pointer-events-none">
          {tSwipe}
        </div>
      )}
    </div>
  );
}
