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
  alt = ""
}: ProgramIconProps) {
  const customUrl = iconImageUrl?.trim();
  const iconSrc = customUrl || getProgramIconSrc(title, iconType, null);

  if (!iconSrc) return null;

  return (
    <span
      className={`program-icon-wrapper relative inline-flex items-center justify-center shrink-0 w-full h-full rounded-[inherit] text-[#8C6F3D] fill-[#8C6F3D] stroke-[#8C6F3D] border-[#8C6F3D] dark:text-primary dark:fill-primary dark:stroke-primary dark:border-primary/30 ${className}`}
    >
      <span
        className="program-icon-glyph w-full h-full inline-block transition-colors duration-200 text-[#8C6F3D] fill-[#8C6F3D] stroke-[#8C6F3D] dark:text-primary dark:fill-primary dark:stroke-primary"
        style={{
          maskImage: `url("${iconSrc}")`,
          WebkitMaskImage: `url("${iconSrc}")`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: 'currentColor',
        }}
        role="img"
        aria-label={alt || (title || 'Program Icon')}
      />
    </span>
  );
}
