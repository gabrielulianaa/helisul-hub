'use client'
import { PROJECT } from '@/lib/constants'
import { IcArrow } from './ui/Icons'

const CARDS = [
  {
    id: 'atas',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8',
    getValor: (atas) => atas.length,
    label: 'Atas de reunião',
    sub: 'registradas',
  },
  {
    id: 'prd',
    icon: 'M9 12h6M9 16h6M9 8h2 M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
    getValor: () => 'PRD',
    label: null,
    sub: 'requisitos do produto',
  },
  {
    id: 'fluxo',
    icon: 'M3 3h7v7H3z M14 14h7v7h-7z M14 3h7v7h-7z M7 10v4a2 2 0 0 0 2 2h2',
    getValor: () => 'Fluxo',
    label: 'Fluxograma',
    sub: 'fluxo macro',
  },
  {
    id: 'kanban',
    icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    getValor: (_, tasks) => tasks.length,
    label: 'Kanban',
    sub: 'tasks no quadro',
  },
]

export default function Overview({ go, atas, tasks }) {
  return (
    <div className="view">
      <div className="ov-hero">
        <div className="ov-hero-text">
          <span className="eyebrow">Bem-vindo ao hub</span>
          <h1>{PROJECT.name}</h1>
          <p>Tudo do projeto em um só lugar: atas de reunião, documento de requisitos, fluxograma e o acompanhamento de tasks.</p>
        </div>
      </div>

      <div className="ov-grid">
        {CARDS.map(c => (
          <button key={c.id} className="ov-card" onClick={() => go(c.id)}>
            <span className="ov-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {c.icon.split(' M').map((seg, i) => (
                  <path key={i} d={i === 0 ? seg : 'M' + seg} />
                ))}
              </svg>
            </span>
            <span className="ov-card-valor">{c.getValor(atas, tasks)}</span>
            {c.label && <span className="ov-card-label">{c.label}</span>}
            <span className="ov-card-sub">{c.sub}</span>
            <span className="ov-card-arrow"><IcArrow /></span>
          </button>
        ))}
      </div>
    </div>
  )
}
