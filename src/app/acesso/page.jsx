'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function AcessoForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push(params.get('from') || '/')
    } else {
      const data = await res.json()
      setError(data.error || 'Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fld">
        <span className="fld-label">Código de acesso</span>
        <input
          className="fld-input"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Digite o código do projeto"
          autoFocus
          autoComplete="current-password"
        />
        {error && (
          <span style={{ fontSize: 13, color: '#C0392B', fontWeight: 600 }}>{error}</span>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ justifyContent: 'center' }}
      >
        {loading ? 'Verificando…' : 'Entrar'}
      </button>
    </form>
  )
}

export default function Acesso() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', padding: 24,
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 24,
        padding: '48px 44px', width: '100%', maxWidth: 440,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <Image src="/helisul-logo.png" alt="Helisul" width={52} height={52}
            style={{ borderRadius: 13, boxShadow: '0 4px 14px -4px rgba(18,0,208,.5)' }} />
          <div>
            <h1 style={{
              fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700,
              letterSpacing: '-.02em', color: 'var(--ink)', marginBottom: 6,
            }}>
              Projeto Helisul
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>
              Acesso restrito ao time do projeto
            </p>
          </div>
        </div>

        <Suspense>
          <AcessoForm />
        </Suspense>

      </div>
    </div>
  )
}
