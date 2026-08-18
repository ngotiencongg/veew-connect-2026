import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/ui/NavBar'
import AdminNav from '@/components/ui/AdminNav'

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name:name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/admin/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)' }}>
      <NavBar userName={`Admin: ${profile.full_name}`} logoutRedirect="/admin/login" />
      <AdminNav />
      <main className="page-wrap">
        {children}
      </main>
    </div>
  )
}
