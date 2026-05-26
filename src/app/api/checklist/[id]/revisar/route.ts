// app/api/checklist/[id]/revisar/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(
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
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {},
          remove(name: string, options: any) {},
        },
      }
    )
    
    const { comentarios } = await request.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: registro, error: fetchError } = await supabase
      .from('checklist_operacional')
      .select('revisiones')
      .eq('id', params.id)
      .single()

    if (fetchError) throw fetchError

    const nuevaRevision = {
      revisado_por: user.email || user.user_metadata?.full_name || 'Usuario',
      revisado_en: new Date().toISOString(),
      comentarios: comentarios || null
    }

    const revisionesActuales = registro.revisiones || []
    const nuevasRevisiones = [...revisionesActuales, nuevaRevision]

    const { error: updateError } = await supabase
      .from('checklist_operacional')
      .update({ revisiones: nuevasRevisiones })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      revision: nuevaRevision,
      total_revisiones: nuevasRevisiones.length 
    })

  } catch (error) {
    console.error('Error al agregar revisión:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}