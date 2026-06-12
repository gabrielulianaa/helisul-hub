import { NextResponse } from 'next/server'

export async function POST(request) {
  const { password } = await request.json()

  if (password !== process.env.ACCESS_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('helisul_access', 'granted', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
