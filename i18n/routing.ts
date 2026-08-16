import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['km', 'en'],
  defaultLocale: 'km',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
