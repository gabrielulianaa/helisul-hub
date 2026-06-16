'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MES_UP, hasLink } from '@/lib/constants'
import { FormModal, TextField, TagField } from './ui/FormModal'
import { IcEdit, IcTrash, IcExt, IcPlus } from './ui/Icons'

function uid() { return Math.random().toString(36).slice(2, 9) }

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

export default function Atas({ atas, onAdd, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null)
  const [sortDesc, setSortDesc] = useState(true)
  const ordered = [...atas].sort((a, b) =>
    sortDesc ? (a.data < b.data ? 1 : -1) : (a.data > b.data ? 1 : -1)
  )

  async function save(ata) {
    const isNew = !atas.some(a => a.id === ata.id)
    if (isNew) {
      const { data, error } = await supabase
        .from('atas')
        .insert({ titulo: ata.titulo, data: ata.data, tags: ata.tags, url: ata.url })
        .select()
        .single()
      if (!error) onAdd(data)
    } else {
      const { error } = await supabase
        .from('atas')
        .update({ titulo: ata.titulo, data: ata.data, tags: ata.tags, url: ata.url })
        .eq('id', ata.id)
      if (!error) onUpdate(ata)
    }
    setEditing(null)
  }

  async function remove(id) {
    const { error } = await supabase.from('atas').delete().eq('id', id)
    if (!error) onDelete(id)
    setEditing(null)
  }

  function openLink(a) {
    if (hasLink(a.url)) window.open(a.url, '_blank', 'noopener')
  }

  return (
    <div className="view">
      <div className="view-head-row">
        <div>
          <h2 className="view-title">Atas de reunião</h2>
          <p className="view-sub">{atas.length} ata{atas.length !== 1 ? 's' : ''} registrada{atas.length !== 1 ? 's' : ''} · clique no card para abrir no Google Docs.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-ghost"
            onClick={() => setSortDesc(p => !p)}
            title={sortDesc ? 'Mostrar mais antigas primeiro' : 'Mostrar mais recentes primeiro'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sortDesc
                ? <><path d="M3 8l4-4 4 4"/><path d="M7 4v16"/><path d="M21 12H11"/><path d="M21 6H15"/><path d="M21 18H15"/></>
                : <><path d="M3 16l4 4 4-4"/><path d="M7 20V4"/><path d="M21 12H11"/><path d="M21 6H15"/><path d="M21 18H15"/></>
              }
            </svg>
            {sortDesc ? 'Mais recentes' : 'Mais antigas'}
          </button>
          <button className="btn-primary" onClick={() => setEditing({})}>
            <IcPlus /> Nova ata
          </button>
        </div>
      </div>

      {ordered.length === 0 && (
        <div className="empty-state">Nenhuma ata ainda. Clique em <b>Nova ata</b> para adicionar.</div>
      )}

      <div className="ata-list">
        {ordered.map(a => {
          const d = new Date(a.data + 'T00:00:00')
          return (
            <article key={a.id}
              className={'ata-card' + (hasLink(a.url) ? ' ata-card--link' : '')}
              onClick={() => openLink(a)}>
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
