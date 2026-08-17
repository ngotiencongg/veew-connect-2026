import { createClient } from '@/lib/supabase/server'
import ScheduleClient from './ScheduleClient'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawMeetings } = await supabase
    .from('meetings')
    .select(`
      id, event_date, start_time, venue, status, notes,
      exhibitors(name, booth)
    `)
    .eq('buyer_id', user!.id)
    .order('event_date')
    .order('start_time')

  // Normalize data
  const meetings = (rawMeetings ?? []).map((m: any) => ({
    ...m,
    date: m.event_date,
    exhibitors: Array.isArray(m.exhibitors)
      ? m.exhibitors[0]
        ? { company_name: m.exhibitors[0].name, booth_number: m.exhibitors[0].booth, profiles: { full_name: m.exhibitors[0].name } }
        : null
      : m.exhibitors
        ? { company_name: m.exhibitors.name, booth_number: m.exhibitors.booth, profiles: { full_name: m.exhibitors.name } }
        : null,
  }))

  return <ScheduleClient meetings={meetings} />
}
