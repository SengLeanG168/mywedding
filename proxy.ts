import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // If URL contains /en/invite, redirect to /invite (Khmer only public invitation)
  if (pathname.startsWith('/en/invite')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en\/invite/, '/invite');
    return NextResponse.redirect(url);
  }

  // Apply next-intl middleware first to get the response with locale
  const response = intlMiddleware(request);

  // Check if it's a protected route
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

  return response;
}

export const config = {
  matcher: ['/', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
