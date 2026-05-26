// app/admin/cambiar-password/page.tsx
import AdminPasswordChange from '../_components/AdminPasswordChange'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function ChangePasswordPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div className="max-w-md mx-auto py-12">
      <AdminPasswordChange />
    </div>
  )
}