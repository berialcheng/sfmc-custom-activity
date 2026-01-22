import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith('/') && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
