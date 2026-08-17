import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/ui/NavBar'
import ExhibitorNav from '@/components/ui/ExhibitorNav'

export default async function ExhibitorAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/exhibitor/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'exhibitor') redirect('/exhibitor/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)' }}>
      <NavBar userName={profile.full_name} logoutRedirect="/exhibitor/login" />
      <ExhibitorNav />
      <main className="page-wrap">
        {children}
      </main>
    </div>
  )
}
