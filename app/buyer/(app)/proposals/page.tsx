import { createClient } from '@/lib/supabase/server'
import ProposalsClient from './ProposalsClient'

export default async function ProposalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawProposals } = await supabase
    .from('proposals')
    .select(`
      id, status, message, created_at,
      slots(event_date, start_time, venue),
      exhibitors(name, booth)
    `)
    .eq('buyer_id', user!.id)
    .order('created_at', { ascending: false })

  const proposals = (rawProposals ?? []).map((p: any) => ({
    ...p,
    slots: Array.isArray(p.slots)
      ? p.slots[0]
        ? { date: p.slots[0].event_date, start_time: p.slots[0].start_time, venue: p.slots[0].venue }
        : null
      : p.slots
        ? { date: p.slots.event_date, start_time: p.slots.start_time, venue: p.slots.venue }
        : null,
    exhibitors: Array.isArray(p.exhibitors)
      ? p.exhibitors[0]
        ? { company_name: p.exhibitors[0].name, booth_number: p.exhibitors[0].booth, profiles: { full_name: p.exhibitors[0].name } }
        : null
      : p.exhibitors
        ? { company_name: p.exhibitors.name, booth_number: p.exhibitors.booth, profiles: { full_name: p.exhibitors.name } }
        : null,
  }))

  return <ProposalsClient proposals={proposals} />
}
