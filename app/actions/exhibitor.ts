'use server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { generatePassword } from '@/lib/utils'
import { sendExhibitorCredentials } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function createExhibitorAccount(formData: FormData) {
  const admin = createAdminClient()

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const company = formData.get('company') as string
  const category = formData.get('category') as string
  const boothNumber = formData.get('boothNumber') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  const industry = formData.get('industry') as string
  const country = formData.get('country') as string

  const password = generatePassword(10)

  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'exhibitor' },
  })

  if (signUpError) {
    if (signUpError.message.includes('already')) {
      return { error: 'Email này đã được đăng ký.' }
    }
    return { error: 'Lỗi tạo tài khoản: ' + signUpError.message }
  }

  // Create profile
  const { error: profileErr } = await admin.from('profiles').upsert({
    id: authData.user.id,
    full_name: fullName,
    role: 'exhibitor',
    status: 'approved',
    company,
    industry,
    country,
  })

  if (profileErr) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: 'Lỗi tạo hồ sơ profile: ' + profileErr.message }
  }

  // Create exhibitor record
  const { error: exErr } = await admin.from('exhibitors').insert({
    user_id: authData.user.id,
    name: company,
    category,
    booth: boothNumber,
    description,
    website,
    contact_name: fullName,
    email: email,
  })

  if (exErr) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { error: 'Lỗi tạo hồ sơ exhibitor: ' + exErr.message }
  }

  await sendExhibitorCredentials({ to: email, name: fullName, company, password })

  revalidatePath('/admin/exhibitors')
  return { success: true }
}

export async function createSlot(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!exhibitor) return { error: 'Không tìm thấy tài khoản exhibitor.' }

  const dateStr = formData.get('date') as string;
  const startStr = formData.get('startTime') as string;
  const endStr = formData.get('endTime') as string;

  // Calculate duration in minutes
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  const duration = (endH * 60 + endM) - (startH * 60 + startM);

  const { error } = await supabase.from('slots').insert({
    exhibitor_id: exhibitor.id,
    event_date: dateStr,
    start_time: startStr + ':00',
    duration_mins: duration > 0 ? duration : 30,
    venue: formData.get('venue') as string,
    is_open: true,
  })

  if (error) return { error: 'Lỗi tạo slot: ' + error.message }
  revalidatePath('/exhibitor/slots')
  return { success: true }
}

export async function deleteSlot(slotId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { data: slot } = await supabase
    .from('slots')
    .select('is_open, exhibitors!inner(user_id)')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Không tìm thấy slot.' }
  if ((slot.exhibitors as any).user_id !== user.id) return { error: 'Không có quyền xóa slot này.' }
  if (!slot.is_open) return { error: 'Không thể xóa slot đã được đặt.' }

  await supabase.from('slots').delete().eq('id', slotId)
  revalidatePath('/exhibitor/slots')
  return { success: true }
}

export async function updateExhibitorProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  await supabase.from('profiles').update({
    full_name: formData.get('fullName') as string,
    company: formData.get('company') as string,
    phone: formData.get('phone') as string,
    country: formData.get('country') as string,
  }).eq('id', user.id)

  const { data: exhibitor } = await supabase
    .from('exhibitors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (exhibitor) {
    await supabase.from('exhibitors').update({
      name: formData.get('company') as string,
      description: formData.get('description') as string,
      website: formData.get('website') as string,
      booth: formData.get('boothNumber') as string,
      contact_name: formData.get('fullName') as string,
    }).eq('id', exhibitor.id)
  }

  revalidatePath('/exhibitor/settings')
  return { success: true }
}
