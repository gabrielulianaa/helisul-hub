'use client'
import { useState } from 'react'
import { IcClose, IcTrash } from './Icons'

export function FormModal({ title, onClose, onSubmit, onDelete, submitLabel = 'Salvar', children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--form" onClick={e => e.stopPropagation()}>
        <header className="modal-head">
          <div className="modal-head-left"><h3>{title}</h3></div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar"><IcClose /></button>
        </header>
        <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
          <div className="modal-body form-body">{children}</div>
          <footer className="modal-foot modal-foot--form">
            {onDelete
              ? <button type="button" className="btn-danger" onClick={onDelete}><IcTrash /> Excluir</button>
              : <span />}
            <div className="modal-foot-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary">{submitLabel}</button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="fld">
      <span className="fld-label">{label}</span>
      {children}
      {hint && <span className="fld-hint">{hint}</span>}
    </label>
  )
}

export function TextField({ label, value, onChange, placeholder, type = 'text', hint, autoFocus }) {
  return (
    <Field label={label} hint={hint}>
      <input className="fld-input" type={type} value={value || ''} placeholder={placeholder}
        autoFocus={autoFocus} onChange={e => onChange(e.target.value)} />
    </Field>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <Field label={label}>
      <textarea className="fld-input fld-area" rows={rows} value={value || ''} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} />
    </Field>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select className="fld-input fld-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  )
}

export function TagField({ label, tags, onChange, hint }) {
  const [draft, setDraft] = useState('')
  function add() {
    const v = draft.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setDraft('')
  }
  return (
    <Field label={label} hint={hint}>
      <div className="tagfld">
        {tags.map(t => (
          <span key={t} className="tagfld-chip">{t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} aria-label="Remover">×</button>
          </span>
        ))}
        <input className="tagfld-input" value={draft} placeholder="digite e Enter"
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
      </div>
    </Field>
  )
}
