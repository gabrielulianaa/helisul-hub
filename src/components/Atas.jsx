'use client'
import { useState } from 'react'
import { MES_UP, hasLink } from '@/lib/constants'
import { FormModal, TextField, TagField } from './ui/FormModal'
import { IcEdit, IcTrash, IcExt, IcPlus } from './ui/Icons'

function uid() { return Math.random().toString(36).slice(2, 9) }

function DragHandle() {
  return (
    <span className="drag-handle" title="Arrastar para reordenar">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="4"  cy="3"  r="1.3"/>
        <circle cx="10" cy="3"  r="1.3"/>
        <circle cx="4"  cy="7"  r="1.3"/>
        <circle cx="10" cy="7"  r="1.3"/>
        <circle cx="4"  cy="11" r="1.3"/>
        <circle cx="10" cy="11" r="1.3"/>
      </svg>
    </span>
  )
}

function AtaForm({ ata, onClose, onSave, onDelete }) {
  const isNew = !ata.id
  const [f, setF] = useState({
    titulo: ata.titulo || '',
    data: ata.data || new Date().toISOString().slice(0, 10),
    tags: ata.tags || [],
    url: ata.url && ata.url !== '#' ? ata.url : '',
  })
  const up = (k, v) => setF(p => ({ ...p, [k]: v }))
  function submit() {
    if (!f.titulo.trim()) return
    onSave({ id: ata.id || uid(), ...f, url: f.url || '' })
  }
  return (
    <FormModal title={isNew ? 'Nova ata de reunião' : 'Editar ata'} onClose={onClose}
      onSubmit={submit} onDelete={isNew ? null : onDelete} submitLabel={isNew ? 'Adicionar' : 'Salvar'}>
      <TextField label="Título" value={f.titulo} onChange={v => up('titulo', v)}
        placeholder="Ex.: Reunião de alinhamento — Sprint 4" autoFocus />
      <TextField label="Data" type="date" value={f.data} onChange={v => up('data', v)} />
      <TagField label="Motivo / tags" tags={f.tags} onChange={v => up('tags', v)}
        hint="As etiquetas azuis que aparecem no card." />
      <TextField label="Link do Google Docs" value={f.url} onChange={v => up('url', v)}
        placeholder="https://docs.google.com/..." hint="Cole o link da ata no Google Docs." />
    </FormModal>
  )
}

export default function Atas({ atas, onAdd, onUpdate, onDelete, onReorder }) {
  const [editing, setEditing]       = useState(null)
  const [dragId, setDragId]         = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const ordered = [...atas].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  async function save(ata) {
    const isNew = !atas.some(a => a.id === ata.id)
    if (isNew) {
      const maxPos = atas.length > 0 ? Math.max(...atas.map(a => a.position ?? 0)) : 0
      const res = await fetch('/api/atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ata, position: maxPos + 1 }),
      })
      if (res.ok) onAdd(await res.json())
    } else {
      const res = await fetch('/api/atas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ata),
      })
      if (res.ok) onUpdate(ata)
    }
    setEditing(null)
  }

  async function remove(id) {
    const res = await fetch('/api/atas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) onDelete(id)
    setEditing(null)
  }

  function openLink(a) {
    if (hasLink(a.url)) window.open(a.url, '_blank', 'noopener')
  }

  // ── drag handlers ──────────────────────────────────────────────
  function handleDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, id) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragId) setDragOverId(id)
  }

  function handleDrop(e, targetId) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { resetDrag(); return }

    const from = ordered.findIndex(a => a.id === dragId)
    const to   = ordered.findIndex(a => a.id === targetId)
    const next = [...ordered]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)

    const updated = next.map((a, i) => ({ ...a, position: i + 1 }))
    onReorder(updated)
    Promise.all(updated.map((a, i) =>
      fetch('/api/atas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, position: i + 1 }),
      })
    ))
    resetDrag()
  }

  function resetDrag() { setDragId(null); setDragOverId(null) }

  return (
    <div className="view">
      <div className="view-head-row">
        <div>
          <h2 className="view-title">Atas de reunião</h2>
          <p className="view-sub">{atas.length} ata{atas.length !== 1 ? 's' : ''} registrada{atas.length !== 1 ? 's' : ''} · clique no card para abrir no Google Docs.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}>
          <IcPlus /> Nova ata
        </button>
      </div>

      {ordered.length === 0 && (
        <div className="empty-state">Nenhuma ata ainda. Clique em <b>Nova ata</b> para adicionar.</div>
      )}

      <div className="ata-list">
        {ordered.map(a => {
          const d = new Date(a.data + 'T00:00:00')
          const isDragging = a.id === dragId
          const isOver     = a.id === dragOverId
          return (
            <article
              key={a.id}
              draggable
              onDragStart={e => handleDragStart(e, a.id)}
              onDragOver={e  => handleDragOver(e, a.id)}
              onDrop={e      => handleDrop(e, a.id)}
              onDragEnd={resetDrag}
              className={
                'ata-card' +
                (hasLink(a.url) ? ' ata-card--link' : '') +
                (isDragging ? ' ata-card--dragging' : '') +
                (isOver && !isDragging ? ' ata-card--drag-over' : '')
              }
              onClick={() => openLink(a)}
            >
              <DragHandle />
              <div className="ata-date">
                <span className="ata-date-dia">{d.getDate()}</span>
                <span className="ata-date-mes">{MES_UP[d.getMonth()]}</span>
              </div>
              <div className="ata-body">
                <h3>{a.titulo}</h3>
                {a.tags?.length > 0 && (
                  <div className="ata-meta">
                    {a.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="card-tools" onClick={e => e.stopPropagation()}>
                {hasLink(a.url) && (
                  <a className="tool-btn" href={a.url} target="_blank" rel="noopener" title="Abrir no Google Docs">
                    <IcExt />
                  </a>
                )}
                <button className="tool-btn" title="Editar" onClick={() => setEditing(a)}><IcEdit /></button>
                <button className="tool-btn tool-btn--danger" title="Excluir" onClick={() => remove(a.id)}><IcTrash /></button>
              </div>
            </article>
          )
        })}
      </div>

      {editing && (
        <AtaForm ata={editing} onClose={() => setEditing(null)}
          onSave={save} onDelete={() => remove(editing.id)} />
      )}
    </div>
  )
}
