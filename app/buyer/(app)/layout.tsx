import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/ui/NavBar'
import BuyerNav from '@/components/ui/BuyerNav'

export default async function BuyerAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/buyer/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name:name, role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'buyer') redirect('/buyer/login')
  if (profile.status === 'pending') redirect('/buyer/pending')
  if (profile.status === 'rejected') redirect('/buyer/login')

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)' }}>
      <NavBar userName={profile.full_name} logoutRedirect="/buyer/login" />
      <BuyerNav />
      <main className="page-wrap">
        {children}
      </main>
    </div>
  )
}
