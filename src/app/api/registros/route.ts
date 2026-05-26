// src/app/api/registros/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = createClient()

  let query = supabase.from('registros_mantenimiento').select('*').order('created_at', { ascending: false })

  const equipo = searchParams.get('equipo')
  const operador = searchParams.get('operador')
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  if (equipo) query = query.eq('equipo', equipo)
  if (operador) query = query.eq('operador', operador)
  if (desde) query = query.gte('fecha', desde)
  if (hasta) query = query.lte('fecha', hasta)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
