const TOKEN_PAYLOAD = 'helisul:granted'

export async function verifyAccess(request) {
  const secret = process.env.ACCESS_PASSWORD
  if (!secret) return false

  const cookie = request.cookies.get('helisul_access')
  if (!cookie?.value) return false

  try {
    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sig = Uint8Array.from(atob(cookie.value), c => c.charCodeAt(0))
    return await crypto.subtle.verify('HMAC', key, sig, enc.encode(TOKEN_PAYLOAD))
  } catch {
    return false
  }
}
