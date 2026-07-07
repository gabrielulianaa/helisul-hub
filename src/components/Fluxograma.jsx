'use client'
import { useState } from 'react'
import { hasLink } from '@/lib/constants'
import { FormModal, TextField, TextArea } from './ui/FormModal'
import { IcEdit, IcExt } from './ui/Icons'

function FluxoForm({ fluxo, onClose, onSave }) {
  const [f, setF] = useState({
    titulo: fluxo.titulo || '',
    descricao: fluxo.descricao || '',
    url: fluxo.url && !fluxo.url.includes('SEU-BOARD') ? fluxo.url : '',
  })
  const up = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <FormModal title="Editar fluxograma" onClose={onClose} onSubmit={() => onSave({ ...fluxo, ...f })}>
      <TextField label="Título" value={f.titulo} onChange={v => up('titulo', v)} autoFocus />
      <TextArea label="Descrição" value={f.descricao} onChange={v => up('descricao', v)} rows={3} />
      <TextField label="Link do Miro" value={f.url} onChange={v => up('url', v)}
        placeholder="https://miro.com/app/board/..." hint="Cole o link do quadro no Miro." />
    </FormModal>
  )
}

export default function Fluxograma({ fluxo, onUpdate }) {
  const [editing, setEditing] = useState(false)

  async function save(updated) {
    const res = await fetch('/api/fluxo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: fluxo.id,
        titulo: updated.titulo,
        descricao: updated.descricao,
        url: updated.url || '',
        updated_at: new Date().toISOString(),
      }),
    })
    if (res.ok) onUpdate(updated)
    setEditing(false)
  }

  if (!fluxo) return null

  return (
    <div className="view">
      <div className="view-head-row">
        <div>
          <h2 className="view-title">Fluxograma</h2>
          <p className="view-sub">Fluxo macro do projeto mantido no Miro.</p>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(true)}><IcEdit /> Editar</button>
      </div>

      <div className="miro-card">
        <div className="miro-preview" aria-hidden="true">
          <div className="miro-grid"></div>
          <div className="miro-node miro-node--1">Início</div>
          <svg className="miro-arrow miro-arrow--a" viewBox="0 0 80 20">
            <path d="M2 10h66" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M66 4l10 6-10 6z" fill="currentColor"/>
          </svg>
          <div className="miro-node miro-node--2">Operação</div>
          <svg className="miro-arrow miro-arrow--b" viewBox="0 0 20 80">
            <path d="M10 2v66" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M4 66l6 10 6-10z" fill="currentColor"/>
          </svg>
          <div className="miro-node miro-node--3">Manutenção</div>
          <div className="miro-node miro-node--4 miro-node--accent">Relatório</div>
        </div>
        <div className="miro-overlay">
          <h3>{fluxo.titulo}</h3>
          <p>{fluxo.descricao}</p>
          {hasLink(fluxo.url)
            ? <a className="btn-primary" href={fluxo.url} target="_blank" rel="noopener">
                Abrir no Miro <IcExt />
              </a>
            : <button className="btn-primary btn-primary--ghost" onClick={() => setEditing(true)}>
                + Adicionar link do Miro
              </button>}
        </div>
      </div>

      {editing && (
        <FluxoForm fluxo={fluxo} onClose={() => setEditing(false)} onSave={save} />
      )}
    </div>
  )
}
