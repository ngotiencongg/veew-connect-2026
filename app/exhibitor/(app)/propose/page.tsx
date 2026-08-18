import { createClient } from '@/lib/supabase/server'
import ProposeClient from './ProposeClient'

export default async function ProposePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  // Get all approved buyers
  const { data: buyers } = await supabase
    .from('profiles')
    .select('id, full_name:name, company, position, industry, country')
    .eq('role', 'buyer')
    .eq('status', 'approved')
    .order('full_name')

  // Get exhibitor's open slots
  const { data: slots } = await supabase
    .from('slots')
    .select('id, date:event_date, start_time, duration_mins, venue')
    .eq('exhibitor_id', exhibitor?.id)
    .eq('is_open', true)
    .order('date')
    .order('start_time')

  // Get existing proposals from this exhibitor
  const { data: existingProposals } = await supabase
    .from('proposals')
    .select('buyer_id, status')
    .eq('exhibitor_id', exhibitor?.id)
    .neq('status', 'rejected')

  const proposedBuyerIds = new Set(existingProposals?.map(p => p.buyer_id) ?? [])

  const mappedSlots = (slots ?? []).map(s => {
    // start_time is "HH:mm:ss"
    const [h, m] = s.start_time.split(':').map(Number)
    const date = new Date(2026, 9, 17, h, m + (s.duration_mins || 30))
    const end_time = date.toTimeString().slice(0, 5) + ':00'
    return { ...s, end_time }
  })

  return (
    <ProposeClient
      buyers={buyers ?? []}
      slots={mappedSlots}
      proposedBuyerIds={Array.from(proposedBuyerIds)}
    />
  )
}
