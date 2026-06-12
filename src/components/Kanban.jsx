'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { KANBAN_COLS, MEMBERS, PRIO } from '@/lib/constants'
import { FormModal, TextField, SelectField } from './ui/FormModal'
import { IcEdit, IcTrash, IcPlus, IcCal } from './ui/Icons'

function uid() { return Math.random().toString(36).slice(2, 9) }

function Avatar({ id }) {
  if (!id) return <span className="kb-avatar kb-avatar--empty" title="Sem responsável">—</span>
  const m = MEMBERS[id] || { nome: id, cor: '#7A7F99' }
  return <span className="kb-avatar" title={m.nome} style={{ background: m.cor }}>{id}</span>
}

function TaskForm({ task, onClose, onSave, onDelete }) {
  const isNew = !task.id
  const [f, setF] = useState({
    titulo: task.titulo || '',
    resp: task.resp || '',
    prazo: task.prazo || '',
    prioridade: task.prioridade || 'media',
    col: task.col || KANBAN_COLS[0].id,
  })
  const up = (k, v) => setF(p => ({ ...p, [k]: v }))
  function submit() {
    if (!f.titulo.trim()) return
    onSave({ id: task.id || uid(), ...f, resp: (f.resp || '').toUpperCase().slice(0, 2) })
  }
  return (
    <FormModal title={isNew ? 'Nova task' : 'Editar task'} onClose={onClose}
      onSubmit={submit} onDelete={isNew ? null : onDelete} submitLabel={isNew ? 'Adicionar' : 'Salvar'}>
      <TextField label="Título" value={f.titulo} onChange={v => up('titulo', v)}
        placeholder="O que precisa ser feito?" autoFocus />
      <div className="fld-row">
        <TextField label="Responsável" value={f.resp} onChange={v => up('resp', v)}
          placeholder="Iniciais (ex.: MA)" hint="2 letras" />
        <TextField label="Prazo" value={f.prazo} onChange={v => up('prazo', v)} placeholder="Ex.: 18 jun" />
      </div>
      <div className="fld-row">
        <SelectField label="Prioridade" value={f.prioridade} onChange={v => up('prioridade', v)}
          options={[{ value: 'alta', label: 'Alta' }, { value: 'media', label: 'Média' }, { value: 'baixa', label: 'Baixa' }]} />
        <SelectField label="Coluna" value={f.col} onChange={v => up('col', v)}
          options={KANBAN_COLS.map(c => ({ value: c.id, label: c.titulo }))} />
      </div>
    </FormModal>
  )
}

function TaskCard({ task, dragging, onDragStart, onDragEnd, onEdit }) {
  const p = PRIO[task.prioridade] || PRIO.media
  return (
    <article
      className={'kb-card' + (dragging ? ' kb-card--dragging' : '')}
      draggable
      onDragStart={e => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onDoubleClick={() => onEdit(task)}
    >
      <div className="kb-card-top">
        <span className="kb-prio" style={{ background: p.bg, color: p.fg }}>{p.label}</span>
        <Avatar id={task.resp} />
      </div>
      <p className="kb-card-title">{task.titulo}</p>
      <div className="kb-card-foot">
        <span className="kb-card-prazo">
          <IcCal />
          <span>{task.prazo || 'sem prazo'}</span>
        </span>
        <button className="kb-card-edit" title="Editar task" onClick={e => { e.stopPropagation(); onEdit(task) }}>
          <IcEdit />
        </button>
      </div>
    </article>
  )
}

export default function Kanban({ tasks, onAdd, onUpdate, onDelete, onMove }) {
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const [editing, setEditing] = useState(null)

  function onDragStart(e, task) {
    setDrag(task)
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', task.id) } catch {}
  }
  function onDragEnd() { setDrag(null); setOver(null) }

  async function onDrop(colId) {
    if (drag && drag.col !== colId) {
      const { error } = await supabase.from('kanban_tasks').update({ col: colId }).eq('id', drag.id)
      if (!error) onMove(drag.id, colId)
    }
    setDrag(null); setOver(null)
  }

  async function save(task) {
    const isNew = !tasks.some(t => t.id === task.id)
    if (isNew) {
      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert({ titulo: task.titulo, col: task.col, resp: task.resp, prazo: task.prazo, prioridade: task.prioridade })
        .select()
        .single()
      if (!error) onAdd(data)
    } else {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ titulo: task.titulo, col: task.col, resp: task.resp, prazo: task.prazo, prioridade: task.prioridade })
        .eq('id', task.id)
      if (!error) onUpdate(task)
    }
    setEditing(null)
  }

  async function remove(id) {
    const { error } = await supabase.from('kanban_tasks').delete().eq('id', id)
    if (!error) onDelete(id)
    setEditing(null)
  }

  const formTask = editing && (editing.task || { col: editing.new })

  return (
    <div className="kb-wrap">
      <div className="kb-head">
        <div>
          <h2 className="view-title">Kanban de tasks</h2>
          <p className="view-sub">Arraste os cards entre as colunas · clique em <b>+</b> para criar e no lápis para editar.</p>
        </div>
        <div className="kb-head-actions">
          <button className="btn-primary" onClick={() => setEditing({ new: KANBAN_COLS[0].id })}>
            <IcPlus /> Nova task
          </button>
        </div>
      </div>

      <div className="kb-board">
        {KANBAN_COLS.map(col => {
          const colTasks = tasks.filter(t => t.col === col.id)
          return (
            <section
              key={col.id}
              className={'kb-col' + (over === col.id ? ' kb-col--over' : '')}
              onDragOver={e => { e.preventDefault(); setOver(col.id) }}
              onDragLeave={e => { if (e.currentTarget === e.target) setOver(null) }}
              onDrop={e => { e.preventDefault(); onDrop(col.id) }}
            >
              <header className="kb-col-head">
                <span className={`kb-dot kb-dot--${col.id}`}></span>
                <h3>{col.titulo}</h3>
                <span className="kb-count">{colTasks.length}</span>
              </header>
              <div className="kb-col-body">
                {colTasks.map(t => (
                  <TaskCard key={t.id} task={t} dragging={drag?.id === t.id}
                    onDragStart={onDragStart} onDragEnd={onDragEnd}
                    onEdit={tk => setEditing({ task: tk })} />
                ))}
                {colTasks.length === 0 && <div className="kb-empty">Solte um card aqui</div>}
                <button className="kb-add" onClick={() => setEditing({ new: col.id })}>
                  <IcPlus /> Adicionar
                </button>
              </div>
            </section>
          )
        })}
      </div>

      {editing && (
        <TaskForm task={formTask} onClose={() => setEditing(null)}
          onSave={save} onDelete={() => remove(formTask.id)} />
      )}
    </div>
  )
}
