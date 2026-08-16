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

  return (
    <div className="text-center my-8">
      <h3 className="text-xl text-primary font-serif mb-4">{t('countdown')}</h3>
      <div className="flex justify-center gap-4 text-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center bg-card/80 backdrop-blur-sm shadow p-4 rounded-xl min-w-[80px] border border-primary/20">
            <span className="text-3xl font-bold font-serif text-primary">{value}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
