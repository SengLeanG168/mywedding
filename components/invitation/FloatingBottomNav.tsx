"use client";

import { CalendarDays, MapPin, CalendarCheck, Images, QrCode, UserCheck } from 'lucide-react';

interface FloatingBottomNavProps {
  visible?: boolean;
}

export default function FloatingBottomNav({ visible = true }: FloatingBottomNavProps) {
  if (!visible) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 24;
      const elementTop = element.getBoundingClientRect().top;
      const targetScrollTop = elementTop + window.pageYOffset - navOffset;

      window.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
    }
  };

  const navItems = [
    {
      id: 'calendar-section',
      label: 'ថ្ងៃទី',
      icon: CalendarDays,
    },
    {
      id: 'location-section',
      label: 'ទីតាំង',
      icon: MapPin,
    },
    {
      id: 'program-section',
      label: 'កម្មវិធី',
      icon: CalendarCheck,
    },
    {
      id: 'gallery-section',
      label: 'រូបភាព',
      icon: Images,
    },
    {
      id: 'gift-qr-section',
      label: 'QR',
      icon: QrCode,
    },
    {
      id: 'rsvp-section',
      label: 'ការចូលរួម',
      icon: UserCheck,
    },
  ];

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[390px] w-[92%] sm:w-auto">
      <div className="bg-background/90 dark:bg-card/95 backdrop-blur-xl border border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.22)] rounded-full px-3 py-1.5 flex items-center justify-between sm:justify-center gap-1.5 sm:gap-3 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/15 active:scale-90 transition-all cursor-pointer"
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5 transition-transform" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
