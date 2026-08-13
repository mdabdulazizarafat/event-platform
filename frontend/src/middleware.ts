import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getSessionPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64URL decoding helper
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept dashboard workspace paths
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/sign-in', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const user = getSessionPayload(sessionToken);
    if (!user) {
      const loginUrl = new URL('/sign-in', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isUser = user.role === 'USER';

    // Redirect role-specific users accessing the root dashboard route
    if (pathname === '/dashboard') {
      if (isUser) {
        return NextResponse.redirect(new URL('/dashboard/user', request.url));
      }
      if (isAdmin) {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      }
    }

    // 1. Guard admin routes
    if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
      const fallbackUrl = new URL(isUser ? '/dashboard/user' : '/dashboard', request.url);
      return NextResponse.redirect(fallbackUrl);
    }

    // 2. Guard organizer host routes (default dashboard paths)
    const hostOnlyPaths = [
      '/dashboard/attendees',
      '/dashboard/schedule',
      '/dashboard/events'
    ];
    
    const isAccessingHostPath = hostOnlyPaths.some(path => pathname.startsWith(path));
    
    // Allow /dashboard/account to be accessible to everyone
    if (isAccessingHostPath && isUser && !pathname.startsWith('/dashboard/account')) {
      const fallbackUrl = new URL('/dashboard/user', request.url);
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.next();
}

// Config to target only dashboard workspace routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
