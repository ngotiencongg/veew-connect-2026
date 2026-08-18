import { createClient } from '@/lib/supabase/server'
import SlotsClient from './SlotsClient'

export default async function SlotsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id, company_name:name, booth_number:booth')
    .eq('user_id', user!.id)
    .single()

  const { data: rawSlots } = await supabase
    .from('slots')
    .select('*, meetings(buyer_id, status, profiles!buyer_id(full_name, company))')
    .eq('exhibitor_id', exhibitor?.id)
    .order('event_date')
    .order('start_time')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slots = (rawSlots ?? []).map((s: any) => {
    // Calculate end_time from start_time + duration_mins
    let endTimeStr = '00:00'
    if (s.start_time) {
      const [h, m] = s.start_time.split(':').map(Number)
      const totalMins = h * 60 + m + (s.duration_mins || 30)
      const endH = Math.floor(totalMins / 60).toString().padStart(2, '0')
      const endM = (totalMins % 60).toString().padStart(2, '0')
      endTimeStr = `${endH}:${endM}`
    }
    
    return {
      ...s,
      date: s.event_date,
      end_time: endTimeStr,
    }
  })

  return <SlotsClient slots={slots} exhibitorId={exhibitor?.id ?? ''} />
}
