import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const hasSession = 
    req.cookies.has('authjs.session-token') || 
    req.cookies.has('__Secure-authjs.session-token') ||
    req.cookies.has('next-auth.session-token') ||
    req.cookies.has('__Secure-next-auth.session-token');

  const { pathname } = req.nextUrl;
  const isOnDashboard = pathname.startsWith('/dashboard');

  if (isOnDashboard) {
    if (hasSession) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  } else if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  } else if (hasSession && pathname === '/') {
    // Authenticated users visiting landing page go straight to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
