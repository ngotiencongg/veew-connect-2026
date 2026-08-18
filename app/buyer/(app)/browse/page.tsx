import { createClient } from '@/lib/supabase/server'
import BrowseClient from './BrowseClient'

export default async function BrowsePage() {
  const supabase = createClient()

  // Get all exhibitors with their open slots
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawExhibitors } = await supabase
    .from('exhibitors')
    .select(`
      id, name, category, booth, description, website,
      slots(id, event_date, start_time, duration_mins, venue, is_open)
    `)
    .order('name')

  // Normalize data to match client type expectations
  const exhibitors = (rawExhibitors ?? []).map((ex: any) => ({
    ...ex,
    company_name: ex.name,
    booth_number: ex.booth,
    profiles: { full_name: ex.name, industry: null, country: null },
    slots: (ex.slots ?? []).map((s: any) => ({
      ...s,
      date: s.event_date,
      is_open: s.is_open,
      notes: null,
    })),
  }))

  // Get current user's booked exhibitor IDs
  const { data: { user } } = await supabase.auth.getUser()
  const { data: myMeetings } = await supabase
    .from('meetings')
    .select('exhibitor_id')
    .eq('buyer_id', user!.id)
    .neq('status', 'cancelled')

  const bookedExhibitorIds = Array.from(new Set(myMeetings?.map(m => m.exhibitor_id) ?? []))

  return (
    <BrowseClient
      exhibitors={exhibitors}
      bookedExhibitorIds={bookedExhibitorIds}
    />
  )
}
