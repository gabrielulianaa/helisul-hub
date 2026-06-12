export const PROJECT = {
  name: 'Projeto Helisul',
  subtitle: 'Hub central do projeto',
  client: 'Helisul',
  executor: 'Poli Júnior',
}

export const NAV = [
  { id: 'overview', label: 'Visão geral',  icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
  { id: 'atas',     label: 'Atas',         icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8' },
  { id: 'prd',      label: 'PRD',          icon: 'M9 12h6M9 16h6 M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
  { id: 'fluxo',    label: 'Fluxograma',   icon: 'M3 3h7v7H3z M14 14h7v7h-7z M14 3h7v7h-7z M7 10v4a2 2 0 0 0 2 2h2' },
  { id: 'kanban',   label: 'Kanban',       icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
]

export const KANBAN_COLS = [
  { id: 'todo',     titulo: 'A fazer'  },
  { id: 'doing',    titulo: 'Fazendo'  },
  { id: 'done',     titulo: 'Feito'    },
  { id: 'validado', titulo: 'Validado' },
]

export const MEMBERS = {
  MA: { nome: 'Mariana A.', cor: '#1200D0' },
  RA: { nome: 'Rafael S.',  cor: '#06A6D3' },
  JO: { nome: 'João O.',    cor: '#024C97' },
}

export const PRIO = {
  alta:  { label: 'Alta',  bg: '#FDE7E1', fg: '#C0392B' },
  media: { label: 'Média', bg: '#FFF1D6', fg: '#B26A00' },
  baixa: { label: 'Baixa', bg: '#E6F4EA', fg: '#1E7A43' },
}

export const MES     = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
export const MES_UP  = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

export function fmtData(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return `${d.getDate()} ${MES[d.getMonth()]} ${d.getFullYear()}`
}

export function hasLink(u) {
  return u && u !== '#' && !u.includes('SEU-BOARD')
}

export function uid() {
  return Math.random().toString(36).slice(2, 9)
}
