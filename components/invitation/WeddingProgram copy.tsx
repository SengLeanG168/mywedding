"use client";

import { useEffect, useState } from 'react';
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

interface ProgramDayCardProps {
  day: any;
  dayIndex: number;
  locale: string;
  isDayActive: boolean;
  activeSegmentIndex: number;
  animationPhase: AnimationPhase;
  animationCycle: number;
}

function ProgramDayCard({
  day,
  dayIndex,
  locale,
  isDayActive,
  activeSegmentIndex,
  animationPhase,
  animationCycle,
}: ProgramDayCardProps) {
  const items = day.items || [];
  const itemsCount = items.length;
  const dayTitle = locale === 'km' ? day.titleKm || day.titleEn : day.titleEn || day.titleKm;
  const formattedDayDate = day.date ? formatLocalizedDate(day.date, locale) : '';

  return (
    <div className="relative bg-card/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xl border border-primary/25 overflow-hidden">
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
      <div className="relative w-full max-w-xl mx-auto py-2">
        <div className="space-y-6 sm:space-y-10 relative">
          {items.map((item: any, index: number) => {
            const isLeft = index % 2 === 0;
            const hasNext = index < itemsCount - 1;
            const isSegmentActive = isDayActive && hasNext && index === activeSegmentIndex;
            const showConnector = isSegmentActive && (animationPhase === 'movingDot' || animationPhase === 'retractingLine');
            const showDot = isSegmentActive && animationPhase === 'movingDot';
            const isRetracting = isSegmentActive && animationPhase === 'retractingLine';
            const showArrow = isSegmentActive && animationPhase === 'movingDot';

            const itemTitle = locale === 'km' ? item.titleKm || item.titleEn : item.titleEn || item.titleKm;
            const itemDesc = locale === 'km' ? item.descriptionKm || item.descriptionEn : item.descriptionEn || item.descriptionKm;

            // Connector path from current card center to next card center
            const leftToRightPath = "M 0,0 L 75,0 Q 100,0 100,25 L 100,100";
            const rightToLeftPath = "M 100,0 L 25,0 Q 0,0 0,25 L 0,100";

            return (
              <div key={item.id || index} className="relative w-full">
                {/* Program Item Card Row */}
                <div className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  {/* Card Element */}
                  <div
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

                {/* Direct Connector Line from Vertical Center of Current Card to Next Card */}
                {hasNext && showConnector && (
                  <div
                    className={`absolute top-1/2 h-[calc(100%+1.5rem)] sm:h-[calc(100%+2.5rem)] pointer-events-none z-0 ${
                      isLeft
                        ? 'left-[48%] sm:left-[46%] right-[16px] sm:right-[24px]'
                        : 'left-[16px] sm:left-[24px] right-[48%] sm:right-[46%]'
                    } ${
                      isRetracting
                        ? isLeft
                          ? 'line-retracting-lr'
                          : 'line-retracting-rl'
                        : ''
                    }`}
                  >
                    {/* SVG Connector Path */}
                    <svg
                      className="w-full h-full overflow-visible"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d={isLeft ? leftToRightPath : rightToLeftPath}
                        fill="none"
                        stroke="rgba(212, 175, 55, 0.9)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        className="curved-dashed-road"
                      />
                    </svg>

                    {/* Glowing Moving Dot traveling smoothly along the connector */}
                    {showDot && (
                      <div
                        key={`dot-travel-${dayIndex}-${activeSegmentIndex}-${animationCycle}`}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white border-2 border-[#d4af37] shadow-[0_0_8px_#d4af37,0_0_16px_rgba(255,215,0,0.85)] z-20 pointer-events-none ${
                          isLeft ? 'animate-dot-travel-lr' : 'animate-dot-travel-rl'
                        }`}
                      />
                    )}
                  </div>
                )}
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

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('movingDot');
  const [animationCycle, setAnimationCycle] = useState(0);

  const daysCount = programDays?.length || 0;
  const currentDay = programDays?.[activeDayIndex];
  const currentDayItemsCount = currentDay?.items?.length || 0;
  const currentDaySegmentsCount = Math.max(0, currentDayItemsCount - 1);

  useEffect(() => {
    if (daysCount === 0) return;

    let timer: NodeJS.Timeout;

    // If current day has 0 or 1 item (no connector segments), transition to next day after a short pause
    if (currentDaySegmentsCount === 0) {
      timer = setTimeout(() => {
        setActiveDayIndex((prev) => (prev + 1) % daysCount);
        setActiveSegmentIndex(0);
        setAnimationCycle((prev) => prev + 1);
        setAnimationPhase('movingDot');
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (animationPhase === 'movingDot') {
      // 1. Dot travels along dashed connector line for 2.2s
      timer = setTimeout(() => {
        setAnimationPhase('retractingLine');
      }, 2200);
    } else if (animationPhase === 'retractingLine') {
      // 2. Dashed line smoothly retracts for 1.0s
      timer = setTimeout(() => {
        setAnimationPhase('segmentHidden');
      }, 1000);
    } else if (animationPhase === 'segmentHidden') {
      // 3. Keep line completely hidden for 400ms before advancing cleanly to next segment/day
      timer = setTimeout(() => {
        if (activeSegmentIndex < currentDaySegmentsCount - 1) {
          // Advance to next segment in the same day
          setActiveSegmentIndex((prev) => prev + 1);
          setAnimationCycle((prev) => prev + 1);
          setAnimationPhase('movingDot');
        } else {
          // Finished all segments in this day -> advance to next day
          setActiveDayIndex((prev) => (prev + 1) % daysCount);
          setActiveSegmentIndex(0);
          setAnimationCycle((prev) => prev + 1);
          setAnimationPhase('movingDot');
        }
      }, 400);
    }

    return () => clearTimeout(timer);
  }, [animationPhase, activeDayIndex, activeSegmentIndex, daysCount, currentDaySegmentsCount]);

  if (!programDays || programDays.length === 0) return null;

  return (
    <section className="mt-16 relative w-full" id="program-section">
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

        @keyframes dotTravelLR {
          0% {
            left: 0%;
            top: 0%;
          }
          60% {
            left: 75%;
            top: 0%;
          }
          75% {
            left: 100%;
            top: 25%;
          }
          100% {
            left: 100%;
            top: 100%;
          }
        }

        @keyframes dotTravelRL {
          0% {
            left: 100%;
            top: 0%;
          }
          60% {
            left: 25%;
            top: 0%;
          }
          75% {
            left: 0%;
            top: 25%;
          }
          100% {
            left: 0%;
            top: 100%;
          }
        }

        .animate-dot-travel-lr {
          animation: dotTravelLR 2.2s linear forwards;
        }

        .animate-dot-travel-rl {
          animation: dotTravelRL 2.2s linear forwards;
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
          .line-retracting-rl,
          .animate-dot-travel-lr,
          .animate-dot-travel-rl {
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
          />
        ))}
      </div>
    </section>
  );
}
