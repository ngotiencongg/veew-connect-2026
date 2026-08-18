import { createAdminClient } from '@/lib/supabase/server'
import MeetingsAdminClient from './MeetingsAdminClient'

export default async function AdminMeetingsPage() {
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawMeetings } = await admin
    .from('meetings')
    .select(`
      id, event_date, start_time, venue, status, notes, created_at,
      profiles:buyer_id(full_name, company),
      exhibitors(name, booth)
    `)
    .order('event_date')
    .order('start_time')

  // Normalize array joins → single object
  const meetings = (rawMeetings ?? []).map((m: any) => ({
    ...m,
    date: m.event_date,
    profiles: Array.isArray(m.profiles) ? m.profiles[0] ?? null : m.profiles,
    exhibitors: Array.isArray(m.exhibitors) ? m.exhibitors[0] ?? null : m.exhibitors,
  }))

  const stats = {
    total: meetings.length,
    confirmed: meetings.filter(m => m.status === 'confirmed').length,
    cancelled: meetings.filter(m => m.status === 'cancelled').length,
  }

  return <MeetingsAdminClient meetings={meetings} stats={stats} />
}
