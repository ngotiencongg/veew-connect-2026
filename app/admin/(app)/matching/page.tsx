import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminMatchingClient from './AdminMatchingClient'

export default async function AdminMatchingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Fetch approved buyers with needs
  const { data: buyers } = await supabase
    .from('profiles')
    .select('id, full_name:name, company, industry, needs, country')
    .eq('role', 'buyer')
    .eq('status', 'approved')
    .order('full_name')

  // Fetch exhibitors
  const { data: exhibitors } = await supabase
    .from('exhibitors')
    .select('id, name, category, description, booth, emoji')
    .order('name')

  // Fetch existing meetings to know which pairs already matched
  const { data: meetings } = await supabase
    .from('meetings')
    .select('buyer_id, exhibitor_id')
    .in('status', ['pending', 'confirmed'])

  return (
    <AdminMatchingClient
      buyers={buyers ?? []}
      exhibitors={exhibitors ?? []}
      existingMeetings={meetings ?? []}
    />
  )
}
