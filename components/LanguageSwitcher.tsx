"use client"

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'km' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button variant="outline" size="sm" onClick={toggleLocale} className="flex gap-2">
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? 'Khmer' : 'English'}</span>
    </Button>
  );
}
