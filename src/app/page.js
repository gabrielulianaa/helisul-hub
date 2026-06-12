'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { PROJECT, NAV } from '@/lib/constants'
import Overview    from '@/components/Overview'
import Atas        from '@/components/Atas'
import PRDView     from '@/components/PRDView'
import Fluxograma  from '@/components/Fluxograma'
import Kanban      from '@/components/Kanban'
import { IcChev }  from '@/components/ui/Icons'

const TITLE_MAP = {
  overview: 'Visão geral',
  atas:     'Atas de reunião',
  prd:      'PRD',
  fluxo:    'Fluxograma',
  kanban:   'Kanban',
}

export default function Home() {
  const [page, setPage]   = useState('overview')
  const [loading, setLoading] = useState(true)

  const [atas,  setAtas]  = useState([])
  const [tasks, setTasks] = useState([])
  const [prd,   setPrd]   = useState(null)
  const [fluxo, setFluxo] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: atasData }, { data: tasksData }, { data: prdData }, { data: fluxoData }] =
        await Promise.all([
          supabase.from('atas').select('*').order('data', { ascending: false }),
          supabase.from('kanban_tasks').select('*').order('created_at'),
          supabase.from('prd').select('*').limit(1).single(),
          supabase.from('fluxo').select('*').limit(1).single(),
        ])
      if (atasData)  setAtas(atasData)
      if (tasksData) setTasks(tasksData)
      if (prdData)   setPrd(prdData)
      if (fluxoData) setFluxo(fluxoData)
      setLoading(false)
    }
    load()
  }, [])

  function go(p) { setPage(p) }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="app">
      {/* ===== Navegação lateral ===== */}
      <nav className="nav">
        <div className="nav-brand">
          <Image className="nav-logo" src="/helisul-logo.png" alt="Helisul" width={42} height={42} />
          <div className="nav-brand-text">
            <strong>{PROJECT.client}</strong>
            <span>{PROJECT.subtitle}</span>
          </div>
        </div>

        <ul className="nav-list">
          {NAV.map(n => (
            <li key={n.id}>
              <button
                className={'nav-item' + (page === n.id ? ' nav-item--active' : '')}
                onClick={() => go(n.id)}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {n.icon.split(' M').map((seg, i) => (
                    <path key={i} d={i === 0 ? seg : 'M' + seg} />
                  ))}
                </svg>
                <span>{n.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-foot">
          <span className="nav-foot-label">Projeto executado por</span>
          <Image className="nav-poli" src="/polijunior-logo.png" alt="Poli Júnior" width={120} height={34} />
        </div>
      </nav>

      {/* ===== Conteúdo principal ===== */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-crumb">
            <span className="crumb-root">{PROJECT.name}</span>
            <IcChev />
            <span className="crumb-cur">{TITLE_MAP[page]}</span>
          </div>
        </header>

        <main className="content">
          {page === 'overview' && (
            <Overview go={go} atas={atas} tasks={tasks} />
          )}
          {page === 'atas' && (
            <Atas
              atas={atas}
              onAdd={a  => setAtas(prev => [a, ...prev])}
              onUpdate={a  => setAtas(prev => prev.map(x => x.id === a.id ? a : x))}
              onDelete={id => setAtas(prev => prev.filter(x => x.id !== id))}
            />
          )}
          {page === 'prd' && (
            <PRDView prd={prd} onUpdate={setPrd} />
          )}
          {page === 'fluxo' && (
            <Fluxograma fluxo={fluxo} onUpdate={setFluxo} />
          )}
          {page === 'kanban' && (
            <Kanban
              tasks={tasks}
              onAdd={t    => setTasks(prev => [...prev, t])}
              onUpdate={t    => setTasks(prev => prev.map(x => x.id === t.id ? t : x))}
              onDelete={id   => setTasks(prev => prev.filter(x => x.id !== id))}
              onMove={(id, col) => setTasks(prev => prev.map(x => x.id === id ? { ...x, col } : x))}
            />
          )}
        </main>
      </div>
    </div>
  )
}
