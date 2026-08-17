import { createClient } from '@/lib/supabase/server'
import ProposeClient from './ProposeClient'

export default async function ProposePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('profile_id', user!.id)
    .single()

  // Get all approved buyers
  const { data: buyers } = await supabase
    .from('profiles')
    .select('id, full_name, company, position, industry, country')
    .eq('role', 'buyer')
    .eq('status', 'approved')
    .order('full_name')

  // Get exhibitor's open slots
  const { data: slots } = await supabase
    .from('slots')
    .select('id, date, start_time, end_time, venue')
    .eq('exhibitor_id', exhibitor?.id)
    .eq('is_booked', false)
    .order('date')
    .order('start_time')

  // Get existing proposals from this exhibitor
  const { data: existingProposals } = await supabase
    .from('proposals')
    .select('buyer_id, status')
    .eq('exhibitor_id', exhibitor?.id)
    .neq('status', 'rejected')

  const proposedBuyerIds = new Set(existingProposals?.map(p => p.buyer_id) ?? [])

  return (
    <ProposeClient
      buyers={buyers ?? []}
      slots={slots ?? []}
      proposedBuyerIds={Array.from(proposedBuyerIds)}
    />
  )
}
