"use client";

import { CalendarDays, MapPin, Images, QrCode, UserCheck } from 'lucide-react';

interface FloatingBottomNavProps {
  visible?: boolean;
}

export default function FloatingBottomNav({ visible = true }: FloatingBottomNavProps) {
  if (!visible) return null;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    {
      id: 'calendar-section',
      label: 'កាលបរិច្ឆេទ',
      icon: CalendarDays,
    },
    {
      id: 'location-section',
      label: 'ទីតាំង',
      icon: MapPin,
    },
    {
      id: 'gallery-section',
      label: 'រូបថត',
      icon: Images,
    },
    {
      id: 'gift-qr-section',
      label: 'ចងដៃ',
      icon: QrCode,
    },
    {
      id: 'rsvp-section',
      label: 'RSVP',
      icon: UserCheck,
    },
  ];

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="bg-background/85 dark:bg-card/90 backdrop-blur-lg border border-primary/30 shadow-[0_8px_32px_rgba(0,0,0,0.18)] rounded-full px-3 py-1.5 flex items-center gap-1.5 sm:gap-3 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/10 active:scale-95 transition-all"
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
