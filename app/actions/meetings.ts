'use server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendMeetingConfirmation, sendBookingNotificationToExhibitor } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function bookSlot(slotId: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  // Get buyer profile
  const { data: buyer } = await supabase
    .from('profiles')
    .select('full_name, company, status')
    .eq('id', user.id)
    .single()

  if (!buyer || buyer.status !== 'approved') return { error: 'Tài khoản chưa được phê duyệt.' }

  // Get slot + exhibitor info
  const { data: slot } = await supabase
    .from('slots')
    .select('*, exhibitors(name, email)')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot không tồn tại.' }
  if (!slot.is_open) return { error: 'Slot này đã được đặt.' }

  // Check buyer hasn't already booked this exhibitor
  const { data: existing } = await supabase
    .from('meetings')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('exhibitor_id', slot.exhibitor_id)
    .neq('status', 'cancelled')
    .single()

  if (existing) return { error: 'Bạn đã có lịch gặp với đơn vị này.' }

  const { error: meetErr } = await supabase.from('meetings').insert({
    slot_id: slotId,
    buyer_id: user.id,
    exhibitor_id: slot.exhibitor_id,
    event_date: slot.event_date,
    start_time: slot.start_time,
    venue: slot.venue,
    notes,
    status: 'confirmed',
  })

  if (meetErr) return { error: 'Lỗi đặt lịch. Vui lòng thử lại.' }

  // Mark slot as booked
  await supabase.from('slots').update({ is_open: false }).eq('id', slotId)

  // Send emails
  const exhibitorProfile = slot.exhibitors as any;
  if (exhibitorProfile) {
    await sendMeetingConfirmation({
      to: user.email!,
      buyerName: buyer.full_name,
      exhibitorName: exhibitorProfile.name,
      date: slot.event_date ?? slot.date,
      time: slot.start_time,
      venue: slot.venue,
    })
    await sendBookingNotificationToExhibitor({
      to: exhibitorProfile.email,
      exhibitorName: exhibitorProfile.name,
      buyerName: buyer.full_name,
      buyerCompany: buyer.company ?? '',
      date: slot.event_date ?? slot.date,
      time: slot.start_time,
      notes,
    })
  }

  revalidatePath('/buyer/browse')
  revalidatePath('/buyer/schedule')
  return { success: true }
}

export async function cancelMeeting(meetingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: meeting } = await supabase
    .from('meetings')
    .select('slot_id, buyer_id')
    .eq('id', meetingId)
    .single()

  if (!meeting) return { error: 'Không tìm thấy lịch.' }
  if (meeting.buyer_id !== user.id) return { error: 'Không có quyền hủy lịch này.' }

  await supabase.from('meetings').update({ status: 'cancelled' }).eq('id', meetingId)
  await supabase.from('slots').update({ is_open: true }).eq('id', meeting.slot_id)

  revalidatePath('/buyer/schedule')
  return { success: true }
}

export async function adminCancelMeeting(meetingId: string) {
  const admin = createAdminClient()
  const { data: meeting } = await admin
    .from('meetings')
    .select('slot_id')
    .eq('id', meetingId)
    .single()

  if (!meeting) return { error: 'Không tìm thấy lịch.' }

  await admin.from('meetings').update({ status: 'cancelled' }).eq('id', meetingId)
  await admin.from('slots').update({ is_open: true }).eq('id', meeting.slot_id)

  revalidatePath('/admin/meetings')
  return { success: true }
}

// Exhibitor proposes a meeting to a buyer (creates a proposal)
export async function proposeMeeting(buyerId: string, slotId: string, message: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!exhibitor) return { error: 'Không tìm thấy tài khoản exhibitor.' }

  const { data: slot } = await supabase.from('slots').select('event_date, start_time, venue').eq('id', slotId).single();
  if (!slot) return { error: 'Không tìm thấy slot.' }

  // Create pending meeting
  const { data: meeting, error: meetingErr } = await supabase.from('meetings').insert({
    buyer_id: buyerId,
    exhibitor_id: exhibitor.id,
    event_date: slot.event_date,
    start_time: slot.start_time,
    venue: slot.venue ?? 'Buyers Lounge, Hall 5-6',
    status: 'pending',
    slot_id: slotId
  }).select().single()

  if (meetingErr || !meeting) return { error: 'Lỗi tạo cuộc hẹn chờ duyệt.' }

  // Close the slot
  await supabase.from('slots').update({ is_open: false }).eq('id', slotId)

  const { error } = await supabase.from('proposals').insert({
    exhibitor_id: exhibitor.id,
    buyer_id: buyerId,
    meeting_id: meeting.id,
    message,
    status: 'pending'
  })

  if (error) return { error: 'Lỗi gửi đề xuất.' }

  revalidatePath('/exhibitor/propose')
  return { success: true }
}

export async function acceptProposal(proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: proposal } = await supabase
    .from('proposals')
    .select('meeting_id')
    .eq('id', proposalId)
    .single()

  if (proposal) {
    await supabase.from('meetings').update({ status: 'confirmed' }).eq('id', proposal.meeting_id)
  }

  await supabase
    .from('proposals')
    .update({ status: 'arranged' })
    .eq('id', proposalId)
    .eq('buyer_id', user.id)

  revalidatePath('/buyer/schedule')
  return { success: true }
}

export async function rejectProposal(proposalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: proposal } = await supabase
    .from('proposals')
    .select('meeting_id')
    .eq('id', proposalId)
    .single()

  if (proposal) {
    const { data: meeting } = await supabase.from('meetings').select('slot_id').eq('id', proposal.meeting_id).single()
    if (meeting?.slot_id) {
      await supabase.from('slots').update({ is_open: true }).eq('id', meeting.slot_id)
    }
    await supabase.from('meetings').update({ status: 'rejected' }).eq('id', proposal.meeting_id)
  }

  await supabase
    .from('proposals')
    .update({ status: 'rejected' })
    .eq('id', proposalId)
    .eq('buyer_id', user.id)

  revalidatePath('/buyer/schedule')
  return { success: true }
}

export async function acceptMeeting(meetingId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const { data: exhibitor } = await supabase.from('exhibitors').select('id').eq('user_id', user.id).single()
  if (!exhibitor) return { error: 'Tài khoản không hợp lệ' }

  // update meeting status
  const { error } = await supabase
    .from('meetings')
    .update({ status: 'confirmed' })
    .eq('id', meetingId)
    .eq('exhibitor_id', exhibitor.id)

  if (error) return { error: 'Lỗi khi chấp nhận' }
  revalidatePath('/exhibitor/requests')
  return { success: true }
}

export async function rejectMeeting(meetingId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập' }

  const { data: exhibitor } = await supabase.from('exhibitors').select('id').eq('user_id', user.id).single()
  if (!exhibitor) return { error: 'Tài khoản không hợp lệ' }

  const { data: meeting } = await supabase
    .from('meetings')
    .select('slot_id, exhibitor_id')
    .eq('id', meetingId)
    .single()
    
  if (!meeting) return { error: 'Không tìm thấy cuộc hẹn' }
  if (meeting.exhibitor_id !== exhibitor.id) return { error: 'Không có quyền thao tác' }

  const { error } = await supabase
    .from('meetings')
    .update({ status: 'rejected' })
    .eq('id', meetingId)

  if (!error && meeting.slot_id) {
    // Reopen the slot
    await supabase.from('slots').update({ is_open: true }).eq('id', meeting.slot_id)
  }

  if (error) return { error: 'Lỗi khi từ chối' }
  revalidatePath('/exhibitor/requests')
  return { success: true }
}
