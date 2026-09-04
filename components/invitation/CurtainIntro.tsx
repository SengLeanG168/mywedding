"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import VideoLoadingOverlay from "./VideoLoadingOverlay";

interface CurtainIntroProps {
  enabled: boolean;
  duration?: number;
  onComplete: () => void;
  curtainIntroType?: "css" | "video" | "image";
  curtainIntroVideoUrl?: string;
  curtainVideoUrl?: string;
  curtainImageUrl?: string;
  curtainIntroImageUrl?: string;
  allowSkip?: boolean;
}

export default function CurtainIntro({
  enabled,
  onComplete,
  curtainIntroVideoUrl,
  curtainVideoUrl,
  curtainImageUrl,
  curtainIntroImageUrl,
  allowSkip = true,
}: CurtainIntroProps) {
  const t = useTranslations("Event");
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = (curtainIntroVideoUrl || curtainVideoUrl || "").trim();
  const imageUrl = (curtainImageUrl || curtainIntroImageUrl || "").trim();
  const hasCurtainMedia = Boolean(videoUrl || imageUrl);

  // ─── MEDIA STATE ──────────────────────────────────────────────────
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoVisible, setVideoVisible] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // If curtain is not enabled or no actual curtain media exists, complete immediately
  useEffect(() => {
    if (!enabled || !hasCurtainMedia) {
      onComplete();
    }
  }, [enabled, hasCurtainMedia, onComplete]);

  if (!enabled || !hasCurtainMedia) return null;

  const useVideo = Boolean(videoUrl && !videoFailed);

  // ─── SKIP HANDLER ────────────────────────────────────────────────
  const handleSkip = () => {
    if (typeof window !== "undefined" && (window as any).__playWeddingMusic) {
      (window as any).__playWeddingMusic();
    }
    setVideoVisible(false);
    setTimeout(onComplete, 250);
  };

  // ─── VIDEO MODE EFFECTS ──────────────────────────────────────────
  useEffect(() => {
    if (!useVideo) {
      if (videoFailed) {
        onComplete();
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsVideoLoading(false);
        setVideoFailed(true);
        onComplete();
      });
    }
  }, [useVideo, videoFailed, onComplete]);

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
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          playsInline
          onLoadStart={() => setIsVideoLoading(true)}
          onWaiting={() => setIsVideoLoading(true)}
          onStalled={() => setIsVideoLoading(true)}
          onSeeking={() => setIsVideoLoading(true)}
          onLoadedData={() => setIsVideoLoading(false)}
          onCanPlay={() => setIsVideoLoading(false)}
          onCanPlayThrough={() => setIsVideoLoading(false)}
          onPlaying={() => setIsVideoLoading(false)}
          onEnded={() => {
            setIsVideoLoading(false);
            setVideoVisible(false);
            setTimeout(onComplete, 250);
          }}
          onError={() => {
            setIsVideoLoading(false);
            setVideoFailed(true);
            onComplete();
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <VideoLoadingOverlay isLoading={isVideoLoading && !videoFailed && videoVisible} />

        <div
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
        />

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

  // ─── IMAGE CURTAIN ───────────────────────────────────────────────
  if (imageUrl) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black touch-none flex items-center justify-center overflow-hidden"
        style={{
          opacity: videoVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: videoVisible ? "auto" : "none",
        }}
      >
        <img
          src={imageUrl}
          alt="Curtain Intro"
          className="w-full h-full object-cover"
        />
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

  return null;
}
