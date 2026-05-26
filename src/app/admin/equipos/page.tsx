import { EQUIPOS } from '@/lib/constants'
import { createClient } from '@/lib/supabase-server'
import EquiposClient from './EquiposClient'

export const revalidate = 0

export default async function EquiposPage() {
  const supabase = createClient()

  // Fetch count per equipo
  const { data } = await supabase
    .from('registros_mantenimiento')
    .select('equipo')

  const countByEquipo: Record<string, number> = {}
  EQUIPOS.forEach(eq => { countByEquipo[eq] = 0 })
  data?.forEach(r => {
    if (countByEquipo[r.equipo] !== undefined) countByEquipo[r.equipo]++
  })

  return <EquiposClient countByEquipo={countByEquipo} />
}
