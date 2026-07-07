import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyAccess } from '@/lib/verify-access'

const UNAUTH = () => NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

export async function POST(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const body = await request.json()
  const { data, error } = await supabase
    .from('kanban_tasks')
    .insert({ titulo: body.titulo, resp: body.resp, prazo: body.prazo, prioridade: body.prioridade, col: body.col })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const body = await request.json()
  const { id, ...fields } = body
  const { error } = await supabase.from('kanban_tasks').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  if (!await verifyAccess(request)) return UNAUTH()
  const { id } = await request.json()
  const { error } = await supabase.from('kanban_tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
