import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/acesso', '/api/auth']

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('helisul_access')
  if (cookie?.value === 'granted') {
    return NextResponse.next()
  }

  const loginUrl = new URL('/acesso', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
