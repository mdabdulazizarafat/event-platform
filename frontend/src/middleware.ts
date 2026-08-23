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

    const role = user.role as string;
    
    // Redirect legacy overview subroutes to unified dashboard
    if (pathname === '/dashboard/admin' || pathname === '/dashboard/user' || pathname === '/dashboard/participant') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const ROUTE_PERMISSIONS: Record<string, string[]> = {
      '/dashboard':              ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/events':       ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/scanner':      ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/schedule':     ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/certificates': ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/profile':      ['USER', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN'],
      '/dashboard/users':        ['ADMIN', 'SUPER_ADMIN'],
      '/dashboard/finance':      ['ADMIN', 'SUPER_ADMIN'],
      '/dashboard/infrastructure': ['SUPER_ADMIN'],
      '/dashboard/settings':     ['SUPER_ADMIN'],
    };

    if (role !== 'SUPER_ADMIN') {
      // Find the most specific matching route rule
      const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
        .sort((a, b) => b.length - a.length)
        .find(route => pathname === route || pathname.startsWith(route + '/'));

      if (matchedRoute) {
        const allowedRoles = ROUTE_PERMISSIONS[matchedRoute];
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

// Config to target only dashboard workspace routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
