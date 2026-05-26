import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminNav from './_components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav userEmail={user.email ?? ''} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
