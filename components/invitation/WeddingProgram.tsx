"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatLocalizedDate } from '@/lib/date';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface WeddingProgramProps {
  programDays: any[];
  locale: string;
}

type AnimationPhase = 'movingDot' | 'retractingLine' | 'segmentHidden';

function formatTime(timeStr: string, locale: string) {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  if (!hourStr || !minuteStr) return timeStr;
  
  let hour = parseInt(hourStr, 10);
  const ampmEn = hour >= 12 ? 'PM' : 'AM';
  
  let khmerPeriod = 'ព្រឹក';
  if (hour >= 12 && hour < 17) khmerPeriod = 'រសៀល';
  else if (hour >= 11 && hour < 12) khmerPeriod = 'ថ្ងៃត្រង់';
  else if (hour >= 17 && hour < 20) khmerPeriod = 'ល្ងាច';
  else if (hour >= 20 || hour < 5) khmerPeriod = 'យប់';

  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  if (locale === 'km') {
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const h = hour12.toString().split('').map(d => khmerNums[parseInt(d, 10)]).join('');
    const m = minuteStr.split('').map(d => khmerNums[parseInt(d, 10)]).join('');
    return `ម៉ោង ${h}:${m} ${khmerPeriod}`;
  } else {
    return `${hour12}:${minuteStr} ${ampmEn}`;
  }
}

interface SegmentCoord {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  pathD: string;
  isLeft: boolean;
}

interface ActiveTimelineConnectorProps {
  coord: SegmentCoord;
  showDot: boolean;
  isRetracting: boolean;
  activeSegmentIndex: number;
  animationCycle: number;
  index: number;
}

function ActiveTimelineConnector({
  coord,
  showDot,
  isRetracting,
  activeSegmentIndex,
  animationCycle,
  index,
}: ActiveTimelineConnectorProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);

  // Mathematically track the dot on the exact measured SVG path to top center of next card
  useEffect(() => {
    if (!showDot) {
      setDotPos(null);
      return;
    }

    const pathEl = pathRef.current;
    if (!pathEl) return;

    const totalLength = pathEl.getTotalLength();
    const duration = 2200; // 2.2s duration
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      const pt = pathEl.getPointAtLength(progress * totalLength);
      setDotPos({ x: pt.x, y: pt.y });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showDot, activeSegmentIndex, animationCycle, coord.pathD]);

  return (
    <g
      key={`connector-g-${index}-${animationCycle}`}
      className={
        isRetracting
          ? coord.isLeft
            ? 'line-retracting-lr'
            : 'line-retracting-rl'
          : ''
      }
    >
      <defs>
        <filter id={`goldGlowOrb-${index}`} x="-100%" y="-100%" width="300%" height="300%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#d4af37" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Real measured dashed connector line dropping into top-center of target card */}
      <path
        ref={pathRef}
        d={coord.pathD}
        fill="none"
        stroke="rgba(212, 175, 55, 0.9)"
        strokeWidth="2"
        className="curved-dashed-road"
      />

      {/* Glowing Moving Dot landing directly at the top center of next card */}
      {showDot && dotPos && (
        <g>
          <circle
            cx={dotPos.x}
            cy={dotPos.y}
            r="6.5"
            fill="rgba(251, 191, 36, 0.5)"
            filter={`url(#goldGlowOrb-${index})`}
          />
          <circle
            cx={dotPos.x}
            cy={dotPos.y}
            r="3.5"
            fill="#ffffff"
            stroke="#d4af37"
            strokeWidth="1.5"
          />
        </g>
      )}
    </g>
  );
}

interface ProgramDayCardProps {
  day: any;
  dayIndex: number;
  locale: string;
  isDayActive: boolean;
  activeSegmentIndex: number;
  animationPhase: AnimationPhase;
  animationCycle: number;
  onVisibilityChange: (dayIndex: number, ratio: number) => void;
}

function ProgramDayCard({
  day,
  dayIndex,
  locale,
  isDayActive,
  activeSegmentIndex,
  animationPhase,
  animationCycle,
  onVisibilityChange,
}: ProgramDayCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = day.items || [];
  const itemsCount = items.length;
  const dayTitle = locale === 'km' ? day.titleKm || day.titleEn : day.titleEn || day.titleKm;
  const formattedDayDate = day.date ? formatLocalizedDate(day.date, locale) : '';

  // Real measured card center coordinates
  const [segmentCoords, setSegmentCoords] = useState<SegmentCoord[]>([]);

  // Dynamically calculate the path from current card edge to top-center of next card
  const updateSegmentCoordinates = useCallback(() => {
    if (!timelineRef.current) return;
    const containerRect = timelineRef.current.getBoundingClientRect();
    const newCoords: SegmentCoord[] = [];

    for (let i = 0; i < itemsCount - 1; i++) {
      const card1 = cardRefs.current[i];
      const card2 = cardRefs.current[i + 1];

      if (card1 && card2) {
        const r1 = card1.getBoundingClientRect();
        const r2 = card2.getBoundingClientRect();
        const isLeft = i % 2 === 0;

        // Start anchor: real vertical center of source card edge
        const startX = isLeft
          ? r1.right - containerRect.left
          : r1.left - containerRect.left;
        const startY = r1.top + r1.height / 2 - containerRect.top;

        // Target anchor: TOP CENTER of target card
        const targetX = r2.left + r2.width / 2 - containerRect.left;
        const targetY = r2.top - containerRect.top;

        // Smooth rounded corner radius
        const dx = Math.abs(targetX - startX);
        const dy = Math.abs(targetY - startY);
        const radius = Math.min(18, dx / 2, dy / 2);

        let pathD = '';
        if (isLeft) {
          // Left Card -> Right Card:
          // Runs horizontally across from Card 1 right edge to targetX,
          // bends around smooth corner, and drops down vertically right above Card 2 center!
          pathD = `M ${startX},${startY} L ${targetX - radius},${startY} Q ${targetX},${startY} ${targetX},${startY + radius} L ${targetX},${targetY}`;
        } else {
          // Right Card -> Left Card:
          // Runs horizontally left from Card 2 left edge to targetX,
          // bends around smooth corner, and drops down vertically right above Card 3 center!
          pathD = `M ${startX},${startY} L ${targetX + radius},${startY} Q ${targetX},${startY} ${targetX},${startY + radius} L ${targetX},${targetY}`;
        }

        newCoords.push({ startX, startY, targetX, targetY, pathD, isLeft });
      }
    }

    setSegmentCoords(newCoords);
  }, [itemsCount]);

  // Recalculate on mount, window resize, and container size changes
  useEffect(() => {
    updateSegmentCoordinates();

    const el = timelineRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      updateSegmentCoordinates();
    });

    resizeObserver.observe(el);
    window.addEventListener('resize', updateSegmentCoordinates);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSegmentCoordinates);
    };
  }, [updateSegmentCoordinates]);

  // IntersectionObserver to report visibility ratio to parent
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        onVisibilityChange(dayIndex, ratio);
      },
      {
        threshold: [0, 0.15, 0.25, 0.35, 0.5, 0.75, 1.0],
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [dayIndex, onVisibilityChange]);

  const activeCoord = segmentCoords[activeSegmentIndex];
  const isSegmentActive = isDayActive && activeSegmentIndex < itemsCount - 1 && !!activeCoord;
  const showConnector = isSegmentActive && (animationPhase === 'movingDot' || animationPhase === 'retractingLine');
  const showDot = isSegmentActive && animationPhase === 'movingDot';
  const isRetracting = isSegmentActive && animationPhase === 'retractingLine';

  return (
    <div
      ref={containerRef}
      className="relative bg-card/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl border border-primary/25 overflow-hidden transition-all duration-500"
    >
      {/* Khmer ornamental top accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      {/* Day Header */}
      <div className="text-center mb-8 sm:mb-10">
        <h3 className="text-[clamp(1.1rem,4vw,1.35rem)] font-bold text-primary font-serif px-2 break-words">
          {dayTitle}
        </h3>
        {formattedDayDate && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 px-2 flex items-center justify-center gap-1.5 font-sans">
            <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
            <span>{formattedDayDate}</span>
          </p>
        )}
        
        {/* Decorative header line */}
        <div className="w-24 sm:w-32 h-[2px] mx-auto mt-3 header-dashed-line" />
      </div>

      {/* Alternating Left-Right Cards Timeline Container */}
      <div ref={timelineRef} className="relative w-full max-w-xl mx-auto py-2">
        {/* Full-width/height SVG overlay for real measured connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {showConnector && activeCoord && (
            <ActiveTimelineConnector
              key={`connector-${dayIndex}-${activeSegmentIndex}-${animationCycle}`}
              coord={activeCoord}
              showDot={showDot}
              isRetracting={isRetracting}
              activeSegmentIndex={activeSegmentIndex}
              animationCycle={animationCycle}
              index={activeSegmentIndex}
            />
          )}
        </svg>

        {/* Program Cards */}
        <div className="space-y-6 sm:space-y-10 relative z-10">
          {items.map((item: any, index: number) => {
            const isLeft = index % 2 === 0;
            const hasNext = index < itemsCount - 1;
            const isCardActive = isDayActive && hasNext && index === activeSegmentIndex;
            const showArrow = isCardActive && animationPhase === 'movingDot';

            const itemTitle = locale === 'km' ? item.titleKm || item.titleEn : item.titleEn || item.titleKm;
            const itemDesc = locale === 'km' ? item.descriptionKm || item.descriptionEn : item.descriptionEn || item.descriptionKm;

            return (
              <div key={item.id || index} className="relative w-full">
                {/* Program Item Card Row */}
                <div className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  {/* Card Element with Ref for real coordinate measurement */}
                  <div
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`relative w-fit max-w-[50%] sm:max-w-[46%] h-auto bg-card/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary/20 shadow-sm hover:border-primary/40 transition-all text-left flex flex-col items-start z-10 ${
                      isLeft ? 'mr-auto ml-0' : 'ml-auto mr-0'
                    }`}
                  >
                    {/* Time Badge */}
                    {item.time && (
                      <div className="text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1 mb-1.5 shadow-sm border border-primary/20 font-sans">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary shrink-0" />
                        <span>{formatTime(item.time, locale)}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm md:text-base font-bold font-serif text-foreground break-words w-full">
                      {itemTitle}
                    </h4>

                    {/* Description */}
                    {itemDesc && (
                      <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed break-words font-sans mt-1 w-full">
                        {itemDesc}
                      </p>
                    )}

                    {/* Static Arrow anchored at vertical center of active card */}
                    {showArrow && (
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          isLeft ? '-right-5 sm:-right-6' : '-left-5 sm:-left-6'
                        } text-primary font-bold text-sm sm:text-base select-none pointer-events-none drop-shadow-[0_0_4px_rgba(212,175,55,0.8)]`}
                      >
                        {isLeft ? '→' : '←'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Khmer ornamental bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  );
}

export default function WeddingProgram({ programDays, locale }: WeddingProgramProps) {
  const t = useTranslations('Program');

  // Track intersection ratio of each day to select the single active visible day
  const [dayRatios, setDayRatios] = useState<{ [index: number]: number }>({});
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  // Active segment and animation phase for the active visible day
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('movingDot');
  const [animationCycle, setAnimationCycle] = useState(0);

  const handleVisibilityChange = useCallback((dayIndex: number, ratio: number) => {
    setDayRatios((prev) => {
      const next = { ...prev, [dayIndex]: ratio };
      let highestIdx: number | null = null;
      let maxRatio = 0.25; // Minimum 25% visibility threshold to trigger

      Object.entries(next).forEach(([idxStr, r]) => {
        const idx = Number(idxStr);
        if (r > maxRatio) {
          maxRatio = r;
          highestIdx = idx;
        }
      });

      // Update active day and reset segment if active day changed
      setActiveDayIndex((currentActive) => {
        if (currentActive !== highestIdx) {
          setActiveSegmentIndex(0);
          setAnimationPhase('movingDot');
          setAnimationCycle((c) => c + 1);
          return highestIdx;
        }
        return currentActive;
      });

      return next;
    });
  }, []);

  const currentDay = activeDayIndex !== null ? programDays?.[activeDayIndex] : null;
  const currentDayItemsCount = currentDay?.items?.length || 0;
  const currentDaySegmentsCount = Math.max(0, currentDayItemsCount - 1);

  // Step progression effect for the single active day
  useEffect(() => {
    if (activeDayIndex === null || currentDaySegmentsCount === 0) return;

    let timer: NodeJS.Timeout;

    if (animationPhase === 'movingDot') {
      // 1. Dot moves along dashed connector line for 2.2s
      timer = setTimeout(() => {
        setAnimationPhase('retractingLine');
      }, 2200);
    } else if (animationPhase === 'retractingLine') {
      // 2. Dashed line smoothly retracts for 1.0s
      timer = setTimeout(() => {
        setAnimationPhase('segmentHidden');
      }, 1000);
    } else if (animationPhase === 'segmentHidden') {
      // 3. Keep line completely hidden for 400ms before advancing cleanly
      timer = setTimeout(() => {
        if (activeSegmentIndex < currentDaySegmentsCount - 1) {
          setActiveSegmentIndex((prev) => prev + 1);
          setAnimationCycle((prev) => prev + 1);
          setAnimationPhase('movingDot');
        } else {
          // Finished all segments in this active day -> restart loop from segment 0
          setActiveSegmentIndex(0);
          setAnimationCycle((prev) => prev + 1);
          setAnimationPhase('movingDot');
        }
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [activeDayIndex, activeSegmentIndex, animationPhase, currentDaySegmentsCount]);

  if (!programDays || programDays.length === 0) return null;

  return (
    <section className="mt-16 relative w-full scroll-mt-8 sm:scroll-mt-10" id="program-section">
      <style jsx global>{`
        @keyframes curvedDashFlow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -24;
          }
        }

        .curved-dashed-road {
          stroke-dasharray: 6 6;
          animation: curvedDashFlow 1.6s linear infinite;
        }

        @keyframes lineRetractLR {
          0% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
            visibility: visible;
          }
          100% {
            clip-path: inset(0 0 0 100%);
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes lineRetractRL {
          0% {
            clip-path: inset(0 0 0 0);
            opacity: 1;
            visibility: visible;
          }
          100% {
            clip-path: inset(0 100% 0 0);
            opacity: 0;
            visibility: hidden;
          }
        }

        .line-retracting-lr {
          animation: lineRetractLR 1s ease-in-out forwards;
        }

        .line-retracting-rl {
          animation: lineRetractRL 1s ease-in-out forwards;
        }

        @keyframes headerDashFlow {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 24px 0;
          }
        }

        .header-dashed-line {
          background: repeating-linear-gradient(
            to right,
            rgba(212, 175, 55, 0.9) 0px,
            rgba(212, 175, 55, 0.9) 6px,
            transparent 6px,
            transparent 12px
          );
          background-size: 24px 2px;
          animation: headerDashFlow 1.8s linear infinite;
          will-change: background-position;
        }

        @media (prefers-reduced-motion: reduce) {
          .curved-dashed-road,
          .header-dashed-line,
          .line-retracting-lr,
          .line-retracting-rl {
            animation: none !important;
            clip-path: none !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          {t('weddingProgram')}
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </h2>
        <span className="inline-block w-10 h-[1.5px] bg-primary mt-3" />
      </div>

      <div className="space-y-8 sm:space-y-12">
        {programDays.map((day, dayIndex) => (
          <ProgramDayCard
            key={day.id || dayIndex}
            day={day}
            dayIndex={dayIndex}
            locale={locale}
            isDayActive={dayIndex === activeDayIndex}
            activeSegmentIndex={activeSegmentIndex}
            animationPhase={animationPhase}
            animationCycle={animationCycle}
            onVisibilityChange={handleVisibilityChange}
          />
        ))}
      </div>
    </section>
  );
}
