import React from 'react';

interface HeartPhotoFrameProps {
  src: string;
  className?: string;
}

export default function HeartPhotoFrame({ src, className = "w-48 h-48 sm:w-64 sm:h-64 mb-12" }: HeartPhotoFrameProps) {
  return (
    <div className={`relative mx-auto flex items-center justify-center ${className}`}>
      {/* Outer Romantic Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-90 -z-10" />

      {/* Top Ornament */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary/80 z-20 text-xl font-serif">
        ✧
      </div>
      
      {/* SVG Container */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full drop-shadow-[0_10px_15px_rgba(212,175,55,0.4)] relative z-10"
      >
        <defs>
          <clipPath id="heart-clip">
            <path d="M 50,85 C 50,85 15,55 15,30 C 15,15 30,10 40,15 C 45,17 50,22 50,22 C 50,22 55,17 60,15 C 70,10 85,15 85,30 C 85,55 50,85 50,85 Z" />
          </clipPath>
          
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="50%" stopColor="#fcf6ba" />
            <stop offset="100%" stopColor="#b38728" />
          </linearGradient>
        </defs>

        {/* The Clipped Image */}
        <image 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          preserveAspectRatio="xMidYMid slice" 
          href={src} 
          clipPath="url(#heart-clip)" 
        />
        
        {/* The Gold Border overlaying the edge of the image */}
        <path 
          d="M 50,85 C 50,85 15,55 15,30 C 15,15 30,10 40,15 C 45,17 50,22 50,22 C 50,22 55,17 60,15 C 70,10 85,15 85,30 C 85,55 50,85 50,85 Z" 
          fill="none" 
          stroke="url(#gold-gradient)" 
          strokeWidth="1.5" 
          className="opacity-90"
        />
      </svg>

      {/* Bottom Ornament */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-primary/80 z-20 text-xl font-serif">
        ✧
      </div>
      
      {/* Side Ornaments */}
      <div className="absolute top-1/2 -left-2 -translate-y-1/2 text-primary/60 z-20 text-sm">
        ✤
      </div>
      <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-primary/60 z-20 text-sm">
        ✤
      </div>
    </div>
  );
}
