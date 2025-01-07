import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if the request is for the share target
  if (request.nextUrl.pathname === '/share') {
    return NextResponse.next();
  }

  // Check if the request is for authentication
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/auth/session`,
    {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    }
  );

  if (!response.ok) {
    // Redirect to the main app for authentication
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/auth/signin?callbackUrl=${encodeURIComponent(
        request.url
      )}`
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     * - sw.js (Service Worker)
     * - workbox-*.js (Workbox files)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox-[a-zA-Z0-9-]+.js).*)',
  ],
}; 