"use client";

import React from 'react';
import { getProgramIconSrc } from '@/lib/program-icon';

interface ProgramIconProps {
  title?: string | null;
  iconType?: string | null;
  iconImageUrl?: string | null;
  className?: string;
  forceGold?: boolean;
  useMaskFallback?: boolean;
  alt?: string;
}

export default function ProgramIcon({
  title,
  iconType,
  iconImageUrl,
  className = "w-full h-full",
  forceGold = true,
  useMaskFallback = false,
  alt = ""
}: ProgramIconProps) {
  const customUrl = iconImageUrl?.trim();

  // 1. Custom uploaded or URL icon
  if (customUrl) {
    // Optional fallback only if explicitly requested to use CSS mask for simple monochrome SVGs
    if (useMaskFallback && forceGold) {
      return (
        <div
          className={`program-custom-icon-mask ${className}`}
          style={{
            WebkitMaskImage: `url("${customUrl}")`,
            maskImage: `url("${customUrl}")`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            backgroundColor: '#d6b75a'
          }}
          role="img"
          aria-label={alt || (title || 'Program Icon')}
        />
      );
    }

    // Default primary rendering:
    // Render the original icon image inside a gold blend overlay wrapper
    // with stronger gold filter. Preserves icon details, lines, shadows, and recognizable shape.
    if (forceGold) {
      return (
        <span className={`program-uploaded-icon-gold-wrap ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customUrl}
            alt={alt || (title || 'Program Icon')}
            className="w-full h-full object-contain program-uploaded-icon-gold"
            loading="lazy"
          />
        </span>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={customUrl}
        alt={alt || (title || 'Program Icon')}
        className={`${className} object-contain`}
        loading="lazy"
      />
    );
  }

  // 2. Preset or auto-mapped built-in SVG icon
  const iconSrc = getProgramIconSrc(title, iconType, null);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconSrc}
      alt={alt || (title || 'Program Icon')}
      className={`${className} object-contain filter drop-shadow-[0_0_2px_rgba(212,175,55,0.45)]`}
      loading="lazy"
    />
  );
}

