"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { formatLocalizedDate } from '@/lib/date';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { isWeddingEvent } from '@/lib/event-helpers';
import { getProgramIconSrc } from '@/lib/program-icon';
import ProgramIcon from '@/components/program/ProgramIcon';

interface WeddingProgramProps {
  programDays: any[];
  locale: string;
  event?: any;
}

type AnimationPhase = 'movingDot' | 'retractingLine' | 'segmentHidden';

function formatTime(timeStr: string) {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  if (!hourStr || !minuteStr) return timeStr;
  
  let hour = parseInt(hourStr, 10);
  
  let khmerPeriod = 'ព្រឹក';
  if (hour >= 12 && hour < 17) khmerPeriod = 'រសៀល';
  else if (hour >= 11 && hour < 12) khmerPeriod = 'ថ្ងៃត្រង់';
  else if (hour >= 17 && hour < 20) khmerPeriod = 'ល្ងាច';
  else if (hour >= 20 || hour < 5) khmerPeriod = 'យប់';

  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  const h = hour12.toString().split('').map(d => khmerNums[parseInt(d, 10)]).join('');
  const m = minuteStr.split('').map(d => khmerNums[parseInt(d, 10)]).join('');
  return `ម៉ោង ${h}:${m} ${khmerPeriod}`;
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

      {/* Real measured dashed connector line */}
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
  isDark?: boolean;
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
  isDark = false,
}: ProgramDayCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = day.items || [];
  const itemsCount = items.length;
  const dayTitle = day.titleKm || day.titleEn;
  const formattedDayDate = day.date ? formatLocalizedDate(day.date, 'km') : '';

  // Real measured card center coordinates
  const [segmentCoords, setSegmentCoords] = useState<SegmentCoord[]>([]);

  // Dynamically calculate the path from current card edge to top-center of next card
  const updateSegmentCoordinates = useCallback(() => {
    if (!timelineRef.current) return;
    const containerRect = timelineRef.current.getBoundingClientRect();
    const newCoords: SegmentCoord[] = [];
    const isMobile = window.innerWidth < 640;

    for (let i = 0; i < itemsCount - 1; i++) {
      const card1 = cardRefs.current[i];
      const card2 = cardRefs.current[i + 1];

      if (card1 && card2) {
        const r1 = card1.getBoundingClientRect();
        const r2 = card2.getBoundingClientRect();
        const isLeft = i % 2 === 0;

        let startX: number;
        let startY: number;
        let targetX: number;
        let targetY: number;
        let pathD = '';

        if (isMobile) {
          // Mobile: Clean vertical drop from bottom center of Card 1 to top center of Card 2
          startX = r1.left + r1.width / 2 - containerRect.left;
          startY = r1.bottom - containerRect.top;
          targetX = r2.left + r2.width / 2 - containerRect.left;
          targetY = r2.top - containerRect.top;
          pathD = `M ${startX},${startY} L ${targetX},${targetY}`;
        } else {
          // Tablet / Desktop: Alternating zigzag curve from side edge of Card 1 to top center of Card 2
          startX = isLeft
            ? r1.right - containerRect.left
            : r1.left - containerRect.left;
          startY = r1.top + r1.height / 2 - containerRect.top;
          targetX = r2.left + r2.width / 2 - containerRect.left;
          targetY = r2.top - containerRect.top;

          const dx = Math.abs(targetX - startX);
          const dy = Math.abs(targetY - startY);
          const radius = Math.min(18, dx / 2, dy / 2);

          if (isLeft) {
            pathD = `M ${startX},${startY} L ${targetX - radius},${startY} Q ${targetX},${startY} ${targetX},${startY + radius} L ${targetX},${targetY}`;
          } else {
            pathD = `M ${startX},${startY} L ${targetX + radius},${startY} Q ${targetX},${startY} ${targetX},${startY + radius} L ${targetX},${targetY}`;
          }
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
      <div className="text-center mb-6 sm:mb-10">
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

      {/* Timeline Container (Responsive mobile-first to multi-column tablet/desktop) */}
      <div ref={timelineRef} className="relative w-full max-w-xl mx-auto py-3 sm:py-6">
        {/* Full-width/height SVG overlay for real measured connector lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {/* Continuous dashed timeline track connecting all events */}
          {segmentCoords.map((coord, idx) => (
            <path
              key={`track-${dayIndex}-${idx}`}
              d={coord.pathD}
              fill="none"
              stroke="rgba(212, 175, 55, 0.45)"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="dark:stroke-primary/40"
            />
          ))}

          {/* Glowing animated line and orb on the active event segment */}
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

        {/* Program Cards (Mobile: generous vertical breathing room; Tablet/Desktop: alternating 2-column) */}
        <div className="space-y-11 sm:space-y-14 md:space-y-16 relative z-10">
          {items.map((item: any, index: number) => {
            const isLeft = index % 2 === 0;
            const hasNext = index < itemsCount - 1;
            const isCardActive = isDayActive && hasNext && index === activeSegmentIndex;
            const showArrow = isCardActive && animationPhase === 'movingDot';

            const itemTitle = item.titleKm || item.titleEn;
            const itemDesc = item.descriptionKm || item.descriptionEn;

            return (
              <div key={item.id || index} className="relative w-full">
                {/* Program Item Card Row */}
                <div
                  className={`relative w-full flex justify-center sm:${
                    isLeft ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Card Element with Ref for real coordinate measurement */}
                  <div
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`relative w-full sm:w-fit sm:max-w-[48%] md:max-w-[300px] lg:max-w-[340px] h-auto bg-card/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-3.5 md:p-4 border border-primary/20 shadow-sm hover:border-primary/40 transition-all text-left flex flex-col items-start z-10 ${
                      isLeft ? 'sm:mr-auto sm:ml-0' : 'sm:ml-auto sm:mr-0'
                    }`}
                  >
                    {/* Top Row: Traditional Khmer Ceremony Icon & Time Badge */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 mb-2 sm:mb-2.5 w-full flex-wrap sm:flex-nowrap">
                      <div
                        className="timeline-icon-badge w-8 h-8 sm:w-9 sm:h-9 md:w-9.5 md:h-9.5 rounded-full p-1.5 flex items-center justify-center shrink-0 backdrop-blur-xs transition-colors duration-200 border-[1.5px] border-[#8C6F3D] bg-[#fcf8f0] text-[#8C6F3D] fill-[#8C6F3D] stroke-[#8C6F3D] shadow-[0_1px_4px_rgba(140,111,61,0.22)] dark:border dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:fill-primary dark:stroke-primary dark:shadow-none"
                      >
                        <ProgramIcon
                          title={itemTitle}
                          iconType={item.iconType}
                          iconImageUrl={item.iconImageUrl}
                          className="w-full h-full text-[#8C6F3D] border-[#8C6F3D] fill-[#8C6F3D] stroke-[#8C6F3D] dark:text-primary dark:border-primary/30 dark:fill-primary dark:stroke-primary"
                          forceGold={true}
                        />
                      </div>

                      {item.time && (
                        <div
                          className="timeline-time-badge text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs font-sans whitespace-nowrap transition-colors duration-200 text-[#8C6F3D] bg-[#8C6F3D]/10 border border-[#8C6F3D]/35 dark:text-primary dark:bg-primary/10 dark:border-primary/20"
                        >
                          <Clock
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#8C6F3D] stroke-[2.5] dark:text-primary dark:stroke-2"
                          />
                          <span>{formatTime(item.time)}</span>
                        </div>
                      )}
                    </div>

                    {/* Title (Mobile generous width prevents awkward single-character wrapping) */}
                    <h4 className="text-[13px] sm:text-[13px] md:text-sm font-bold font-serif text-foreground whitespace-normal break-words leading-[1.65] py-0.5 w-full">
                      {itemTitle}
                    </h4>

                    {/* Description */}
                    {itemDesc && (
                      <p className="text-muted-foreground text-xs sm:text-[11px] md:text-xs leading-[1.6] break-words font-sans mt-0.5 w-full">
                        {itemDesc}
                      </p>
                    )}

                    {/* Directional arrow for tablet/desktop views */}
                    {showArrow && (
                      <span
                        className={`hidden sm:inline-block absolute top-1/2 -translate-y-1/2 ${
                          isLeft ? '-right-4 sm:-right-5' : '-left-4 sm:-left-5'
                        } text-primary font-bold text-xs sm:text-sm select-none pointer-events-none drop-shadow-[0_0_4px_rgba(212,175,55,0.8)]`}
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

export default function WeddingProgram({ programDays, locale, event }: WeddingProgramProps) {
  const t = useTranslations('Program');
  const isWedding = isWeddingEvent(event);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;

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
      timer = setTimeout(() => {
        setAnimationPhase('retractingLine');
      }, 2200);
    } else if (animationPhase === 'retractingLine') {
      timer = setTimeout(() => {
        setAnimationPhase('segmentHidden');
      }, 1000);
    } else if (animationPhase === 'segmentHidden') {
      timer = setTimeout(() => {
        if (activeSegmentIndex < currentDaySegmentsCount - 1) {
          setActiveSegmentIndex((prev) => prev + 1);
          setAnimationCycle((prev) => prev + 1);
          setAnimationPhase('movingDot');
        } else {
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
    <section className="mt-12 sm:mt-16 relative w-full scroll-mt-8 sm:scroll-mt-10 px-2 sm:px-4 md:px-0" id="program-section">
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

        /* Circular icon badge with refined boundary & shadow */
        .timeline-icon-badge {
          background-color: #fcf8f0;
          border: 1.5px solid #8C6F3D;
          color: #8C6F3D;
          fill: #8C6F3D;
          box-shadow: 0 1px 4px rgba(140, 111, 61, 0.22);
        }

        .timeline-icon-badge svg,
        .timeline-icon-badge svg path,
        .timeline-icon-badge svg circle,
        .timeline-icon-badge svg line,
        .timeline-icon-badge svg rect,
        .timeline-icon-badge svg polygon {
          color: #8C6F3D !important;
          fill: #8C6F3D !important;
          stroke: #8C6F3D !important;
        }

        :global(.dark) .timeline-icon-badge,
        .dark .timeline-icon-badge {
          background-color: rgba(212, 175, 55, 0.1) !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          color: var(--primary) !important;
          fill: var(--primary) !important;
          box-shadow: none !important;
        }

        :global(.dark) .timeline-icon-badge svg,
        :global(.dark) .timeline-icon-badge svg path,
        :global(.dark) .timeline-icon-badge svg circle,
        :global(.dark) .timeline-icon-badge svg line,
        :global(.dark) .timeline-icon-badge svg rect,
        :global(.dark) .timeline-icon-badge svg polygon,
        .dark .timeline-icon-badge svg,
        .dark .timeline-icon-badge svg path,
        .dark .timeline-icon-badge svg circle,
        .dark .timeline-icon-badge svg line,
        .dark .timeline-icon-badge svg rect,
        .dark .timeline-icon-badge svg polygon {
          color: var(--primary) !important;
          fill: var(--primary) !important;
          stroke: var(--primary) !important;
        }

        /* Time badge and clock icon high contrast colors */
        .timeline-time-badge {
          color: #8C6F3D;
          background-color: rgba(140, 111, 61, 0.1);
          border: 1px solid rgba(140, 111, 61, 0.35);
        }

        :global(.dark) .timeline-time-badge,
        .dark .timeline-time-badge {
          color: var(--primary) !important;
          background-color: rgba(212, 175, 55, 0.1) !important;
          border-color: rgba(212, 175, 55, 0.2) !important;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          {isWedding ? (t('weddingProgram') || 'កម្មវិធីមង្គលការ') : (event?.eventTitle?.trim() || t('programSchedule') || 'កម្មវិធី')}
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </h2>
        <span className="inline-block w-10 h-[1.5px] bg-primary mt-3" />
      </div>

      <div className="space-y-6 sm:space-y-10 md:space-y-12">
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
            isDark={isDark}
          />
        ))}
      </div>
    </section>
  );
}
