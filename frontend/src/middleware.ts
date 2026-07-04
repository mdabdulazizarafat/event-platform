import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept private host workspace paths
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      // Redirect to /login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Config to target only dashboard workspace routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
