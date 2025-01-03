import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add your authentication logic here
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/nexus/:path*',
    '/api/nexus/:path*'
  ]
} 