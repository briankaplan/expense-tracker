import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const session = await auth.verifySessionCookie(request.cookies.get('session')?.value || '');

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/expenses/:path*',
    '/reports/:path*',
    '/receipts/:path*',
    '/settings/:path*',
  ],
}; 