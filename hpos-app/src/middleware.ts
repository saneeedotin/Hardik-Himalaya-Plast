import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('hpos_session')?.value
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path.startsWith('/_next') || path.startsWith('/api/auth')

  if (!sessionToken && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (sessionToken && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Prevent CSRF on cookie-based mutations
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin) {
      const originUrl = new URL(origin)
      if (originUrl.host !== host) {
        return new NextResponse("CSRF Token Mismatch", { status: 403 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.webp).*)'],
}
