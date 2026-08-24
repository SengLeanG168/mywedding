"use client";

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, MessageCircleHeart } from 'lucide-react';
import { formatKhmerDateTime } from '@/lib/date';

export interface WishItem {
  id?: string;
  guestName?: string;
  name?: string;
  message: string;
  createdAt?: string | Date;
}

interface WishMarqueeProps {
  eventId: string;
  newWishes?: WishItem[];
  refreshTrigger?: number;
}

export default function WishMarquee({ eventId, newWishes = [], refreshTrigger = 0 }: WishMarqueeProps) {
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishes = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/wishes`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.wishes)) {
          setWishes(data.wishes);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wishes:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes, refreshTrigger]);

  // Merge newly submitted wishes in real-time
  useEffect(() => {
    if (newWishes && newWishes.length > 0) {
      setWishes((prev) => {
        const existingKeys = new Set(
          prev.map((w) => `${(w.guestName || w.name || '').trim()}-${w.message.trim()}`)
        );
        const filteredNew = newWishes.filter(
          (nw) =>
            nw.message &&
            nw.message.trim().length > 0 &&
            !existingKeys.has(`${(nw.guestName || nw.name || '').trim()}-${nw.message.trim()}`)
        );
        return [...filteredNew, ...prev];
      });
    }
  }, [newWishes]);

  if (loading) return null;

  // Empty state fallback
  if (wishes.length === 0) {
    return (
      <section className="mt-12 sm:mt-16 w-full text-center" id="wishes-section">
        <div className="mb-4">
          <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary flex items-center justify-center gap-2">
            <MessageCircleHeart className="w-6 h-6 text-primary" />
            សារជូនពរ
          </h2>
          <p className="text-xs text-muted-foreground mt-1">សារជូនពរពីភ្ញៀវកិត្តិយស</p>
          <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
        </div>
        <div className="py-5 px-4 text-xs text-muted-foreground italic bg-card/40 rounded-2xl border border-primary/20 max-w-sm mx-auto">
          មិនទាន់មានសារជូនពរ
        </div>
      </section>
    );
  }

  // Multiply items for continuous seamless loop
  let list = wishes;
  if (list.length < 8) {
    list = [...list, ...list, ...list, ...list];
  }

  return (
    <section className="mt-12 sm:mt-16 w-full overflow-hidden" id="wishes-section">
      <style jsx>{`
        @keyframes marqueeMove {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes topBorderLight {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes bottomBorderLight {
          0% {
            right: -40%;
          }
          100% {
            right: 100%;
          }
        }
        .marquee-track {
          display: flex;
          gap: 1.25rem;
          width: max-content;
          animation: marqueeMove 35s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .wish-card {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          border: 1px solid rgba(212, 175, 55, 0.4);
          background: hsl(var(--card));
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
          width: 270px;
          padding: 1rem 1.125rem;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 640px) {
          .wish-card {
            width: 330px;
          }
        }
        /* Moving LED light line on top border */
        .wish-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #d4af37,
            #ffffff,
            #d4af37,
            transparent
          );
          animation: topBorderLight 2.8s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        /* Moving LED light line on bottom border */
        .wish-card::after {
          content: "";
          position: absolute;
          bottom: 0;
          right: -40%;
          width: 40%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #d4af37,
            #ffffff,
            #d4af37,
            transparent
          );
          animation: bottomBorderLight 2.8s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none !important;
          }
          .wish-card::before,
          .wish-card::after {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>

      <div className="text-center mb-6">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          សារជូនពរ
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </h2>
        <p className="text-xs text-muted-foreground mt-1">សារជូនពរពីភ្ញៀវកិត្តិយស</p>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

      {/* Marquee Wrapper with Overflow Hidden */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Soft edge fade overlays */}
        <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Continuous Scrolling Marquee Track */}
        <div className="marquee-track">
          {[...list, ...list].map((item, index) => {
            const name = item.guestName || item.name || 'ភ្ញៀវកិត្តិយស';
            const formattedDate = item.createdAt ? formatKhmerDateTime(item.createdAt) : '';

            return (
              <div
                key={`${item.id || name}-${index}`}
                className="wish-card"
              >
                {/* Top: Centered Guest Name (Decorative font) */}
                <div className="text-center w-full mb-1.5">
                  <span className="font-serif font-bold text-primary text-sm sm:text-base leading-snug block truncate">
                    {name}
                  </span>
                </div>

                {/* Under Guest Name: Centered Date & Time in Khmer */}
                {formattedDate && (
                  <div className="text-center w-full text-[10px] sm:text-[11px] text-muted-foreground/75 font-sans tracking-normal mb-3">
                    {formattedDate}
                  </div>
                )}

                {/* Delicate Centered Gold Divider */}
                <div className="w-16 mx-auto h-[1px] bg-primary/25 mb-3" />

                {/* Wish / Message Text (Plain readable font) */}
                <div className="text-xs sm:text-sm text-foreground/90 font-sans font-normal leading-relaxed text-center line-clamp-4">
                  “{item.message}”
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
