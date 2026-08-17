import { createClient } from '@/lib/supabase/server'
import SlotsClient from './SlotsClient'

export default async function SlotsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, company_name, booth_number')
    .eq('profile_id', user!.id)
    .single()

  const { data: slots } = await supabase
    .from('slots')
    .select('*, meetings(buyer_id, status, profiles!buyer_id(full_name, company))')
    .eq('exhibitor_id', exhibitor?.id)
    .order('date')
    .order('start_time')

  return <SlotsClient slots={slots ?? []} exhibitorId={exhibitor?.id ?? ''} />
}
