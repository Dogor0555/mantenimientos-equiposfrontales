import { createClient } from '@/lib/supabase-server'
import { Checklist, Mantenimiento } from '@/lib/types'
import AdminDashboardClient from './_components/AdminDashboardClient'

export const revalidate = 0

export default async function AdminPage() {
  const supabase = createClient()
  
  // Traer datos de Checklist
  const { data: checklist } = await supabase
    .from('checklist_operacional')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  // Traer datos de Mantenimiento
  const { data: mantenimientos } = await supabase
    .from('registros_mantenimiento')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <AdminDashboardClient 
      checklist={(checklist as Checklist[]) ?? []} 
      mantenimientos={(mantenimientos as Mantenimiento[]) ?? []} 
    />
  )
}