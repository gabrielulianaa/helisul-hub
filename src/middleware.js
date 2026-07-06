import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/acesso', '/api/auth']
const TOKEN_PAYLOAD = 'helisul:granted'

async function verifyToken(token, secret) {
  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sig = Uint8Array.from(atob(token), c => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, sig, enc.encode(TOKEN_PAYLOAD))
  } catch {
    return false
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get('helisul_access')
  const secret = process.env.ACCESS_PASSWORD

  if (cookie?.value && secret && await verifyToken(cookie.value, secret)) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/acesso', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
