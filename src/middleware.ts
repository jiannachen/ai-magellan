import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only show locale prefix for non-default languages
});

const isPublicRoute = createRouteMatcher([
  '/',
  '/tw',
  '/tw/(.*)',
  '/(.*)', // Default language routes without prefix
  '/auth/signin(.*)',
  '/auth/signup(.*)', 
  '/auth/error',
  '/api/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip internationalization for API routes but not admin routes
  if (pathname.startsWith('/api/')) {
    return;
  }

  // Skip internationalization for sitemap and robots.txt
  if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
    return;
  }

  // Handle admin routes - protect them but don't use intl middleware
  if (pathname.startsWith('/admin')) {
    auth.protect();
    return;
  }

  // Handle public routes without authentication
  if (isPublicRoute(req)) {
    return intlMiddleware(req);
  }

  // Protect private routes
  auth.protect();
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
