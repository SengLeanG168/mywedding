import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // If URL contains /en prefix (e.g. /en, /en/..., /en/invite/..., /en/dashboard/...), redirect to Khmer route
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en(\/|$)/, '/$1') || '/';
    return NextResponse.redirect(url);
  }

  // Check if it's a protected dashboard route
  const isDashboard = pathname.includes('/dashboard');
  if (isDashboard) {
    const token = request.cookies.get('session')?.value;
    const payload = token ? await verifyToken(token) : null;
    
    if (!payload) {
      // Determine locale from URL or default
      const localeMatch = pathname.match(/^\/(km|en)/);
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  // Apply next-intl routing
  return intlMiddleware(request);
}

export default proxy;

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
