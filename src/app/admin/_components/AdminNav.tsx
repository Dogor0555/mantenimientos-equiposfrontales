'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import clsx from 'clsx'

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const path = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/admin', label: '📊 Dashboard', exact: true },
    { href: '/admin/equipos', label: '🚜 Equipos & QR', exact: false },
    { href: '/admin/cambiar-password', label: '🔐 Cambiar Contraseña', exact: false },
  ]

  return (
    <header className="bg-amarillo sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚜</span>
          <div>
            <h1 className="font-display text-2xl text-black tracking-widest leading-none">Control Mantenimiento</h1>
            <p className="font-mono text-[10px] text-black/50 tracking-widest uppercase">Equipos Frontales · Admin</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map(l => {
            const active = l.exact ? path === l.href : path.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'font-display text-sm tracking-widest px-4 py-1.5 rounded transition-colors',
                  active ? 'bg-black text-amarillo' : 'text-black hover:bg-black/10'
                )}
              >
                {l.label}
              </Link>
            )
          })}
          <a
            href="/registro"
            target="_blank"
            className="font-display text-sm tracking-widest px-4 py-1.5 rounded text-black hover:bg-black/10 transition-colors"
          >
            📋 Ver Formulario ↗
          </a>
        </nav>

        {/* User */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block font-mono text-xs text-black/60 truncate max-w-[160px]">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="font-display text-sm tracking-widest bg-black text-amarillo px-4 py-1.5 rounded hover:bg-gray-900 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}