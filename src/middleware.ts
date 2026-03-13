import { auth } from "@/lib/auth";
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextResponse } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only show locale prefix for non-default languages
});

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith('/api/auth')) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname === '/') return true
  if (pathname.startsWith('/tw')) return true

  return true // All routes are publicly accessible by default
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip internationalization for API routes
  if (pathname.startsWith('/api/')) {
    return;
  }

  // Skip internationalization for sitemap and robots.txt
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return;
  }

  // Handle admin routes - protect them but don't use intl middleware
  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    return;
  }

  // Handle public routes with intl
  if (isPublicPath(pathname)) {
    return intlMiddleware(req);
  }

  // Protect private routes
  if (!req.auth) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
