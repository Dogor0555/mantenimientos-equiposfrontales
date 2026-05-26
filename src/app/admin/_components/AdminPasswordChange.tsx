// AdminPasswordChange.tsx - Componente para cambiar contraseña
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AdminPasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    setLoading(true)
    
    const supabase = createClient()
    
    // Primero verificamos la contraseña actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      setError('Error al obtener usuario')
      setLoading(false)
      return
    }
    
    // Actualizamos la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (updateError) {
      setError(`Error: ${updateError.message}`)
    } else {
      setMessage('✅ Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    
    setLoading(false)
  }
  
  return (
    <div className="card">
      <div className="section-header">
        🔐 Cambiar Contraseña
      </div>
      <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
        <div>
          <label className="label">Nueva Contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="input-base"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="input-base"
            required
          />
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 font-mono text-xs text-red-400">
            ⚠ {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3 font-mono text-xs text-green-400">
            {message}
          </div>
        )}
        
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '⏳ Actualizando...' : 'Cambiar Contraseña ▶'}
        </button>
      </form>
    </div>
  )
}