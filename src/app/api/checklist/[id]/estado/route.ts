// app/api/checklist/[id]/estado/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) {},
          remove(name: string, options: any) {},
        },
      }
    )
    
    const { estado, comentarios } = await request.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: registro, error: fetchError } = await supabase
      .from('checklist_operacional')
      .select('seguimiento')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    const seguimientoActual = registro.seguimiento || {
      estado: 'pendiente',
      historial: []
    }

    const nuevaActualizacion = {
      estado: estado,
      actualizado_por: user.email || user.user_metadata?.full_name || 'Usuario',
      actualizado_en: new Date().toISOString(),
      comentarios: comentarios || null
    }

    const nuevoSeguimiento = {
      estado: estado,
      actualizado_por: nuevaActualizacion.actualizado_por,
      actualizado_en: nuevaActualizacion.actualizado_en,
      comentarios: nuevaActualizacion.comentarios,
      historial: [...(seguimientoActual.historial || []), nuevaActualizacion]
    }

    const { error: updateError } = await supabase
      .from('checklist_operacional')
      .update({ seguimiento: nuevoSeguimiento })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, seguimiento: nuevoSeguimiento })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}