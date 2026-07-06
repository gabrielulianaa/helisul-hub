import { NextResponse } from 'next/server'

const TOKEN_PAYLOAD = 'helisul:granted'

async function signToken(secret) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(TOKEN_PAYLOAD))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export async function POST(request) {
  const { password } = await request.json()

  if (!password || password !== process.env.ACCESS_PASSWORD) {
    await new Promise(r => setTimeout(r, 300)) // timing-safe delay
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  const token = await signToken(process.env.ACCESS_PASSWORD)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('helisul_access', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
