import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = "secret"; // Matches auth.ts. In Production: process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(session, key, {
        algorithms: ['HS256'],
      });
      return NextResponse.next();
    } catch (error) {
      // Invalid session
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Config to run middleware only on specific paths
export const config = {
  matcher: ['/admin/:path*'],
};
