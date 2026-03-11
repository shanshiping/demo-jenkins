'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/api/auth'
import { auth } from '@/lib/auth'
import type { UserInfo } from '@/types'
import clsx from 'clsx'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      router.replace('/login')
      return
    }
    // Try cookie first (instant), then verify from server
    const cached = auth.getUser()
    if (cached) setUser(cached)

    authApi.me()
      .then((res) => {
        if (res.code === 200) {
          setUser(res.data)
          auth.setUser(res.data)
        }
      })
      .catch(() => {
        auth.clear()
        router.replace('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authApi.logout()
    } finally {
      auth.clear()
      router.replace('/login')
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          <p className="font-mono text-xs text-text-muted tracking-widest">LOADING</p>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'User ID', value: `#${user?.id?.toString().padStart(4, '0')}`, accent: false },
    { label: 'Role', value: user?.role ?? '—', accent: user?.role === 'ADMIN' },
    { label: 'Status', value: 'ACTIVE', accent: true },
    { label: 'Auth', value: 'JWT', accent: false },
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Top Navigation Bar ── */}
      <header className="border-b border-border bg-surface-1 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              <span className="font-display text-lg font-bold tracking-tight">DEMO</span>
            </div>
            <span className="hidden sm:block text-border-bright">|</span>
            <span className="hidden sm:block font-mono text-[10px] text-text-muted tracking-[0.3em] uppercase">
              Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded
                            border border-border bg-surface-2">
              <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                <span className="font-mono text-xs text-accent font-bold">
                  {user?.nickname?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-text-secondary font-light hidden sm:block">
                {user?.nickname || user?.username}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={clsx(
                'font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5 rounded',
                'border transition-all duration-200',
                loggingOut
                  ? 'border-border text-text-muted cursor-not-allowed'
                  : 'border-border text-text-secondary hover:border-status-error/50 hover:text-status-error'
              )}
            >
              {loggingOut ? '...' : 'LOGOUT'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-6 py-12">

        {/* Welcome section */}
        <div className="mb-12 animate-slide-up">
          <p className="font-mono text-xs text-accent tracking-[0.4em] uppercase mb-3">
            Welcome back
          </p>
          <h2 className="font-display text-5xl font-bold tracking-tight leading-tight">
            {user?.nickname || user?.username}
            <span className="text-text-muted">.</span>
          </h2>
          <p className="text-text-secondary text-sm mt-3 font-light">
            {user?.email || 'No email configured'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10"
             style={{ animationDelay: '0.1s' }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={clsx(
                'p-5 rounded border bg-surface-1 animate-slide-up',
                'hover:border-border-bright transition-colors duration-200',
                stat.accent ? 'border-accent/30' : 'border-border'
              )}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <p className="font-mono text-[9px] text-text-muted tracking-[0.3em] uppercase mb-2">
                {stat.label}
              </p>
              <p className={clsx(
                'font-mono text-lg font-bold',
                stat.accent ? 'text-accent' : 'text-text-primary'
              )}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Profile card */}
          <div className="lg:col-span-2 p-6 rounded border border-border bg-surface-1 animate-slide-up"
               style={{ animationDelay: '0.2s' }}>
            <SectionHeader label="Profile" />
            <div className="space-y-4 mt-5">
              {[
                { k: 'Username', v: user?.username },
                { k: 'Nickname', v: user?.nickname },
                { k: 'Email', v: user?.email },
                { k: 'Role', v: user?.role },
                { k: 'Member since', v: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('zh-CN')
                    : '—' },
              ].map((row) => (
                <div key={row.k}
                     className="flex items-center justify-between py-3
                                border-b border-border last:border-0">
                  <span className="font-mono text-[10px] text-text-muted tracking-widest uppercase">
                    {row.k}
                  </span>
                  <span className="text-sm text-text-primary font-light">{row.v || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* System status */}
            <div className="p-6 rounded border border-border bg-surface-1 animate-slide-up"
                 style={{ animationDelay: '0.25s' }}>
              <SectionHeader label="System" />
              <div className="mt-5 space-y-3">
                {[
                  { name: 'API Server', ok: true },
                  { name: 'Database', ok: true },
                  { name: 'Redis Cache', ok: true },
                  { name: 'JWT Auth', ok: true },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary font-light">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={clsx(
                        'w-1.5 h-1.5 rounded-full',
                        s.ok ? 'bg-status-success' : 'bg-status-error'
                      )} />
                      <span className={clsx(
                        'font-mono text-[9px] tracking-wider',
                        s.ok ? 'text-status-success' : 'text-status-error'
                      )}>
                        {s.ok ? 'UP' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="p-6 rounded border border-border bg-surface-1 animate-slide-up"
                 style={{ animationDelay: '0.3s' }}>
              <SectionHeader label="Links" />
              <div className="mt-5 space-y-2">
                {[
                  { label: 'Swagger UI', href: 'http://localhost:8080/api/swagger-ui.html' },
                  { label: 'Health Check', href: 'http://localhost:8080/api/actuator/health' },
                  { label: 'API Docs', href: 'http://localhost:8080/api/v3/api-docs' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-2 px-3 rounded
                               border border-transparent hover:border-border hover:bg-surface-2
                               transition-all duration-150 group"
                  >
                    <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                      {link.label}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted group-hover:text-accent transition-colors">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-4 bg-accent rounded-full" />
      <span className="font-mono text-[10px] tracking-[0.35em] text-text-muted uppercase">
        {label}
      </span>
    </div>
  )
}
