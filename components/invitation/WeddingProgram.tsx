"use client";

import { useTranslations } from 'next-intl';

interface WeddingProgramProps {
  programDays: any[];
  locale: string;
}

function formatTime(timeStr: string, locale: string) {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  if (!hourStr || !minuteStr) return timeStr;
  
  let hour = parseInt(hourStr, 10);
  const ampmEn = hour >= 12 ? 'PM' : 'AM';
  const ampmKm = hour >= 12 ? 'ល្ងាច/យប់' : 'ព្រឹក';
  
  // Custom Khmer period logic (simplified, usually <=11 is ព្រឹក, 12-17 is រសៀល/ល្ងាច, 18+ is យប់)
  let khmerPeriod = 'ព្រឹក';
  if (hour >= 12 && hour < 18) khmerPeriod = 'រសៀល';
  else if (hour >= 18) khmerPeriod = 'យប់';

  // 12 hour format
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  if (locale === 'km') {
    // Convert numbers to Khmer numerals (optional but nice)
    const khmerNums = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
    const h = hour12.toString().split('').map(d => khmerNums[parseInt(d)]).join('');
    const m = minuteStr.split('').map(d => khmerNums[parseInt(d)]).join('');
    return `ម៉ោង ${h}:${m} ${khmerPeriod}`;
  } else {
    return `${hour12}:${minuteStr} ${ampmEn}`;
  }
}

export default function WeddingProgram({ programDays, locale }: WeddingProgramProps) {
  const t = useTranslations('Program');

  if (!programDays || programDays.length === 0) return null;

  return (
    <section className="mt-16 relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif text-primary">{t('weddingProgram')}</h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-4" />
        <div className="flex justify-center mt-4 opacity-50">
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary fill-current">
            <path d="M20 0C20 0 25 10 40 10C25 10 20 20 20 20C20 20 15 10 0 10C15 10 20 0 20 0Z" />
          </svg>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {programDays.map((day) => (
          <div key={day.id} className="relative bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-primary/20">
            {/* Khmer ornamental border top */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-t-2xl sm:rounded-t-3xl" />
            
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-primary font-serif px-2 break-words">
                {locale === 'km' ? day.titleKm : day.titleEn}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 px-2">
                {new Date(day.date).toLocaleDateString(locale === 'km' ? 'km-KH' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="relative max-w-lg mx-auto">
              {/* Timeline line */}
              <div className="absolute left-4 sm:left-6 md:left-[50%] top-2 bottom-2 w-px bg-primary/30" />

              <div className="space-y-6 sm:space-y-8">
                {day.items?.map((item: any, index: number) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <div key={item.id} className="relative flex items-center md:justify-between w-full">
                      {/* Mobile dot */}
                      <div className="absolute left-[14px] sm:left-[22px] w-2 h-2 rounded-full bg-primary md:hidden ring-4 ring-card" />
                      {/* Desktop dot */}
                      <div className="absolute left-[50%] -translate-x-1/2 w-3 h-3 rounded-full bg-primary hidden md:block shadow-[0_0_0_4px_hsl(var(--background))]" />

                      {/* Content Wrapper */}
                      <div className={`w-full pl-10 sm:pl-12 md:pl-0 flex flex-col md:w-[calc(50%-24px)] ${isLeft ? 'md:items-end md:text-right' : 'md:ml-auto md:items-start md:text-left'}`}>
                        <div className="text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full inline-block mb-2 shadow-sm border border-primary/20 self-start md:self-auto">
                          {formatTime(item.time, locale)}
                        </div>
                        <h4 className="text-base sm:text-lg font-bold font-serif mb-1 break-words">
                          {locale === 'km' ? item.titleKm : item.titleEn}
                        </h4>
                        {(item.descriptionKm || item.descriptionEn) && (
                          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed break-words">
                            {locale === 'km' ? item.descriptionKm : item.descriptionEn}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Khmer ornamental border bottom */}
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-b-3xl" />
          </div>
        ))}
      </div>
    </section>
  );
}
