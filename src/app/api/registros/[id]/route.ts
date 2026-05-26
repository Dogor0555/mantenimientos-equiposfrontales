// src/app/api/registros/[id]/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Verificar que el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Eliminar el registro - CORREGIDO: usar 'registros_mantenimiento'
    const { error } = await supabase
      .from('registros_mantenimiento')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error en delete:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar registro:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el registro' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Verificar que el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    
    // Actualizar el registro - CORREGIDO: usar 'registros_mantenimiento'
    const { error } = await supabase
      .from('registros_mantenimiento')
      .update({
        fecha: body.fecha,
        turno: body.turno,
        operador: body.operador,
        equipo: body.equipo,
        engrase: body.engrase,
        sopleteo: body.sopleteo,
        odometro: body.odometro,
        observaciones: body.observaciones,
        foto_url: body.foto_url,
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error en update:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al actualizar registro:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el registro' },
      { status: 500 }
    )
  }
}