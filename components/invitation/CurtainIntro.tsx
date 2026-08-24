"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CurtainIntroProps {
  enabled: boolean;
  duration?: number;
  onComplete: () => void;
  curtainIntroType?: "css" | "video";
  curtainIntroVideoUrl?: string;
  allowSkip?: boolean;
}

export default function CurtainIntro({
  enabled,
  duration = 2000,
  onComplete,
  curtainIntroType = "css",
  curtainIntroVideoUrl,
  allowSkip = true,
}: CurtainIntroProps) {
  const t = useTranslations("Event");
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── VIDEO MODE STATE ────────────────────────────────────────────
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoVisible, setVideoVisible] = useState(true);

  // ─── CSS CURTAIN MODE STATE ──────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Decide which mode to actually use
  const useVideo =
    curtainIntroType === "video" &&
    !!curtainIntroVideoUrl &&
    !videoFailed;

  // ─── SKIP HANDLER ────────────────────────────────────────────────
  const handleSkip = () => {
    if (typeof window !== "undefined" && (window as any).__playWeddingMusic) {
      (window as any).__playWeddingMusic();
    }
    if (useVideo) {
      setVideoVisible(false);
      setTimeout(onComplete, 300); // brief fade-out delay
    } else {
      // fast-complete the CSS curtain
      setIsOpen(true);
      setTimeout(() => {
        setIsHidden(true);
        onComplete();
      }, 400);
    }
  };

  // ─── VIDEO MODE EFFECTS ──────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !useVideo) return;

    const video = videoRef.current;
    if (!video) return;

    // Autoplay — attempt programmatic play (browser may block without gesture)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay blocked, fall back to CSS curtain
        setVideoFailed(true);
      });
    }
  }, [enabled, useVideo]);

  // ─── CSS CURTAIN MODE EFFECTS ─────────────────────────────────────
  useEffect(() => {
    if (!enabled || useVideo) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!enabled || prefersReducedMotion) {
      onComplete();
      setIsHidden(true);
      return;
    }

    const openTimer = setTimeout(() => setIsOpen(true), 300);
    const hideTimer = setTimeout(() => {
      setIsHidden(true);
      onComplete();
    }, duration + 300);

    return () => {
      clearTimeout(openTimer);
      clearTimeout(hideTimer);
    };
  }, [enabled, duration, onComplete, useVideo]);

  // ─── NOT ENABLED ─────────────────────────────────────────────────
  if (!enabled) return null;

  // ─── VIDEO CURTAIN ───────────────────────────────────────────────
  if (useVideo) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black touch-none"
        style={{
          opacity: videoVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: videoVisible ? "auto" : "none",
        }}
      >
        {/* Full-screen video */}
        <video
          ref={videoRef}
          src={curtainIntroVideoUrl}
          autoPlay
          muted
          playsInline
          onEnded={() => {
            setVideoVisible(false);
            setTimeout(onComplete, 300);
          }}
          onError={() => {
            // Video failed to load → fall back to CSS curtain
            setVideoFailed(true);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Subtle dark gradient overlay at top for skip button readability */}
        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
        />

        {/* Skip button */}
        {allowSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-5 right-5 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/60 bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-200 active:scale-95"
            aria-label={t("skipIntro")}
          >
            {t("skipIntro")}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // ─── CSS CURTAIN (existing, unchanged) ───────────────────────────
  if (isHidden) return null;

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden bg-black touch-none">
      {/* Left Curtain */}
      <div
        className="relative h-full w-1/2 flex justify-end"
        style={{
          background:
            "linear-gradient(90deg, #4a0404 0%, #7a0016 50%, #5c0011 100%)",
          boxShadow: "inset -10px 0 30px rgba(0,0,0,0.5)",
          transform: isOpen ? "translateX(-100%)" : "translateX(0)",
          transition: `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`,
        }}
      >
        {/* Fabric Folds (Left) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.4) 80px)",
          }}
        />
        {/* Gold Trim (Left) */}
        <div
          className="absolute right-0 h-full w-2 sm:w-3"
          style={{
            background:
              "linear-gradient(180deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
            boxShadow: "-2px 0 10px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Right Curtain */}
      <div
        className="relative h-full w-1/2 flex justify-start"
        style={{
          background:
            "linear-gradient(270deg, #4a0404 0%, #7a0016 50%, #5c0011 100%)",
          boxShadow: "inset 10px 0 30px rgba(0,0,0,0.5)",
          transform: isOpen ? "translateX(100%)" : "translateX(0)",
          transition: `transform ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`,
        }}
      >
        {/* Fabric Folds (Right) */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(270deg, transparent, transparent 40px, rgba(0,0,0,0.2) 40px, rgba(0,0,0,0.4) 80px)",
          }}
        />
        {/* Gold Trim (Right) */}
        <div
          className="absolute left-0 h-full w-2 sm:w-3"
          style={{
            background:
              "linear-gradient(180deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
            boxShadow: "2px 0 10px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
