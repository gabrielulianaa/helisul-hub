import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAccess } from '@/lib/verify-access'

const UNAUTH = () => NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

export async function POST(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const body = await request.json()
  const { data, error } = await supabase
    .from('atas')
    .insert({ titulo: body.titulo, data: body.data, tags: body.tags, url: body.url, position: body.position })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const body = await request.json()
  const { id, ...fields } = body
  const { error } = await supabase.from('atas').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const { id } = await request.json()
  const { error } = await supabase.from('atas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
