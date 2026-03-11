'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/api/auth'
import { auth } from '@/lib/auth'
import clsx from 'clsx'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  // Register form
  const [regForm, setRegForm] = useState({ username: '', password: '', nickname: '', email: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(loginForm)
      if (res.code === 200) {
        auth.setToken(res.data.accessToken, res.data.expiresIn)
        auth.setUser(res.data.userInfo)
        router.push('/dashboard')
      } else {
        setError(res.message)
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await authApi.register(regForm)
      if (res.code === 200) {
        setSuccess('注册成功！请登录')
        setTab('login')
        setLoginForm({ username: regForm.username, password: '' })
      } else {
        setError(res.message)
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex overflow-hidden">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16
                      bg-surface-1 border-r border-border">
        {/* Grid background */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-100"
          style={{ backgroundSize: '40px 40px' }}
        />
        {/* Diagonal accent stripe */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent" />

        {/* Top brand mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
            <span className="font-mono text-xs text-text-muted tracking-[0.3em] uppercase">
              System v1.0.0
            </span>
          </div>
        </div>

        {/* Center hero text */}
        <div className="relative z-10">
          <p className="font-mono text-xs text-accent tracking-[0.4em] uppercase mb-6">
            Full Stack Demo
          </p>
          <h1 className="font-display text-[72px] leading-[0.9] tracking-tight text-text-primary mb-8">
            DEMO
            <br />
            <span className="text-gradient">SYSTEM</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-xs font-light">
            Spring Boot · Next.js · MySQL · Redis · JWT
          </p>

          {/* Tech stack indicators */}
          <div className="mt-12 flex flex-col gap-3">
            {[
              { label: 'Spring Boot 3', status: 'ACTIVE' },
              { label: 'JWT Auth', status: 'ACTIVE' },
              { label: 'Redis Cache', status: 'ACTIVE' },
              { label: 'MySQL 8', status: 'ACTIVE' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-28">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-success" />
                  <span className="font-mono text-[10px] text-status-success tracking-wider">
                    {item.status}
                  </span>
                </div>
                <span className="text-text-muted text-sm font-light">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
            Jenkins CI/CD · Learning Project
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] rounded-full
                        bg-accent/[0.03] blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm animate-slide-up">
          {/* Mobile brand */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="font-display text-4xl text-gradient">DEMO</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-0 mb-10 border border-border rounded-lg overflow-hidden">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={clsx(
                  'flex-1 py-2.5 text-sm font-mono tracking-wider transition-all duration-200',
                  tab === t
                    ? 'bg-accent text-surface font-bold'
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                )}
              >
                {t === 'login' ? '登 录' : '注 册'}
              </button>
            ))}
          </div>

          {/* Status messages */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded border border-status-error/30 bg-status-error/5
                            text-status-error text-sm font-mono animate-fade-in">
              ✗ {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded border border-status-success/30 bg-status-success/5
                            text-status-success text-sm font-mono animate-fade-in">
              ✓ {success}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field
                label="USERNAME"
                type="text"
                value={loginForm.username}
                onChange={(v) => setLoginForm({ ...loginForm, username: v })}
                placeholder="请输入用户名"
                autoFocus
              />
              <Field
                label="PASSWORD"
                type="password"
                value={loginForm.password}
                onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                placeholder="请输入密码"
              />
              <div className="pt-2">
                <SubmitButton loading={loading} label="登 录" />
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="USERNAME" type="text"
                value={regForm.username}
                onChange={(v) => setRegForm({ ...regForm, username: v })}
                placeholder="3-50 位字母数字" autoFocus />
              <Field label="NICKNAME" type="text"
                value={regForm.nickname}
                onChange={(v) => setRegForm({ ...regForm, nickname: v })}
                placeholder="显示名称" />
              <Field label="EMAIL" type="email"
                value={regForm.email}
                onChange={(v) => setRegForm({ ...regForm, email: v })}
                placeholder="your@email.com" />
              <Field label="PASSWORD" type="password"
                value={regForm.password}
                onChange={(v) => setRegForm({ ...regForm, password: v })}
                placeholder="至少 6 位" />
              <div className="pt-2">
                <SubmitButton loading={loading} label="注 册" />
              </div>
            </form>
          )}

          {/* Demo hint */}
          <p className="mt-8 text-center font-mono text-[10px] text-text-muted tracking-widest">
            DEMO ACCOUNT: admin / admin123
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function Field({
  label, type, value, onChange, placeholder, autoFocus
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <div className="group">
      <label className="block font-mono text-[10px] text-text-muted tracking-[0.3em] mb-2 uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className={clsx(
          'w-full bg-surface-2 border border-border rounded px-4 py-3',
          'text-text-primary text-sm font-light placeholder:text-text-muted',
          'outline-none transition-all duration-200',
          'focus:border-accent/60 focus:bg-surface-2 focus:ring-1 focus:ring-accent/20',
          'hover:border-border-bright'
        )}
      />
    </div>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={clsx(
        'w-full py-3 rounded font-mono text-sm tracking-[0.3em] font-bold',
        'transition-all duration-200 relative overflow-hidden',
        loading
          ? 'bg-surface-3 text-text-muted cursor-not-allowed border border-border'
          : 'bg-accent text-surface hover:bg-accent-dim active:scale-[0.98] glow-accent'
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-text-muted/30 border-t-text-muted
                           rounded-full animate-spin" />
          PROCESSING
        </span>
      ) : label}
    </button>
  )
}
