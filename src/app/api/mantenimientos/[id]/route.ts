// src/app/api/mantenimientos/[id]/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Verificar autenticación
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el registro para saber qué fotos eliminar
    const { data: record, error: findError } = await supabase
      .from('registros_mantenimiento')
      .select('fotos_urls, foto_url')
      .eq('id', id)
      .single()
    
    if (findError) {
      return NextResponse.json(
        { error: `Error al buscar: ${findError.message}` }, 
        { status: 404 }
      )
    }
    
    // Eliminar fotos del storage
    const fotosToDelete: string[] = []
    if (record?.fotos_urls && record.fotos_urls.length > 0) {
      fotosToDelete.push(...record.fotos_urls)
    }
    if (record?.foto_url) {
      fotosToDelete.push(record.foto_url)
    }
    
    // Eliminar cada foto del storage
    for (const fotoUrl of fotosToDelete) {
      try {
        const fileName = fotoUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('fotos-mantenimiento').remove([fileName])
        }
      } catch (err) {
        console.error('Error eliminando foto del storage:', err)
      }
    }
    
    // Eliminar el registro
    const { error: deleteError } = await supabase
      .from('registros_mantenimiento')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: `Error al eliminar: ${deleteError.message}` }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    )
  }
}