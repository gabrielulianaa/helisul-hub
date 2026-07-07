import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAccess } from '@/lib/verify-access'

const UNAUTH = () => NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

export async function PATCH(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const body = await request.json()
  const { id, ...fields } = body
  const { error } = await supabase.from('fluxo').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
