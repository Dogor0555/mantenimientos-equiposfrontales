import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Buscar el código en cualquier parámetro de la URL
  let code = requestUrl.searchParams.get('code')
  
  // Si no hay código en searchParams, buscarlo en el hash (#)
  if (!code && requestUrl.hash) {
    const hashParams = new URLSearchParams(requestUrl.hash.substring(1))
    code = hashParams.get('code')
  }
  
  console.log('📍 URL completa:', requestUrl.toString())
  console.log('🔑 Código encontrado:', code)
  
  // Si hay código, intercambiarlo por sesión
  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Error intercambiando código:', error)
      // Redirigir al login con error
      return NextResponse.redirect(new URL('/login?error=link_invalido', request.url))
    }
    
    console.log('✅ Sesión establecida correctamente')
  }
  
  // Redirigir a cambiar contraseña
  return NextResponse.redirect(new URL('/admin/cambiar-password', request.url))
}