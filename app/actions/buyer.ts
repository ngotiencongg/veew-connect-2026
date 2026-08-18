'use server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { generatePassword } from '@/lib/utils'
import { sendBuyerCredentials } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function registerBuyer(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const fullName = formData.get('fullName') as string
  const company = formData.get('company') as string
  const position = formData.get('position') as string
  const phone = formData.get('phone') as string
  const industry = formData.get('industry') as string
  const country = formData.get('country') as string

  // Sign up with a temporary password (they'll reset on first login or be sent credentials)
  const tempPassword = generatePassword(12)
  const admin = createAdminClient()

  const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name: fullName, role: 'buyer' },
  })

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      return { error: 'Email này đã được đăng ký.' }
    }
    return { error: 'Đăng ký thất bại. Vui lòng thử lại.' }
  }

  // Upsert profile
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email,
      name: fullName,
      role: 'buyer',
      status: 'pending',
      company,
      position,
      phone,
      industry,
      country,
      needs: formData.get('needs') as string,
    })

  if (profileError) return { error: 'Lỗi tạo hồ sơ. Vui lòng liên hệ Ban Tổ Chức.' }

  return { success: true }
}

export async function approveBuyer(buyerId: string) {
  const admin = createAdminClient()

  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', buyerId)
    .single()

  if (profileErr || !profile) return { error: 'Không tìm thấy buyer.' }

  const newPassword = generatePassword(10)

  // Update password
  const { error: pwErr } = await admin.auth.admin.updateUserById(buyerId, {
    password: newPassword,
  })
  if (pwErr) return { error: 'Lỗi cập nhật mật khẩu.' }

  const { error: statusErr } = await admin
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', buyerId)

  if (statusErr) return { error: 'Lỗi cập nhật trạng thái.' }

  // Get user email
  const { data: userRes } = await admin.auth.admin.getUserById(buyerId)
  if (!userRes?.user?.email) return { error: 'Không tìm thấy email user.' }

  // Send credentials email
  await sendBuyerCredentials({ to: userRes.user.email, name: profile.full_name, password: newPassword })

  revalidatePath('/admin/buyers')
  return { success: true }
}

export async function rejectBuyer(buyerId: string) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', buyerId)

  if (error) return { error: 'Lỗi từ chối buyer.' }
  revalidatePath('/admin/buyers')
  return { success: true }
}

export async function updateBuyerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.get('fullName') as string,
      company: formData.get('company') as string,
      position: formData.get('position') as string,
      phone: formData.get('phone') as string,
      industry: formData.get('industry') as string,
      country: formData.get('country') as string,
      needs: formData.get('needs') as string,
    })
    .eq('id', user.id)

  if (error) return { error: 'Lỗi cập nhật hồ sơ.' }
  revalidatePath('/buyer/settings')
  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Chưa đăng nhập.' }

  // Re-authenticate
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  if (authError) return { error: 'Mật khẩu hiện tại không đúng.' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: 'Lỗi đổi mật khẩu.' }
  return { success: true }
}
