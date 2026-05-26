'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Estado para recuperación de contraseña
  const [resetMode, setResetMode] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }
  
  async function handleResetPassword(e: React.FormEvent) {
  e.preventDefault()
  setError('')
  setResetLoading(true)
  
  const supabase = createClient()
  
  // La URL base debe ser la correcta
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'https://mantenimiento-tractores.vercel.app'
  
  console.log('📧 Enviando reset para:', resetEmail)
  console.log('➡️ Redirect to:', `${baseUrl}/auth/callback`)
  
  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
    redirectTo: `${baseUrl}/auth/callback`,
  })
  
  if (error) {
    console.error('❌ Error enviando email:', error)
    setError(error.message)
  } else {
    console.log('✅ Email enviado correctamente')
    setResetSent(true)
  }
  setResetLoading(false)
}
  // Si está en modo recuperación
  if (resetMode) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
        <div
          className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="w-full max-w-sm relative">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="font-display text-4xl tracking-widest text-amarillo">RECUPERAR</h1>
            <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mt-1">
              Restablecer contraseña
            </p>
          </div>
          
          <div className="card">
            <div className="section-header justify-center">
              📧 Recuperar acceso
            </div>
            
            {!resetSent ? (
              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    className="input-base"
                    required
                    autoComplete="email"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3 font-mono text-xs text-red-400">
                    ⚠ {error}
                  </div>
                )}
                
                <button type="submit" disabled={resetLoading} className="btn-primary w-full text-center">
                  {resetLoading ? '⏳ Enviando...' : 'Enviar instrucciones ▶'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-center font-mono text-xs text-gray-500 hover:text-amarillo"
                >
                  ← Volver al inicio de sesión
                </button>
              </form>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">📧</div>
                <p className="font-mono text-sm text-green-400">
                  ¡Instrucciones enviadas!
                </p>
                <p className="font-mono text-xs text-gray-400">
                  Revisa tu correo {resetEmail} para restablecer tu contraseña.
                </p>
                <button
                  onClick={() => setResetMode(false)}
                  className="btn-primary w-full text-center mt-4"
                >
                  Volver al login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Formulario normal de login
  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#F5C518 1px, transparent 1px), linear-gradient(90deg, #F5C518 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🚜</div>
          <h1 className="font-display text-4xl tracking-widest text-amarillo">EQUIPOS</h1>
          <p className="font-mono text-xs text-gray-500 tracking-widest uppercase mt-1">
            Panel de Administración
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <div className="section-header justify-center">
            🔐 Acceso Administrador
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="input-base"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 font-mono text-xs text-red-400">
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-center mt-2">
              {loading ? '⏳ Verificando...' : 'Ingresar ▶'}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="font-mono text-xs text-gray-500 hover:text-amarillo transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        <p className="text-center font-mono text-xs text-gray-600 mt-6">
          ¿No eres admin?{' '}
          <a href="/registro" className="text-amarillo hover:underline">
            Ir a registro de mantenimiento →
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}