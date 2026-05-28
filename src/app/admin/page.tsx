import { createClient } from '@/lib/supabase-server'
import { Checklist, Mantenimiento } from '@/lib/types'
import AdminDashboardClient from './_components/AdminDashboardClient'

export const revalidate = 0

const ITEMS_PER_PAGE = 5

async function getChecklistData(page: number = 1) {
  const supabase = createClient()
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Get paginated data
  const { data: checklist, count: totalCount } = await supabase
    .from('checklist_operacional')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  return {
    data: (checklist as Checklist[]) ?? [],
    total: totalCount ?? 0,
    page,
    itemsPerPage: ITEMS_PER_PAGE,
  }
}

async function getMantenimientosData(page: number = 1) {
  const supabase = createClient()
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Get paginated data
  const { data: mantenimientos, count: totalCount } = await supabase
    .from('registros_mantenimiento')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1)

  return {
    data: (mantenimientos as Mantenimiento[]) ?? [],
    total: totalCount ?? 0,
    page,
    itemsPerPage: ITEMS_PER_PAGE,
  }
}

export default async function AdminPage(props: { searchParams: Promise<Record<string, string>> }) {
  const searchParams = await props.searchParams
  const checklistPage = Math.max(1, parseInt(searchParams.checklistPage || '1', 10))
  const mantenimientoPage = Math.max(1, parseInt(searchParams.mantenimientoPage || '1', 10))

  const checklistResult = await getChecklistData(checklistPage)
  const mantenimientosResult = await getMantenimientosData(mantenimientoPage)

  return (
    <AdminDashboardClient 
      checklist={checklistResult.data}
      checklistPagination={{
        total: checklistResult.total,
        page: checklistResult.page,
        itemsPerPage: checklistResult.itemsPerPage,
      }}
      mantenimientos={mantenimientosResult.data}
      mantenimientosPagination={{
        total: mantenimientosResult.total,
        page: mantenimientosResult.page,
        itemsPerPage: mantenimientosResult.itemsPerPage,
      }}
    />
  )
}