'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fmtData, hasLink } from '@/lib/constants'
import { FormModal, TextField, TextArea, TagField } from './ui/FormModal'
import { IcEdit, IcExt, IcDoc } from './ui/Icons'

function PrdForm({ prd, onClose, onSave }) {
  const [f, setF] = useState({
    titulo: prd.titulo || '',
    resumo: prd.resumo || '',
    secoes: prd.secoes || [],
    url: prd.url && prd.url !== '#' ? prd.url : '',
    versao: prd.versao || '',
    atualizado: prd.atualizado || new Date().toISOString().slice(0, 10),
  })
  const up = (k, v) => setF(p => ({ ...p, [k]: v }))
  return (
    <FormModal title="Editar PRD" onClose={onClose} onSubmit={() => onSave({ ...prd, ...f })}>
      <TextField label="Título" value={f.titulo} onChange={v => up('titulo', v)} autoFocus />
      <TextArea label="Resumo" value={f.resumo} onChange={v => up('resumo', v)} rows={4} />
      <TagField label="Seções" tags={f.secoes} onChange={v => up('secoes', v)}
        hint="As etiquetas de seções do documento." />
      <div className="fld-row">
        <TextField label="Versão" value={f.versao} onChange={v => up('versao', v)} placeholder="Ex.: v1.4" />
        <TextField label="Atualizado em" type="date" value={f.atualizado} onChange={v => up('atualizado', v)} />
      </div>
      <TextField label="Link do Google Docs" value={f.url} onChange={v => up('url', v)}
        placeholder="https://docs.google.com/..." />
    </FormModal>
  )
}

export default function PRDView({ prd, onUpdate }) {
  const [editing, setEditing] = useState(false)

  async function save(updated) {
    const { error } = await supabase
      .from('prd')
      .update({
        titulo: updated.titulo,
        resumo: updated.resumo,
        secoes: updated.secoes,
        url: updated.url || '',
        versao: updated.versao,
        atualizado: updated.atualizado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prd.id)
    if (!error) onUpdate(updated)
    setEditing(false)
  }

  if (!prd) return null

  return (
    <div className="view">
      <div className="view-head-row">
        <div>
          <h2 className="view-title">PRD — Documento de requisitos</h2>
          <p className="view-sub">
            {prd.versao ? `Versão ${prd.versao} · ` : ''}atualizado em {fmtData(prd.atualizado)}.
          </p>
        </div>
        <button className="btn-secondary" onClick={() => setEditing(true)}><IcEdit /> Editar</button>
      </div>

      <div className="prd-card">
        <div className="prd-thumb">
          <span className="doc-glyph doc-glyph--lg"><IcDoc /></span>
        </div>
        <div className="prd-info">
          <h3>{prd.titulo}</h3>
          {prd.resumo && <p>{prd.resumo}</p>}
          {prd.secoes?.length > 0 && (
            <div className="prd-secoes">
              {prd.secoes.map(s => <span key={s} className="chip">{s}</span>)}
            </div>
          )}
          <div className="prd-actions">
            {hasLink(prd.url)
              ? <a className="btn-primary" href={prd.url} target="_blank" rel="noopener">
                  Abrir no Google Docs <IcExt />
                </a>
              : <button className="btn-primary btn-primary--ghost" onClick={() => setEditing(true)}>
                  + Adicionar link do Docs
                </button>}
          </div>
        </div>
      </div>

      {editing && (
        <PrdForm prd={prd} onClose={() => setEditing(false)} onSave={save} />
      )}
    </div>
  )
}
