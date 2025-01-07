import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes handling
  if (req.nextUrl.pathname.startsWith('/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return res;
  }

  // Protected routes
  if (
    !session &&
    !req.nextUrl.pathname.startsWith('/api/public') &&
    !req.nextUrl.pathname.startsWith('/_next') &&
    !req.nextUrl.pathname.startsWith('/static') &&
    req.nextUrl.pathname !== '/'
  ) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
}; 