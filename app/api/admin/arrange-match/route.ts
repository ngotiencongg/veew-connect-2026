import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { buyerId, exhibitorId } = await request.json()
    if (!buyerId || !exhibitorId) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 })

    const admin = createAdminClient()
    
    // Kiểm tra meeting trùng lặp
    const { data: existingMeeting } = await admin
      .from('meetings')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('exhibitor_id', exhibitorId)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (existingMeeting) {
      return NextResponse.json({ error: 'Đã có lịch hẹn (hoặc đang chờ) giữa 2 người này' }, { status: 400 })
    }

    // Create a meeting directly. We use a placeholder slot, or null if schema allows slot_id to be null.
    // In schema.sql, `slot_id` is references public.slots(id) on delete set null. It CAN be null!
    // But we need a valid event_date and start_time. Let's use the first event day at 09:00.
    const { error } = await admin
      .from('meetings')
      .insert({
        buyer_id: buyerId,
        exhibitor_id: exhibitorId,
        event_date: '2026-10-17',
        start_time: '09:00:00',
        venue: 'Bàn Trợ giúp (BTC)',
        status: 'confirmed'
      })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
