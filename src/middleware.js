import { NextResponse } from 'next/server';

export function middleware(request) {
  const authSession = request.cookies.get('auth_session');
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authSession) {
      return NextResponse.redirect(new URL('/pintu/login', request.url));
    }
  }
  
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (authSession) {
      return NextResponse.redirect(new URL('/pintu/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
