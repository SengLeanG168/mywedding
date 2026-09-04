"use client"

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Countdown({ date }: { date: string }) {
  const t = useTranslations('Event');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(date).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  const unitLabels: Record<string, string> = {
    days: 'ថ្ងៃ',
    hours: 'ម៉ោង',
    minutes: 'នាទី',
    seconds: 'វិនាទី',
  };

  return (
    <div className="text-center my-6 sm:my-8 w-full">
      <h3 className="text-lg sm:text-xl text-primary font-serif mb-3 sm:mb-4">{t('countdown') || 'រាប់ថយក្រោយ'}</h3>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center max-w-sm mx-auto w-full px-1">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm shadow-sm py-3 px-1 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/20">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-primary leading-tight">{value}</span>
            <span className="text-[10px] sm:text-xs tracking-wider text-muted-foreground mt-1 truncate max-w-full px-1">{unitLabels[unit] || unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
